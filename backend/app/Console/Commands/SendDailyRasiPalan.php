<?php

namespace App\Console\Commands;

use App\Http\Controllers\NotificationController;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SendDailyRasiPalan extends Command
{
    protected $signature = 'astrology:send-daily-rasi';

    protected $description = 'Broadcast today\'s rasi palan predictions to all opted-in users';

    public function handle(): int
    {
        $setting = DB::table('system_settings')
            ->where('key', 'daily_rasi_notification_enabled')
            ->first();

        if ($setting && $setting->value === '0') {
            $this->info('Daily rasi notification is disabled by admin. Skipping.');
            return self::SUCCESS;
        }

        $today = date('Y-m-d');

        $predictions = DB::table('rasi_palans')
            ->where('prediction_date', $today)
            ->where('tab_type', 'daily')
            ->get();

        if ($predictions->isEmpty()) {
            $this->info('No rasi palan predictions found for ' . $today . '. Skipping.');
            return self::SUCCESS;
        }

        $users = DB::table('users')
            ->where('role', 'user')
            ->where('status', 'active')
            ->where('daily_rasi_notification', true)
            ->get();

        if ($users->isEmpty()) {
            $this->info('No opted-in users found.');
            return self::SUCCESS;
        }

        $sentCount = 0;

        foreach ($users as $user) {
            $jathagam = $user->jathagam_details ? json_decode($user->jathagam_details) : null;
            $userRasi = $jathagam->rasi ?? null;

            $predictionText = 'இன்றைய ராசி பலன் உங்களுக்காக தயாராக உள்ளது.';
            if ($userRasi) {
                $userPrediction = $predictions->firstWhere('rasi_name', $userRasi);
                if ($userPrediction) {
                    $predictionText = $userPrediction->prediction_text;
                }
            }

            $title = 'இன்றைய ராசி பலன் — ' . $today;
            $body = $userRasi
                ? "உங்கள் ராசி ({$userRasi}): {$predictionText}"
                : $predictionText;

            NotificationController::createForUser(
                (int) $user->id,
                $title,
                $body,
                'rasi_palan',
                ['date' => $today, 'rasi' => $userRasi]
            );

            $sentCount++;
        }

        $this->info("Daily rasi palan notification sent to {$sentCount} user(s).");
        return self::SUCCESS;
    }
}
