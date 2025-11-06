<?php

namespace App\Http\Requests\Staff;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class StoreResignationRequest extends FormRequest
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
            'effective_date' => ['required', 'date', 'after:today'],
            'reason' => ['required', 'string', 'max:2000'],
            'suggestion' => ['nullable', 'string', 'max:2000'],
            'confirmation' => ['accepted'],
        ];
    }
}
