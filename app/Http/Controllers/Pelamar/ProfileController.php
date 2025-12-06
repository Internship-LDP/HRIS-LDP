<?php

namespace App\Http\Controllers\Pelamar;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user && $user->role === User::ROLES['pelamar'], 403);

        $profile = $user->ensureApplicantProfile()->fresh();

        $requiredFields = [
            'phone',
            'date_of_birth',
            'gender',
            'religion',
            'address',
            'city',
            'province',
        ];

        $filledCount = collect($requiredFields)
            ->filter(fn (string $field) => filled($profile->{$field}))
            ->count();

        $completion = (int) round(($filledCount / count($requiredFields)) * 100);

        // Check if user has any applications
        $hasApplications = \App\Models\Application::where('user_id', $user->id)->exists();

        return Inertia::render('Pelamar/Profile', [
            'profile' => [
                'id' => $profile->id,
                'full_name' => $profile->full_name ?? $user->name,
                'email' => $profile->email ?? $user->email,
                'phone' => $profile->phone,
                'date_of_birth' => optional($profile->date_of_birth)->format('Y-m-d'),
                'gender' => $profile->gender,
                'religion' => $profile->religion,
                'address' => $profile->address,
                'city' => $profile->city,
                'province' => $profile->province,
                'profile_photo_url' => $this->photoDataUri($profile->profile_photo_path),
                'educations' => $profile->educations ?? [],
                'experiences' => $profile->experiences ?? [],
                'is_complete' => $profile->is_complete,
                'completion_percentage' => max(min($completion, 100), 0),
            ],
            'profileReminderMessage' => session('profile_reminder'),
            'hasApplications' => $hasApplications,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->role === User::ROLES['pelamar'], 403);

        // Block updates if user has already applied
        $hasApplications = \App\Models\Application::where('user_id', $user->id)->exists();
        if ($hasApplications) {
            return redirect()
                ->back()
                ->with('error', 'Profil tidak dapat diubah karena Anda sudah mengajukan lamaran.');
        }

        $profile = $user->ensureApplicantProfile();

        $section = $request->input('section', 'all');

        $personalRules = [
            'personal.full_name' => ['required', 'string', 'max:255'],
            'personal.email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'personal.phone' => ['required', 'string', 'max:30'],
            'personal.date_of_birth' => ['required', 'date', 'before:today'],
            'personal.gender' => ['required', 'string', 'max:20'],
            'personal.religion' => ['required', 'string', 'max:50'],
            'personal.address' => ['required', 'string'],
            'personal.city' => ['required', 'string', 'max:120'],
            'personal.province' => ['required', 'string', 'max:120'],
            'profile_photo' => ['nullable', 'image', 'max:5120'],
        ];

        $educationRules = [
            'educations' => ['required', 'array', 'min:1'],
            'educations.*.institution' => ['required', 'string', 'max:255'],
            'educations.*.degree' => ['required', 'string', 'max:120'],
            'educations.*.field_of_study' => ['required', 'string', 'max:255'],
            'educations.*.start_year' => ['required', 'string', 'regex:/^\d{4}$/'],
            'educations.*.end_year' => ['required', 'string', 'regex:/^\d{4}$/'],
            'educations.*.gpa' => ['nullable', 'numeric', 'between:0,4.00'],
        ];

        $photoRules = [
            'profile_photo' => ['required', 'image', 'max:5120'],
        ];

        $experienceRules = [
            'experiences' => ['nullable', 'array'],
            'experiences.*.company' => ['nullable', 'string', 'max:255'],
            'experiences.*.position' => ['nullable', 'string', 'max:255'],
            'experiences.*.start_date' => ['nullable', 'string', 'max:20'],
            'experiences.*.end_date' => ['nullable', 'string', 'max:20'],
            'experiences.*.description' => ['nullable', 'string'],
            'experiences.*.is_current' => ['nullable', 'boolean'],
        ];

        $rules = match ($section) {
            'personal' => $personalRules,
            'education' => $educationRules,
            'experience' => $experienceRules,
            'photo' => $photoRules,
            default => array_merge($personalRules, $educationRules),
        };

        if ($section === 'experience' && $request->filled('experiences')) {
            $rules = array_merge($rules, $experienceRules);
        }

        // Check if this is a photo-only update
        $isPhotoOnly = in_array($section, ['photo'], true)
            || ($section === 'personal' && $request->hasFile('profile_photo') && ! $request->has('personal'));

        \Log::info('Profile update request received', [
            'user_id' => $user->id,
            'section' => $section,
            'has_photo' => $request->hasFile('profile_photo'),
            'has_personal' => $request->has('personal'),
            'is_photo_only' => $isPhotoOnly,
            'request_keys' => array_keys($request->all()),
        ]);

        if ($isPhotoOnly) {
            // For photo-only updates, only validate the photo
            $rules = $photoRules;
            \Log::info('Using photo-only validation rules');
        }

        // Custom validation messages in Indonesian
        $messages = [
            // Personal data messages
            'personal.full_name.required' => 'Nama lengkap wajib diisi.',
            'personal.full_name.string' => 'Nama lengkap harus berupa teks.',
            'personal.full_name.max' => 'Nama lengkap maksimal 255 karakter.',
            
            'personal.email.required' => 'Email wajib diisi.',
            'personal.email.email' => 'Format email tidak valid.',
            'personal.email.max' => 'Email maksimal 255 karakter.',
            'personal.email.unique' => 'Email sudah digunakan.',
            
            'personal.phone.required' => 'Nomor telepon wajib diisi.',
            'personal.phone.string' => 'Nomor telepon harus berupa teks.',
            'personal.phone.max' => 'Nomor telepon maksimal 30 karakter.',
            
            'personal.date_of_birth.required' => 'Tanggal lahir wajib diisi.',
            'personal.date_of_birth.date' => 'Format tanggal lahir tidak valid.',
            'personal.date_of_birth.before' => 'Tanggal lahir harus sebelum hari ini.',
            
            'personal.gender.required' => 'Jenis kelamin wajib diisi.',
            'personal.gender.string' => 'Jenis kelamin harus berupa teks.',
            'personal.gender.max' => 'Jenis kelamin maksimal 20 karakter.',
            
            'personal.religion.required' => 'Agama wajib diisi.',
            'personal.religion.string' => 'Agama harus berupa teks.',
            'personal.religion.max' => 'Agama maksimal 50 karakter.',
            
            'personal.address.required' => 'Alamat lengkap wajib diisi.',
            'personal.address.string' => 'Alamat harus berupa teks.',
            
            'personal.city.required' => 'Kota/Kabupaten wajib diisi.',
            'personal.city.string' => 'Kota/Kabupaten harus berupa teks.',
            'personal.city.max' => 'Kota/Kabupaten maksimal 120 karakter.',
            
            'personal.province.required' => 'Provinsi wajib diisi.',
            'personal.province.string' => 'Provinsi harus berupa teks.',
            'personal.province.max' => 'Provinsi maksimal 120 karakter.',
            
            // Profile photo messages
            'profile_photo.required' => 'Foto profil wajib diisi.',
            'profile_photo.image' => 'File harus berupa gambar.',
            'profile_photo.max' => 'Ukuran foto maksimal 5MB.',
            
            // Education messages
            'educations.required' => 'Data pendidikan wajib diisi.',
            'educations.array' => 'Data pendidikan harus berupa array.',
            'educations.min' => 'Minimal satu data pendidikan harus diisi.',
            
            'educations.*.institution.required' => 'Nama institusi wajib diisi.',
            'educations.*.institution.string' => 'Nama institusi harus berupa teks.',
            'educations.*.institution.max' => 'Nama institusi maksimal 255 karakter.',
            
            'educations.*.degree.required' => 'Jenjang pendidikan wajib diisi.',
            'educations.*.degree.string' => 'Jenjang pendidikan harus berupa teks.',
            'educations.*.degree.max' => 'Jenjang pendidikan maksimal 120 karakter.',
            
            'educations.*.field_of_study.required' => 'Jurusan wajib diisi.',
            'educations.*.field_of_study.string' => 'Jurusan harus berupa teks.',
            'educations.*.field_of_study.max' => 'Jurusan maksimal 255 karakter.',
            
            'educations.*.start_year.required' => 'Tahun mulai wajib diisi.',
            'educations.*.start_year.string' => 'Tahun mulai harus berupa teks.',
            'educations.*.start_year.regex' => 'Tahun mulai harus 4 digit angka.',
            
            'educations.*.end_year.required' => 'Tahun selesai wajib diisi.',
            'educations.*.end_year.string' => 'Tahun selesai harus berupa teks.',
            'educations.*.end_year.regex' => 'Tahun selesai harus 4 digit angka.',
            
            'educations.*.gpa.numeric' => 'IPK harus berupa angka.',
            'educations.*.gpa.between' => 'IPK harus antara 0 sampai 4.00.',
            
            // Experience messages
            'experiences.array' => 'Data pengalaman harus berupa array.',
            'experiences.*.company.string' => 'Nama perusahaan harus berupa teks.',
            'experiences.*.company.max' => 'Nama perusahaan maksimal 255 karakter.',
            'experiences.*.position.string' => 'Posisi harus berupa teks.',
            'experiences.*.position.max' => 'Posisi maksimal 255 karakter.',
            'experiences.*.start_date.string' => 'Tanggal mulai harus berupa teks.',
            'experiences.*.start_date.max' => 'Tanggal mulai maksimal 20 karakter.',
            'experiences.*.end_date.string' => 'Tanggal selesai harus berupa teks.',
            'experiences.*.end_date.max' => 'Tanggal selesai maksimal 20 karakter.',
            'experiences.*.description.string' => 'Deskripsi harus berupa teks.',
            'experiences.*.is_current.boolean' => 'Status pekerjaan sekarang harus benar/salah.',
        ];

        try {
            $validated = $request->validate($rules, $messages);
        } catch (ValidationException $exception) {
            if ($section === 'photo') {
                \Log::warning('Profile photo validation failed', [
                    'user_id' => $user->id,
                    'errors' => $exception->errors(),
                ]);
            }

            throw $exception;
        }

        if (($section === 'personal' || $section === 'all') && isset($validated['personal'])) {
            $personal = $validated['personal'];
            $profile->fill([
                'full_name' => $personal['full_name'],
                'email' => $personal['email'],
                'phone' => $personal['phone'],
                'date_of_birth' => $personal['date_of_birth'],
                'gender' => $personal['gender'],
                'religion' => $personal['religion'],
                'address' => $personal['address'],
                'city' => $personal['city'],
                'province' => $personal['province'],
            ]);

            $user->forceFill([
                'name' => $personal['full_name'],
                'email' => $personal['email'],
            ])->save();
        }

        // Handle photo upload (works for both photo-only and full personal updates)
        if ($request->hasFile('profile_photo')) {
            \Log::info('Profile photo upload detected', [
                'user_id' => $user->id,
                'file_name' => $request->file('profile_photo')->getClientOriginalName(),
                'file_size' => $request->file('profile_photo')->getSize(),
            ]);

            try {
                $path = $request->file('profile_photo')->store('applicant-profiles', 'public');

                // Delete old photo if exists
                if ($profile->profile_photo_path && Storage::disk('public')->exists($profile->profile_photo_path)) {
                    Storage::disk('public')->delete($profile->profile_photo_path);
                    \Log::info('Old profile photo deleted', ['path' => $profile->profile_photo_path]);
                }

                $profile->profile_photo_path = $path;
                \Log::info('New profile photo saved', ['path' => $path]);
            } catch (\Exception $e) {
                \Log::error('Profile photo upload failed', [
                    'error' => $e->getMessage(),
                    'user_id' => $user->id,
                ]);
                throw $e;
            }
        }

        if ($section === 'education' || $section === 'all') {
            $educations = $this->normalizeCollection($validated['educations'] ?? []);
            $profile->educations = $educations;
        }

        if ($section === 'experience' || $section === 'all') {
            $experiences = $this->normalizeCollection($validated['experiences'] ?? []);
            $profile->experiences = $experiences;
        }

        $profile->syncCompletionFlag();
        $profile->save();

        return redirect()
            ->route('pelamar.profile')
            ->with('success', 'Profil berhasil diperbarui.');
    }

    private function normalizeCollection(array $items): array
    {
        return collect($items)
            ->map(function (array $item) {
                $sanitized = collect($item)
                    ->mapWithKeys(function ($value, $key) {
                        if (is_string($value)) {
                            return [$key => trim($value)];
                        }

                        return [$key => $value];
                    })
                    ->all();

                return array_merge([
                    'id' => $item['id'] ?? (string) Str::uuid(),
                ], $sanitized);
            })
            ->filter(function (array $item) {
                return collect($item)
                    ->except(['id', 'is_current'])
                    ->contains(fn ($value) => filled($value));
            })
            ->values()
            ->all();
    }

    private function photoDataUri(?string $path): ?string
    {
        if (! $path || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        $contents = Storage::disk('public')->get($path);
        $mime = Storage::disk('public')->mimeType($path) ?? 'image/jpeg';

        return 'data:' . $mime . ';base64,' . base64_encode($contents);
    }
}
