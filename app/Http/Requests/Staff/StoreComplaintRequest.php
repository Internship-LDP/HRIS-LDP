<?php

namespace App\Http\Requests\Staff;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class StoreComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === User::ROLES['staff'];
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'category' => ['required', 'string', 'max:150'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'priority' => ['required', 'in:high,medium,low'],
            'anonymous' => ['nullable', 'boolean'],
            'attachment' => ['nullable', 'file', 'max:5120'],
        ];
    }
}
