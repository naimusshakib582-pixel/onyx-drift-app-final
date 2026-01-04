router.put("/update-profile", auth, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { nickname, bio, location } = req.body;
    let updateFields = { name: nickname, bio, location };

    if (req.files) {
      if (req.files.avatar) updateFields.avatar = req.files.avatar[0].path;
      if (req.files.cover) updateFields.coverImg = req.files.cover[0].path; // coverImg ম্যাচিং
    }

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: req.user.id }, // আপনার middleware থেকে আসা ID
      { $set: updateFields },
      { new: true, upsert: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: 'Update Failed', error: err.message });
  }
});