# backend/controllers/user_controller.py (উদাহরণ)
import uuid
from flask import request, jsonify

def register_user():
    # ... আগের রেজিস্ট্রেশন লজিক (ইমেইল/পাসওয়ার্ড নেওয়া) ...
    user_nickname = request.json.get('nickname')
    
    # 🚀 ১. আমাদের রেফারেল লজিকটি এখানে কল করুন
    unique_id = str(uuid.uuid4())[:4]
    invite_code = f"{user_nickname.lower().replace(' ', '')}-{unique_id}"
    invite_link = f"https://onyx-drift.com/join?ref={invite_code}"

    # ২. ডাটাবেসে ইউজার অবজেক্ট তৈরি করার সময় এটি অ্যাড করুন
    new_user = {
        "nickname": user_nickname,
        "inviteCode": invite_code,    # ফ্রন্টএন্ডে এটি userData.inviteCode হিসেবে আসবে
        "inviteLink": invite_link,
        "inviteCount": 0,             # শুরুতে ০ জন ইনভাইট
        "referrals": [],              # কাদের জয়েন করিয়েছে তাদের লিস্ট
        "neuralRank": "Neophyte",     # ডিফল্ট র‍্যাঙ্ক
        "badge": "Newbie"             # ডিফল্ট ব্যাজ
    }
    
    # ৩. ডাটাবেসে সেভ করুন
    # db.users.insert_one(new_user)
    
    return jsonify({"message": "Drifter Registered!", "invite": invite_link})