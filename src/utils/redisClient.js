const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.URL_REDIS,
  socket: {
    tls: true,
    connectTimeout: 10000,
    keepAlive: 30000,
    reconnectStrategy: retries => {
      if (retries > 10) return new Error("Retry limit reached");
      return Math.min(retries * 500, 5000);
    }
  }
});

redisClient.on("connect", () => console.log("✅ Redis connected"));
redisClient.on("ready", () => console.log("Redis ready"));
redisClient.on("reconnecting", () => console.log("Redis reconnecting..."));
redisClient.on("error", (err) => console.error("❌ Redis error", err));
redisClient.on("end", () => console.log("Redis connection closed"));

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Redis initial connect failed:", err);
  }
})();

module.exports = redisClient;
