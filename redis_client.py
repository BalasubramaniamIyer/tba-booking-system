import redis

# Connect to our Docker Redis container
redis_db = redis.Redis(host='127.0.0.1', port=6380, db=0, decode_responses=True)