def update_user_neural_rank(user_id, db):
    """
    ইউজারের রিক্রুট (referrals) সংখ্যা অনুযায়ী ব্যাজ এবং র‍্যাঙ্ক আপডেট করার লজিক।
    """
    # ১. ডাটাবেস থেকে ইউজারের রেফারেল সংখ্যা আনুন
    user = db.users.find_one({"_id": user_id})
    recruit_count = len(user.get('referrals', []))
    
    current_badge = "Newbie"
    neural_rank = 0
    
    # ২. গ্যামিফিকেশন লজিক (Milestones)
    if recruit_count >= 50:
        current_badge = "Neural Overlord"
        neural_rank = 5
    elif recruit_count >= 20:
        current_badge = "Elite Drifter"
        neural_rank = 4
    elif recruit_count >= 10:
        current_badge = "Tech Pioneer"
        neural_rank = 3
    elif recruit_count >= 5:
        current_badge = "Neural Alpha" # ৫ জন হলে এই ব্যাজ পাবে
        neural_rank = 2
    elif recruit_count >= 1:
        current_badge = "Initiated"
        neural_rank = 1

    # ৩. ডাটাবেসে আপডেট করা
    db.users.update_one(
        {"_id": user_id},
        {"$set": {
            "badge": current_badge,
            "rank_level": neural_rank,
            "is_verified": recruit_count >= 10 # ১০ জন হলে অটো ভেরিফাইড!
        }}
    )
    
    return {"badge": current_badge, "rank": neural_rank}