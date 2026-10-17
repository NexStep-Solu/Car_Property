<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Default global configuration values.
     *
     * NOTE: 'inquiries' is not one of the allowed groups
     * (general|documents|listings|payments|notifications),
     * so the inquiries key lives under 'general'.
     *
     * @var array<string, array{value: mixed, group: string}>
     */
    protected array $defaults = [
        'documents.retention_days' => ['value' => 365, 'group' => 'documents'],
        'documents.max_file_size_mb' => ['value' => 10, 'group' => 'documents'],
        'listings.max_images' => ['value' => 20, 'group' => 'listings'],
        'listings.expired_package_ads_action' => ['value' => 'hide', 'group' => 'listings'],
        'payments.default_currency' => ['value' => 'MMK', 'group' => 'payments'],
        'inquiries.rate_limit_per_hour' => ['value' => 20, 'group' => 'general'],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->defaults as $key => $setting) {
            Setting::set($key, $setting['value'], $setting['group']);
        }

        $this->command->info('Default settings seeded.');
    }
}
