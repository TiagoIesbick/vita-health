import redis
from os import getenv
from broadcaster import Broadcast


redis_host = getenv('REDIS_HOST')
redis_port = getenv('REDIS_PORT')
redis_client = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
pubsub = Broadcast(rf"redis://{redis_host}:{redis_port}")
