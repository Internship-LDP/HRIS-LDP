import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import PelamarLayout from '@/Pages/Pelamar/Layout';
import { PageProps } from '@/types';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Components/ui/tabs';
import { Button } from '@/Components/ui/button';
import { Edit, X, Lock, AlertTriangle } from 'lucide-react';
import ProfileHeader from './Profile/components/ProfileHeader';
import PersonalForm from './Profile/components/PersonalForm';
import EducationForm from './Profile/components/EducationForm';
import ExperienceForm from './Profile/components/ExperienceForm';
import { useProfileForm } from './Profile/useProfileForm';
import { ApplicantProfilePayload, SectionKey } from './Profile/profileTypes';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';

type ProfilePageProps = PageProps<{
    profile: ApplicantProfilePayload;
    profileReminderMessage?: string | null;
    hasApplications?: boolean;
}>;

const AVATAR_SIZE = 160;

export default function Profile({
    profile,
    profileReminderMessage,
    hasApplications = false,
}: ProfilePageProps) {
    const {
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
    } = useProfileForm(profile);
    const [reminderOpen, setReminderOpen] = useState(
        Boolean(profileReminderMessage),
    );
    const [isEditing, setIsEditing] = useState(false);
    const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
    const [pendingSaveSection, setPendingSaveSection] = useState<SectionKey | null>(null);

    useEffect(() => {
        setReminderOpen(Boolean(profileReminderMessage));
    }, [profileReminderMessage]);
    const flatErrors = form.errors as Record<string, string>;

    // Check section completion status
    const isPersonalComplete = Boolean(
        form.data.personal.full_name &&
        form.data.personal.email &&
        form.data.personal.phone &&
        form.data.personal.date_of_birth &&
        form.data.personal.gender &&
        form.data.personal.religion &&
        form.data.personal.address &&
        form.data.personal.city &&
        form.data.personal.province
    );

    const isEducationComplete = form.data.educations.length > 0 &&
        form.data.educations.every(edu =>
            edu.institution && edu.degree && edu.field_of_study && edu.start_year && edu.end_year
        );

    // Experience is optional, so it's "complete" if empty or all filled
    const isExperienceComplete = form.data.experiences.length === 0 ||
        form.data.experiences.every(exp =>
            exp.company && exp.position && exp.start_date
        );

    // Get tab style class
    const getTabClassName = (isComplete: boolean) => {
        if (isComplete) {
            return 'data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 data-[state=inactive]:bg-emerald-50 data-[state=inactive]:text-emerald-600 border border-emerald-200';
        }
        return 'data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 data-[state=inactive]:bg-amber-50 data-[state=inactive]:text-amber-600 border border-amber-200';
    };

    // Handle save with confirmation
    const handleSaveWithConfirmation = (section: SectionKey) => {
        setPendingSaveSection(section);
        setConfirmSaveOpen(true);
    };

    const confirmAndSave = () => {
        if (pendingSaveSection) {
            submitSection(pendingSaveSection);
        }
        setConfirmSaveOpen(false);
        setPendingSaveSection(null);
    };

    return (
        <>
            <Head title="Profil Pelamar" />
            <PelamarLayout
                title="Profil Pelamar"
                description="Lengkapi informasi diri untuk dapat mengajukan lamaran"
                breadcrumbs={['Dashboard', 'Profil']}
            >
                <ProfileHeader
                    avatarSize={AVATAR_SIZE}
                    photoPreview={photoPreview ?? profile.profile_photo_url ?? null}
                    photoChanged={photoChanged}
                    onPhotoChange={handlePhotoChange}
                    onPhotoSave={handlePhotoSave}
                    onPhotoCancel={handlePhotoCancel}
                    fullName={form.data.personal.full_name}
                    email={form.data.personal.email}
                    completion={completionPercentage}
                    savingPhoto={form.processing && submittingSection === 'photo'}
                    disabled={hasApplications}
                />

                {/* Locked Profile Warning */}
                {hasApplications && (
                    <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <Lock className="h-5 w-5 text-amber-600" />
                        <div>
                            <p className="font-medium text-amber-800">Profil Terkunci</p>
                            <p className="text-sm text-amber-700">
                                Anda sudah mengajukan lamaran. Profil tidak dapat diubah untuk menjaga konsistensi data.
                            </p>
                        </div>
                    </div>
                )}

                {/* Edit Mode Toggle Button */}
                <div className="mb-6 flex justify-end">
                    {hasApplications ? (
                        <Button disabled variant="outline" className="cursor-not-allowed opacity-60">
                            <Lock className="mr-2 h-4 w-4" />
                            Profil Terkunci
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(!isEditing)}
                            variant={isEditing ? "destructive" : "default"}
                            className={isEditing ? "" : "bg-blue-900 hover:bg-blue-800"}
                        >
                            {isEditing ? (
                                <>
                                    <X className="mr-2 h-4 w-4" />
                                    Batalkan Edit
                                </>
                            ) : (
                                <>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Profil
                                </>
                            )}
                        </Button>
                    )}
                </div>

                <Tabs defaultValue="personal" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 gap-1 bg-transparent">
                        <TabsTrigger value="personal" className={getTabClassName(isPersonalComplete)}>
                            Data Pribadi
                        </TabsTrigger>
                        <TabsTrigger value="education" className={getTabClassName(isEducationComplete)}>
                            Pendidikan
                        </TabsTrigger>
                        <TabsTrigger value="experience" className={getTabClassName(false)}>
                            Pengalaman
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal">
                        <PersonalForm
                            data={form.data.personal}
                            errors={form.errors as Record<string, string>}
                            onChange={setPersonalField}
                            onSave={() => handleSaveWithConfirmation('personal')}
                            onReset={handleReset}
                            processing={
                                form.processing && submittingSection === 'personal'
                            }
                            disabled={!isEditing || hasApplications}
                        />
                    </TabsContent>

                    <TabsContent value="education">
                        <EducationForm
                            educations={form.data.educations}
                            errors={flatErrors}
                            baseError={flatErrors['educations']}
                            onChange={handleEducationChange}
                            onAdd={addEducation}
                            onRemove={removeEducation}
                            onSave={() => handleSaveWithConfirmation('education')}
                            processing={
                                form.processing && submittingSection === 'education'
                            }
                            getFieldError={getEducationError}
                            disabled={!isEditing || hasApplications}
                        />
                    </TabsContent>

                    <TabsContent value="experience">
                        <ExperienceForm
                            experiences={form.data.experiences}
                            onChange={handleExperienceChange}
                            onAdd={addExperience}
                            onRemove={removeExperience}
                            onSave={() => handleSaveWithConfirmation('experience')}
                            processing={
                                form.processing && submittingSection === 'experience'
                            }
                            disabled={!isEditing || hasApplications}
                        />
                    </TabsContent>
                </Tabs>
            </PelamarLayout>

            {/* Profile Reminder Dialog */}
            <AlertDialog open={reminderOpen} onOpenChange={setReminderOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Profil belum lengkap</AlertDialogTitle>
                        <AlertDialogDescription>
                            {profileReminderMessage ??
                                'Lengkapi data pribadi dan pendidikan untuk melanjutkan proses lamaran.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            className="bg-blue-900 text-white hover:bg-blue-800"
                            onClick={() => setReminderOpen(false)}
                        >
                            Mengerti
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Confirmation Dialog Before Save */}
            <AlertDialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                            <AlertTriangle className="h-6 w-6 text-amber-600" />
                        </div>
                        <AlertDialogTitle className="text-center">
                            Konfirmasi Simpan Data
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Apakah data yang Anda masukkan sudah benar?
                            <br /><br />
                            <span className="font-medium text-amber-700">
                                Perhatian: Setelah Anda mengajukan lamaran pekerjaan, profil tidak dapat diubah kembali.
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                        <AlertDialogCancel className="flex-1">
                            Periksa Kembali
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                            onClick={confirmAndSave}
                        >
                            Ya, Simpan Data
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
