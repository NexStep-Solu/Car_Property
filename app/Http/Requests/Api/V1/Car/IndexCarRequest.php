<?php

namespace App\Http\Requests\Api\V1\Car;

use Illuminate\Foundation\Http\FormRequest;

class IndexCarRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'q' => 'nullable|string|max:180',
            'make' => 'nullable|string|max:100',
            'make_id' => 'nullable|integer|exists:car_makes,id',
            'model_id' => 'nullable|integer|exists:car_models,id',
            'category_id' => 'nullable|integer|exists:car_categories,id',
            'min_price' => 'nullable|integer|min:0',
            'max_price' => 'nullable|integer|min:0|gte:min_price',
            'year_from' => 'nullable|integer|between:1950,2100',
            'year_to' => 'nullable|integer|between:1950,2100|gte:year_from',
            'min_mileage' => 'nullable|integer|min:0',
            'max_mileage' => 'nullable|integer|min:0|gte:min_mileage',
            'transmission' => 'nullable|string|max:30',
            'fuel_type' => 'nullable|string|max:30',
            'body_type' => 'nullable|string|max:40',
            'condition' => 'nullable|string|in:new,used,reconditioned',
            'location' => 'nullable|string|max:180',
            'region' => 'nullable|string|max:100',
            'featured' => 'nullable|boolean',
            'sort' => 'nullable|string|in:newest,price_asc,price_desc,mileage_asc,year_desc',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ];
    }
}
