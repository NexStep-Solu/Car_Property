<?php

namespace App\Http\Requests\Api\V1\Seller;

use Illuminate\Foundation\Http\FormRequest;

class UploadCarImageRequest extends FormRequest
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
            'image' => 'required|file|mimes:jpg,jpeg,png,webp|max:5120',
            'alt_text' => 'nullable|string|max:180',
        ];
    }
}
