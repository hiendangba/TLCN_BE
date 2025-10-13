const redisClient = require("../config/redis");

async function setCache(key, value, ttl = 3600) {
  await redisClient.set(key, JSON.stringify(value), { EX: ttl });
}

async function getCache(key) {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
}

async function deleteCache(key) {
  await redisClient.del(key);
}

module.exports = { setCache, getCache, deleteCache };