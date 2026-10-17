<?php

namespace App\Http\Requests\Api\V1\Seller;

use App\Enums\CarCondition;
use App\Enums\FuelType;
use App\Enums\TransmissionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCarRequest extends FormRequest
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
            'showroom_id' => 'nullable|exists:showrooms,id',
            'title' => 'required|string|max:180',
            'make_id' => 'nullable|exists:car_makes,id',
            'model_id' => 'nullable|exists:car_models,id',
            'category_id' => 'nullable|exists:car_categories,id',
            'year' => 'required|integer|between:1950,2100',
            'price' => 'required|integer|min:0',
            'currency' => 'required|string|size:3',
            'mileage' => 'nullable|integer|min:0',
            'transmission' => ['nullable', Rule::in(array_column(TransmissionType::cases(), 'value'))],
            'fuel_type' => ['nullable', Rule::in(array_column(FuelType::cases(), 'value'))],
            'body_type' => 'nullable|string|max:40',
            'color' => 'nullable|string|max:40',
            'location' => 'required|string|max:180',
            'description' => 'nullable|string',
            'condition' => ['required', Rule::in(array_column(CarCondition::cases(), 'value'))],
        ];
    }
}
