<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Car>
 */
class CarFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'seller_user_id' => User::factory(),
            'title' => fake()->words(3, true).' '.fake()->year(),
            'year' => 2020,
            'price_amount' => fake()->numberBetween(5000, 80000),
            'currency' => 'USD',
            'location' => fake()->city(),
            'condition' => 'used',
            'status' => 'draft',
        ];
    }
}
