<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
    ];

    /**
     * Get a setting value, cast by its stored type.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        if (! $setting || $setting->value === null) {
            return $default;
        }

        return match ($setting->type) {
            'int' => (int) $setting->value,
            'bool' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($setting->value, true) ?? $default,
            default => $setting->value,
        };
    }

    /**
     * Store a setting value, inferring its type.
     */
    public static function set(string $key, mixed $value, string $group = 'general'): void
    {
        $type = match (true) {
            is_int($value) => 'int',
            is_bool($value) => 'bool',
            is_array($value) => 'json',
            default => 'string',
        };

        $stored = match (true) {
            is_bool($value) => $value ? '1' : '0',
            is_array($value) => json_encode($value),
            $value === null => null,
            default => (string) $value,
        };

        static::updateOrCreate(
            ['key' => $key],
            ['value' => $stored, 'group' => $group, 'type' => $type]
        );
    }
}
