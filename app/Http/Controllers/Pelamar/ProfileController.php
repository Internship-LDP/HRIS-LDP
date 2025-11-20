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
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->role === User::ROLES['pelamar'], 403);

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
            'educations.*.gpa' => ['required', 'string', 'regex:/^\d+(\.\d{1,2})?$/'],
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

        try {
            $validated = $request->validate($rules);
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
