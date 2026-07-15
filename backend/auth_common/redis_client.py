"""
Cliente de Redis
"""

from config.config import Config
import redis

redis_client = redis.from_url(Config.REDIS_URL, decode_responses=True)