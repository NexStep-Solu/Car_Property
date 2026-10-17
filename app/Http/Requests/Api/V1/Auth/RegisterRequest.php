<?php

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
            'name' => 'required|string|max:150',
            'email' => 'required_without:phone|email|max:254|unique:users',
            'phone' => 'required_without:email|string|max:30|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'preferred_language' => 'nullable|string|size:2',
        ];
    }
}
