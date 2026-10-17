<?php

namespace App\Http\Requests\Api\V1\Showroom;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShowroomRequest extends FormRequest
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
            'business_name' => 'sometimes|string|max:180',
            'phone' => 'sometimes|string|max:30',
            'email' => 'nullable|email|max:254',
            'address' => 'sometimes|string',
            'region' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ];
    }
}
