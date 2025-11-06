<?php

namespace App\Http\Requests\SuperAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StoreSuratRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === \App\Models\User::ROLES['super_admin']
            || $this->user()?->role === \App\Models\User::ROLES['admin']
            || $this->user()?->role === \App\Models\User::ROLES['staff'];
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'penerima' => ['required', 'string', 'max:255'],
            'perihal' => ['required', 'string', 'max:255'],
            'isi_surat' => ['required', 'string'],
            'jenis_surat' => ['required', 'string', 'max:100'],
            'kategori' => ['required', 'string', 'max:100'],
            'prioritas' => ['required', 'string', 'in:high,medium,low'],
            'alamat_pengirim' => ['required', 'string'],
            'lampiran' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'tipe_surat' => ['nullable', 'string', 'in:masuk,keluar'],
        ];
    }
}
