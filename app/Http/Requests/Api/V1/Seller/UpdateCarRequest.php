<?php

namespace App\Http\Requests\Api\V1\Seller;

use App\Enums\CarCondition;
use App\Enums\FuelType;
use App\Enums\TransmissionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCarRequest extends FormRequest
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
            'title' => 'sometimes|string|max:180',
            'make_id' => 'nullable|exists:car_makes,id',
            'model_id' => 'nullable|exists:car_models,id',
            'category_id' => 'nullable|exists:car_categories,id',
            'year' => 'sometimes|integer|between:1950,2100',
            'price' => 'sometimes|integer|min:0',
            'currency' => 'sometimes|string|size:3',
            'mileage' => 'nullable|integer|min:0',
            'transmission' => ['nullable', Rule::in(array_column(TransmissionType::cases(), 'value'))],
            'fuel_type' => ['nullable', Rule::in(array_column(FuelType::cases(), 'value'))],
            'body_type' => 'nullable|string|max:40',
            'color' => 'nullable|string|max:40',
            'location' => 'sometimes|string|max:180',
            'description' => 'nullable|string',
            'condition' => ['sometimes', Rule::in(array_column(CarCondition::cases(), 'value'))],
        ];
    }
}
