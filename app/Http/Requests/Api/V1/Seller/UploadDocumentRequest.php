<?php

namespace App\Http\Requests\Api\V1\Seller;

use App\Enums\IdentityDocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadDocumentRequest extends FormRequest
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
            'document_type' => ['required', Rule::in(array_column(IdentityDocumentType::cases(), 'value'))],
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ];
    }
}
