<?php

namespace App\Http\Requests\Api\V1\Showroom;

use App\Enums\ShowroomDocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadShowroomDocumentRequest extends FormRequest
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
            'document_type' => ['required', Rule::in(array_column(ShowroomDocumentType::cases(), 'value'))],
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ];
    }
}
