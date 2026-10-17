<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\ExpiredAdsAction;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePackageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'slug' => ['nullable', 'string', 'max:120', Rule::unique('packages', 'slug')],
            'description' => 'nullable|string',
            'price_amount' => 'required|integer|min:0',
            'currency' => 'required|string|size:3',
            'duration_days' => 'required|integer|min:1',
            'active_listing_limit' => 'required|integer|min:0',
            'featured_ads_limit' => 'nullable|integer|min:0',
            'features_json' => 'nullable|array',
            'expired_ads_action' => ['nullable', Rule::in(array_column(ExpiredAdsAction::cases(), 'value'))],
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ];
    }
}
