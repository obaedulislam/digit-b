<?php

use Illuminate\Support\Facades\Schedule;

// Housekeeping. Run `php artisan schedule:run` every minute from cron (see README).
Schedule::command('queue:prune-failed --hours=168')->daily();
Schedule::command('sanctum:prune-expired --hours=24')->daily();
