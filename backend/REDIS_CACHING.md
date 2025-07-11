# Redis Caching Implementation for ToDo App

This implementation adds Redis caching to significantly reduce database load in the cron job system.

## 🚀 Performance Benefits

### Before Redis Caching:

- **Database Queries**: Every minute, the cron job queries MongoDB for due tasks
- **Memory Usage**: In-memory Map for notification tracking (resets on server restart)
- **Load**: High database load during peak usage
- **Scalability**: Limited to single server instance

### After Redis Caching:

- **Database Queries**: Cached for 5 minutes, reducing DB load by ~80%
- **Memory Usage**: Persistent Redis storage, survives server restarts
- **Load**: Minimal database load, faster response times
- **Scalability**: Supports multiple server instances with shared cache

## 📋 Features Implemented

### 1. Task Caching (`CronCacheService`)

- **Due Tasks Cache**: 5-minute TTL for tasks due within 30 minutes
- **Overdue Tasks Cache**: 5-minute TTL for overdue tasks
- **Smart Cache Keys**: Include timestamps to ensure data freshness

### 2. Notification Tracking

- **Redis-based Tracking**: Replaces in-memory Map with persistent Redis storage
- **Configurable Cooldowns**: 25 minutes for reminders, 1 hour for overdue notifications
- **Automatic Cleanup**: Removes old notification records every hour

### 3. Cache Invalidation

- **Task Operations**: Automatically invalidate cache when tasks are created/updated/deleted
- **Manual Invalidation**: Methods to clear specific cache patterns when needed

### 4. Optimized Cron Jobs

- **Reduced DB Load**: Uses cached data instead of direct database queries
- **Better Performance**: Faster execution with Redis queries
- **Error Handling**: Graceful fallback to database if Redis fails

## 🛠 Installation & Setup

### 1. Install Redis (Choose one option)

#### Option A: Local Redis (Development)

```powershell
# Using Chocolatey
choco install redis-64

# Or download from: https://github.com/microsoftarchive/redis/releases
```

#### Option B: Docker Redis

```powershell
docker run --name redis-todo -p 6379:6379 -d redis:alpine
```

#### Option C: Redis Cloud (Production)

- Sign up at [Redis Cloud](https://redis.com/try-free/)
- Get connection details and update `.env`

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Update Redis configuration in .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 3. Update Your Application

The Redis integration is already implemented. To use it:

1. **Start Redis Server** (if using local Redis)
2. **Update index.ts** - The optimized cron jobs are already configured
3. **Restart your application**

## 📊 Performance Monitoring

### Cache Hit Rates

Monitor your Redis cache performance:

```typescript
// Add to your monitoring dashboard
const cacheStats = await redis.info("stats");
console.log("Cache hit rate:", cacheStats);
```

### Database Query Reduction

- **Before**: 1 query per minute (1,440 queries/day)
- **After**: 1 query per 5 minutes (288 queries/day)
- **Reduction**: ~80% fewer database queries

## 🔧 Configuration Options

### Cache TTL Settings

```typescript
// In cronCacheService.ts
private static readonly CACHE_TTL = {
  TASKS: 300,        // 5 minutes - adjust based on your needs
  NOTIFICATIONS: 7200 // 2 hours - notification cooldown period
};
```

### Notification Cooldowns

```typescript
// Reminder notifications: 25 minutes
await CronCacheService.wasRecentlyNotified(taskId, "reminder", 25);

// Overdue notifications: 60 minutes
await CronCacheService.wasRecentlyNotified(taskId, "overdue", 60);
```

## 🎯 Usage Examples

### Switch Between Cron Versions

```typescript
// In index.ts
// Use optimized version with Redis (recommended)
initializeOptimizedCronJobs();

// Or use original version without caching
// initializeCronJobs();
```

### Manual Cache Operations

```typescript
// Clear all task caches
await CronCacheService.invalidateTasksCache();

// Clean up old notifications
await CronCacheService.cleanupOldCache();

// Check if task was recently notified
const wasNotified = await CronCacheService.wasRecentlyNotified(
  taskId,
  "reminder"
);
```

## 🐛 Troubleshooting

### Redis Connection Issues

```typescript
// Check Redis connection
const redis = RedisClient.getInstance();
try {
  await redis.ping();
  console.log("Redis connected ✅");
} catch (error) {
  console.log("Redis connection failed ❌", error);
}
```

### Cache Debugging

```typescript
// View cache contents
const keys = await redis.keys("cron:*");
console.log("Active cache keys:", keys);

// View specific cache entry
const cached = await redis.get("cron:due_tasks:123456");
console.log("Cached data:", JSON.parse(cached));
```

### Performance Issues

1. **Increase cache TTL** if your tasks don't change frequently
2. **Adjust cron frequency** - run less frequently if acceptable
3. **Monitor Redis memory usage** and configure eviction policies

## 🚀 Production Deployment

### Redis Configuration for Production

```env
# Use Redis Cloud or AWS ElastiCache
REDIS_HOST=your-production-redis-host
REDIS_PORT=6380
REDIS_PASSWORD=your-secure-password
```

### Monitoring & Alerts

- Set up Redis monitoring (memory usage, connection count)
- Monitor cache hit rates
- Alert on Redis connection failures

### Scaling Considerations

- Redis can handle multiple application instances
- Consider Redis Cluster for high availability
- Implement Redis backup strategy

## 📈 Expected Performance Improvements

### Database Load

- **80% reduction** in MongoDB queries during cron execution
- **Faster query response times** due to reduced DB load
- **Better database connection pool utilization**

### Application Performance

- **Reduced cron job execution time** (cached data retrieval)
- **Lower memory usage** on application servers
- **Better scalability** with multiple server instances

### User Experience

- **Consistent notification timing** (not affected by DB performance)
- **Reduced server load** during peak hours
- **Better application responsiveness**

## 🔄 Migration Path

### Step 1: Test in Development

1. Install Redis locally
2. Run both cron versions side by side
3. Compare performance and accuracy

### Step 2: Gradual Production Rollout

1. Deploy with Redis but keep original cron as fallback
2. Monitor for 24-48 hours
3. Switch to optimized version when confident

### Step 3: Full Migration

1. Remove original cron service
2. Monitor performance improvements
3. Optimize cache settings based on usage patterns

This Redis caching implementation provides significant performance improvements while maintaining data consistency and reliability.
