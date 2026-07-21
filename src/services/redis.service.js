const redis = require('redis');
const config = require('../config/env');

let client = null;
let isConnected = false;
let connectionAttempted = false;
let connectionFailed = false;

const DEFAULT_TTL = config.CACHE_TTL;

async function getClient() {
  if (connectionFailed) return null;
  if (client && isConnected) return client;
  if (connectionAttempted) return null;

  connectionAttempted = true;

  try {
    client = redis.createClient({
      url: config.REDIS_URL
    });

    client.on('error', (err) => {
      if (isConnected) {
        console.error('Redis Client Error:', err.message);
      }
    });

    client.on('connect', () => {
      console.log('Redis Client Connected');
      isConnected = true;
      connectionFailed = false;
    });

    client.on('end', () => {
      isConnected = false;
    });

    await client.connect();
    isConnected = true;
    connectionFailed = false;
    return client;
  } catch (error) {
    console.warn('Redis is not available. Caching disabled. Application will work without cache.');
    connectionFailed = true;
    isConnected = false;
    client = null;
    return null;
  }
}

async function getFromCache(key) {
  try {
    const redisClient = await getClient();
    if (!redisClient) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
}

async function setToCache(key, data, ttl = DEFAULT_TTL) {
  try {
    const redisClient = await getClient();
    if (!redisClient) return false;
    await redisClient.setEx(key, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    return false;
  }
}

async function deleteFromCache(key) {
  try {
    const redisClient = await getClient();
    if (!redisClient) return false;
    await redisClient.del(key);
    return true;
  } catch (error) {
    return false;
  }
}

async function deleteByPattern(pattern) {
  try {
    const redisClient = await getClient();
    if (!redisClient) return false;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    return false;
  }
}

async function isCacheReady() {
  try {
    const redisClient = await getClient();
    if (!redisClient) return false;
    await redisClient.ping();
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  getFromCache,
  setToCache,
  deleteFromCache,
  deleteByPattern,
  isCacheReady,
  getClient
};