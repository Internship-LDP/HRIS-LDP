<?php

namespace App\Http\Requests\AdminStaff;

use Illuminate\Foundation\Http\FormRequest;

class StoreLetterRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (! $user) {
            return false;
        }

        if ($user->role === \App\Models\User::ROLES['staff']) {
            return true;
        }

        return $user->role === \App\Models\User::ROLES['admin']
            && ! $user->belongsToHumanCapitalDivision();
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'target_division' => ['required', 'string', 'max:255'],
            'penerima' => ['required', 'string', 'max:255'],
            'perihal' => ['required', 'string', 'max:255'],
            'isi_surat' => ['required', 'string'],
            'jenis_surat' => ['required', 'string', 'max:100'],
            'kategori' => ['required', 'string', 'max:100'],
            'prioritas' => ['required', 'string', 'in:high,medium,low'],
            'lampiran' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }
}
