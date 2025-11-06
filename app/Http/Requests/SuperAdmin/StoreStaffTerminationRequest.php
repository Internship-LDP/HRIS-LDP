<?php

namespace App\Http\Requests\SuperAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StoreStaffTerminationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === \App\Models\User::ROLES['super_admin']
            || $this->user()?->role === \App\Models\User::ROLES['admin'];
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'employee_code' => ['required', 'string', 'exists:users,employee_code'],
            'type' => ['required', 'in:Resign,PHK,Pensiun'],
            'effective_date' => ['required', 'date'],
            'reason' => ['required', 'string', 'max:2000'],
            'suggestion' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
