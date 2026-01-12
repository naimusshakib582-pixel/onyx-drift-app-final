# backend/routes/posts.py

@app.route('/api/posts', methods=['GET'])
def get_paginated_posts():
    # ১. পেজ নম্বর এবং লিমিট ধরা
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit

    # ২. ডাটাবেস থেকে স্কিপ করে ডাটা আনা
    posts = list(db.posts.find().sort("createdAt", -1).skip(skip).limit(limit))
    
    # আইডি স্ট্রিং এ কনভার্ট করা (JSON এর জন্য)
    for post in posts:
        post["_id"] = str(post["_id"])

    return jsonify(posts)