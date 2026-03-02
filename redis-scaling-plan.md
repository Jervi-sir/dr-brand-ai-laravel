# Laravel Redis & Queue Scaling Plan

This document outlines the step-by-step implementation for migrating the application's queue and caching systems to **Redis**, and installing **Laravel Horizon** to elegantly manage queue worker saturation. The Reverb WebSocket configuration will remain unchanged.

## Phase 1: Redis Infrastructure Setup

Before configuring Laravel, ensure that a generic Redis datastore is running and accessible to your environment.

### 1. Install Redis locally
If you are developing locally on a Mac, install Redis via Homebrew:
```bash
brew install redis
brew services start redis
```
*(In production, this would be a managed service like AWS ElastiCache, DigitalOcean Managed Redis, or a standalone Redis container).*

### 2. Install PHP Redis Client
Laravel requires the `predis/predis` package or the `phpredis` extension to communicate with Redis. We will use `predis` for simplicity.
```bash
composer require predis/predis
```

---

## Phase 2: Updating Laravel Environment Config

Once Redis is running, update your `.env` variables to completely detach from the database-driven queue and cache implementations.

1. Open your `.env` file.
2. Update the following connection parameters to point to your new Redis datastore:

```ini
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

# Define the Redis connection (Defaults apply nicely for local development)
REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

3. Clear your local configuration cache to enforce the new settings:
```bash
php artisan config:clear
```

---

## Phase 3: Saturated Queue Management with Laravel Horizon

**Laravel Horizon** provides a beautiful dashboard and code-driven configuration for your Redis queues. It is the best way to handle concurrent AI request processing, allowing you to automatically spin up or scale down workers dynamically based on load.

### 1. Install Horizon
```bash
composer require laravel/horizon
php artisan horizon:install
```
This will publish the `config/horizon.php` configuration file and its frontend assets.

### 2. Configure Worker Auto-Scaling
Open `config/horizon.php`. Under the `environments` section, configure your queue workers to scale dynamically. We want to ensure that multiple users querying the AI concurrently don't block each other.

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'maxProcesses' => 20,
            'balanceMaxShift' => 5,
            'balanceCooldown' => 3,
        ],
    ],

    'local' => [
        'supervisor-1' => [
            'maxProcesses' => 5, // Spin up to 5 concurrent AI workers locally!
        ],
    ],
],
```
*Note: The `balance` strategy (set to `auto` by default) will instruct Horizon to automatically spawn new processes up to `maxProcesses` when your chat queues get backed up.*

---

## Phase 4: Running and Monitoring

With the logic shifted from synchronous DB polling to asynchronous Redis pub/sub memory routing, your workflow changes slightly.

### Local Development Workflow
Instead of running `php artisan queue:work` statically:
1. Start the Laravel Horizon daemon:
```bash
php artisan horizon
```
2. In your browser, navigate to:
```text
http://localhost:8000/horizon
```
3. Send multiple concurrent AI chat messages in different windows. You will see Horizon automatically spinning up parallel workers under the "Workers" tab to process them simultaneously without lag!

### Production Deployment via Supervisor
In a live production environment, you should use a process monitor like `Supervisor` to keep Horizon permanently active. Note that you NO LONGER monitor `queue:work` in production, you solely monitor `horizon`.

**Example Supervisor configuration (`/etc/supervisor/conf.d/horizon.conf`):**
```ini
[program:horizon]
process_name=%(program_name)s
command=php /path-to-your-project/artisan horizon
autostart=true
autorestart=true
user=forge
redirect_stderr=true
stdout_logfile=/path-to-your-project/storage/logs/horizon.log
stopwaitsecs=3600
```
