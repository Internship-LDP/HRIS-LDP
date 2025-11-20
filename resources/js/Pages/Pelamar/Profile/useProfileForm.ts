import { useEffect, useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import {
    ApplicantProfilePayload,
    ApplicantProfileForm,
    createEmptyEducation,
    createEmptyExperience,
    Education,
    Experience,
    FeedbackState,
    RequiredEducationField,
    SectionKey,
    isEducationComplete,
} from './profileTypes';

export function useProfileForm(profile: ApplicantProfilePayload) {
    const form = useForm<ApplicantProfileForm>({
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
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(
        profile.profile_photo_url ?? null,
    );
    const [feedback, setFeedback] = useState<FeedbackState>(null);
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
        form.setData('personal', {
            ...form.data.personal,
            [key]: value,
        });
    };

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        form.setData('profile_photo', file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleEducationChange = (
        id: string,
        key: keyof Education,
        value: string,
    ) => {
        const updated = form.data.educations.map((item) =>
            item.id === id ? { ...item, [key]: value } : item,
        );
        form.setData('educations', updated);
    };

    const handleExperienceChange = (
        id: string,
        key: keyof Experience,
        value: string | boolean,
    ) => {
        const updated = form.data.experiences.map((item) =>
            item.id === id ? { ...item, [key]: value } : item,
        );
        form.setData('experiences', updated);
    };

    const addEducation = () => {
        form.setData('educations', [
            ...form.data.educations,
            createEmptyEducation(),
        ]);
    };

    const removeEducation = (id: string) => {
        const updated = form.data.educations.filter((item) => item.id !== id);
        form.setData(
            'educations',
            updated.length === 0 ? [createEmptyEducation()] : updated,
        );
    };

    const addExperience = () => {
        form.setData('experiences', [
            ...form.data.experiences,
            createEmptyExperience(),
        ]);
    };

    const removeExperience = (id: string) => {
        form.setData(
            'experiences',
            form.data.experiences.filter((item) => item.id !== id),
        );
    };

    const submitSection = (section: SectionKey) => {
        setSubmittingSection(section);
        form.transform((data) => ({ ...data, section }));
        form.post(route('pelamar.profile.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (section === 'personal') {
                    form.setData('profile_photo', null);
                    router.reload({ only: ['profile'] });
                }
                setFeedback({
                    type: 'success',
                    message:
                        section === 'personal'
                            ? 'Data pribadi berhasil disimpan.'
                            : section === 'education'
                              ? 'Data pendidikan berhasil disimpan.'
                              : 'Data pengalaman berhasil disimpan.',
                });
            },
            onError: () => {
                setFeedback({
                    type: 'error',
                    message:
                        section === 'education'
                            ? 'Periksa kembali data pendidikan yang wajib diisi.'
                            : 'Gagal menyimpan data, silakan coba lagi.',
                });
            },
            onFinish: () => setSubmittingSection(null),
        });
    };

    const getEducationError = (
        index: number,
        field: RequiredEducationField,
    ) => form.errors[`educations.${index}.${field}`];

    const handleReset = () => {
        form.reset();
        setPhotoPreview(profile.profile_photo_url ?? null);
    };

    return {
        form,
        photoPreview,
        feedback,
        setFeedback,
        submittingSection,
        completionPercentage,
        setPersonalField,
        handlePhotoChange,
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
