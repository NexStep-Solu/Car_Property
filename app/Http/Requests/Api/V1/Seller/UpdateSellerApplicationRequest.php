<?php

namespace App\Http\Requests\Api\V1\Seller;

use App\Enums\SellerType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSellerApplicationRequest extends FormRequest
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
            'seller_type' => ['sometimes', Rule::in(array_column(SellerType::cases(), 'value'))],
            'full_name' => 'sometimes|string|max:150',
            'phone' => 'sometimes|string|max:30',
            'email' => 'nullable|email|max:254',
            'address' => 'nullable|string',
        ];
    }
}
