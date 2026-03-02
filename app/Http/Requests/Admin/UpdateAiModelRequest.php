<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAiModelRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'display_name' => ['required', 'string', 'max:255'],
            'provider' => ['required', 'string', 'max:255'],
            'endpoint' => ['nullable', 'url', 'max:255'],
            'api_key' => ['nullable', 'string', 'max:255'],
            'capability' => ['nullable', 'string'],
            'type' => ['nullable', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
            'max_tokens' => ['nullable', 'integer', 'min:1'],
            'temperature' => ['nullable', 'integer', 'min:0', 'max:100'],
            'custom_prompts' => ['nullable', 'string'],
            'input_price' => ['nullable', 'numeric', 'min:0'],
            'output_price' => ['nullable', 'numeric', 'min:0'],
            'cached_input_price' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
