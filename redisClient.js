const redis = require('redis');

let client = null;
let isConnected = false;
let connectionAttempted = false;
let connectionFailed = false;

const DEFAULT_TTL = 3600; // 1 hour in seconds

async function getClient() {
    // If connection already failed, don't attempt again
    if (connectionFailed) {
        return null;
    }

    // If already connected, return the client
    if (client && isConnected) {
        return client;
    }

    // If connection was already attempted but not established, skip
    if (connectionAttempted) {
        return null;
    }

    connectionAttempted = true;

    try {
        client = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        client.on('error', (err) => {
            // Only log connection errors if they happen after initial setup
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
        if (data) {
            return JSON.parse(data);
        }
        return null;
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