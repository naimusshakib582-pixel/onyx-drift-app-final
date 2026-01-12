# backend/routes/user.py (অথবা যেখানে আপনার প্রোফাইল ক্রিয়েট হয়)

@app.route('/api/user/register', methods=['POST'])
def register_new_drifter():
    data = request.json
    auth0_id = data.get('auth0Id')
    nickname = data.get('nickname')
    
    # 🚀 ১. ফ্রন্টএন্ড থেকে আসা রেফারেল কোডটি ধরুন
    ref_code = data.get('referralCode') 

    # ২. ইউজারের ইউনিক ইনভাইট কোড জেনারেট করা (আগের লজিক)
    import uuid
    my_invite_code = f"{nickname.lower()}-{str(uuid.uuid4())[:4]}"

    # ৩. নতুন ইউজারের অবজেক্ট
    new_user = {
        "auth0Id": auth0_id,
        "nickname": nickname,
        "inviteCode": my_invite_code, # তার নিজের কোড
        "inviteCount": 0,
        "neuralRank": "Neophyte",
        "referredBy": ref_code # সে কার মাধ্যমে এসেছে
    }

    # 🚀 ৪. রেফারেল লজিক (আপনার দেওয়া কোডটি এখানে বসবে)
    if ref_code:
        # যে রেফার করেছে তাকে ডাটাবেসে খোঁজা
        referrer = db.users.find_one({"inviteCode": ref_code})
        
        if referrer:
            # রেফারারের ইনভাইট কাউন্ট ১ বাড়ানো
            db.users.update_one(
                {"_id": referrer["_id"]},
                {"$inc": {"inviteCount": 1}}
            )
            
            # র‍্যাঙ্ক আপডেট লজিক
            current_invites = referrer.get("inviteCount", 0) + 1
            if current_invites >= 10:
                db.users.update_one(
                    {"_id": referrer["_id"]},
                    {"$set": {"neuralRank": "Alpha", "badge": "Viral Master"}}
                )

    # ৫. নতুন ইউজারকে ডাটাবেসে সেভ করা
    db.users.insert_one(new_user)
    
    return jsonify({"status": "success", "message": "Neural Identity Initialized"})