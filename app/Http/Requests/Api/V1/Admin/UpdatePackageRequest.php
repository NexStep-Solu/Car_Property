<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\ExpiredAdsAction;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePackageRequest extends FormRequest
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
            'name' => 'sometimes|required|string|max:100',
            'slug' => ['sometimes', 'nullable', 'string', 'max:120', Rule::unique('packages', 'slug')->ignore($this->route('package'))],
            'description' => 'sometimes|nullable|string',
            'price_amount' => 'sometimes|required|integer|min:0',
            'currency' => 'sometimes|required|string|size:3',
            'duration_days' => 'sometimes|required|integer|min:1',
            'active_listing_limit' => 'sometimes|required|integer|min:0',
            'featured_ads_limit' => 'sometimes|nullable|integer|min:0',
            'features_json' => 'sometimes|nullable|array',
            'expired_ads_action' => ['sometimes', Rule::in(array_column(ExpiredAdsAction::cases(), 'value'))],
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
        ];
    }
}
