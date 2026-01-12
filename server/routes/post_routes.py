import datetime
import math

def calculate_neural_score(post):
    """
    AI Logic: Engagement-based ranking with time decay.
    """
    # ১. ওয়েট সেট করা (কি পরিমাণ গুরুত্ব পাবে)
    WEIGHT_LIKES = 2
    WEIGHT_COMMENTS = 5
    WEIGHT_SHARES = 10
    
    # ২. বর্তমান এঙ্গেজমেন্ট স্কোর
    engagement_score = (
        (post['likes_count'] * WEIGHT_LIKES) +
        (post['comments_count'] * WEIGHT_COMMENTS) +
        (post['shares_count'] * WEIGHT_SHARES)
    )
    
    # ৩. Time Decay (পুরানো পোস্টের গুরুত্ব কমানো)
    # সূত্র: Score / (Age in hours + 2)^Gravity
    post_time = post['created_at'] # assuming it's a datetime object
    hours_since_post = (datetime.datetime.now() - post_time).total_seconds() / 3600
    
    gravity = 1.8 # যত বেশি হবে, পুরানো পোস্ট তত দ্রুত নিচে নেমে যাবে
    decay_factor = math.pow((hours_since_post + 2), gravity)
    
    final_score = engagement_score / decay_factor
    return final_score

# ৪. ফিড সাজানোর ফাংশন
def get_personalized_feed(all_posts):
    # সব পোস্টের স্কোর বের করা
    for post in all_posts:
        post['neural_score'] = calculate_neural_score(post)
    
    # স্কোর অনুযায়ী সর্ট করা (বড় থেকে ছোট)
    sorted_feed = sorted(all_posts, key=lambda x: x['neural_score'], reverse=True)
    return sorted_feed