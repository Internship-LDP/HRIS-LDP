import { useEffect, useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    ApplicantProfilePayload,
    ApplicantProfileForm,
    createEmptyEducation,
    createEmptyExperience,
    Education,
    Experience,
    RequiredEducationField,
    SectionKey,
    isEducationComplete,
} from './profileTypes';

export function useProfileForm(profile: ApplicantProfilePayload) {
    const initialData: ApplicantProfileForm = {
        personal: {
            full_name: profile.full_name ?? '',
            email: profile.email ?? '',
            phone: profile.phone ?? '',
            date_of_birth: profile.date_of_birth ?? '',
            gender: profile.gender ?? '',
            religion: profile.religion ?? '',
            address: profile.address ?? '',
            city: profile.city ?? '',
            province: profile.province ?? '',
        },
        educations:
            profile.educations.length > 0
                ? profile.educations.map((item) => ({ ...item }))
                : [createEmptyEducation()],
        experiences:
            profile.experiences.length > 0
                ? profile.experiences.map((item) => ({ ...item }))
                : [],
        profile_photo: null,
    };
    
    const form = useForm<ApplicantProfileForm>(initialData);

    const [photoPreview, setPhotoPreview] = useState<string | null>(
        profile.profile_photo_url ?? null,
    );
    const [photoChanged, setPhotoChanged] = useState(false);
    const [submittingSection, setSubmittingSection] =
        useState<SectionKey | null>(null);

    useEffect(() => {
        if (profile.profile_photo_url) {
            setPhotoPreview(profile.profile_photo_url);
        }
    }, [profile.profile_photo_url]);

    const completionPercentage = useMemo(() => {
        const fields: (keyof ApplicantProfileForm['personal'])[] = [
            'phone',
            'date_of_birth',
            'gender',
            'religion',
            'address',
            'city',
            'province',
        ];
        const personalProgress =
            fields.filter((field) => Boolean(form.data.personal[field]))
                .length / fields.length;

        const hasValidEducation = form.data.educations.some((education) =>
            isEducationComplete(education),
        );
        const educationProgress = hasValidEducation ? 1 : 0;

        return Math.round(((personalProgress + educationProgress) / 2) * 100);
    }, [form.data.personal, form.data.educations]);

    const setPersonalField = (
        key: keyof ApplicantProfileForm['personal'],
        value: string,
    ) => {
        form.setData({
            ...form.data,
            personal: {
                ...form.data.personal,
                [key]: value,
            },
        });
    };

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        (form.setData as any)('profile_photo', file);
        setPhotoPreview(URL.createObjectURL(file));
        setPhotoChanged(true);
    };

    const handlePhotoSave = () => {
        if (!form.data.profile_photo) {
            return;
        }

        setSubmittingSection('photo');
        form.transform((data) => ({
            profile_photo: data.profile_photo,
            section: 'photo',
        }));
        form.post(route('pelamar.profile.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                (form.setData as any)('profile_photo', null);
                setPhotoChanged(false);
                router.reload({ only: ['profile'] });
                toast.success('Berhasil! ', {
                    description: 'Foto profil berhasil disimpan.',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Gagal Menyimpan ', {
                    description: 'Gagal menyimpan foto profil, silakan coba lagi.',
                    duration: 4000,
                });
            },
            onFinish: () => setSubmittingSection(null),
        });
    };

    const handlePhotoCancel = () => {
        (form.setData as any)('profile_photo', null);
        setPhotoPreview(profile.profile_photo_url ?? null);
        setPhotoChanged(false);
    };

    const handleEducationChange = (
        id: string,
        key: keyof Education,
        value: string,
    ) => {
        const updated = form.data.educations.map((item) =>
            item.id === id ? { ...item, [key]: value } : item,
        );
        form.setData({
            ...form.data,
            educations: updated,
        });
    };

    const handleExperienceChange = (
        id: string,
        key: keyof Experience,
        value: string | boolean,
    ) => {
        const updated = form.data.experiences.map((item) =>
            item.id === id ? { ...item, [key]: value } : item,
        );
        form.setData({
            ...form.data,
            experiences: updated,
        });
    };

    const addEducation = () => {
        form.setData({
            ...form.data,
            educations: [
                ...form.data.educations,
                createEmptyEducation(),
            ],
        });
    };

    const removeEducation = (id: string) => {
        const updated = form.data.educations.filter((item) => item.id !== id);
        form.setData({
            ...form.data,
            educations: updated.length === 0 ? [createEmptyEducation()] : updated,
        });
    };

    const addExperience = () => {
        form.setData({
            ...form.data,
            experiences: [
                ...form.data.experiences,
                createEmptyExperience(),
            ],
        });
    };

    const removeExperience = (id: string) => {
        form.setData({
            ...form.data,
            experiences: form.data.experiences.filter((item) => item.id !== id),
        });
    };

    const submitSection = (section: SectionKey) => {
        setSubmittingSection(section);
        form.transform((data) => ({ ...data, section }));
        form.post(route('pelamar.profile.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (section === 'personal') {
                    (form.setData as any)('profile_photo', null);
                    router.reload({ only: ['profile'] });
                }
                const messages = {
                    personal: 'Data pribadi berhasil disimpan.',
                    education: 'Data pendidikan berhasil disimpan.',
                    experience: 'Data pengalaman berhasil disimpan.',
                    photo: 'Foto profil berhasil disimpan.',
                };
                toast.success('Berhasil! ', {
                    description: messages[section],
                    duration: 3000,
                });
            },
            onError: () => {
                const errorMessages = {
                    personal: 'Gagal menyimpan data pribadi, silakan coba lagi.',
                    education: 'Periksa kembali data pendidikan yang wajib diisi.',
                    experience: 'Gagal menyimpan data pengalaman, silakan coba lagi.',
                    photo: 'Gagal menyimpan foto profil, silakan coba lagi.',
                };
                toast.error('Gagal Menyimpan ', {
                    description: errorMessages[section],
                    duration: 4000,
                });
            },
            onFinish: () => setSubmittingSection(null),
        });
    };

    const getEducationError = (
        index: number,
        field: RequiredEducationField,
    ) => (form.errors as any)[`educations.${index}.${field}`];

    const handleReset = () => {
        form.reset();
        setPhotoPreview(profile.profile_photo_url ?? null);
    };

    return {
        form,
        photoPreview,
        photoChanged,
        submittingSection,
        completionPercentage,
        setPersonalField,
        handlePhotoChange,
        handlePhotoSave,
        handlePhotoCancel,
        handleEducationChange,
        handleExperienceChange,
        addEducation,
        removeEducation,
        addExperience,
        removeExperience,
        submitSection,
        getEducationError,
        handleReset,
    };
}
