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
import { Edit, X } from 'lucide-react';
import ProfileHeader from './Profile/components/ProfileHeader';
import PersonalForm from './Profile/components/PersonalForm';
import EducationForm from './Profile/components/EducationForm';
import ExperienceForm from './Profile/components/ExperienceForm';
import FeedbackDialog from './Profile/components/FeedbackDialog';
import { useProfileForm } from './Profile/useProfileForm';
import { ApplicantProfilePayload } from './Profile/profileTypes';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';

type ProfilePageProps = PageProps<{
    profile: ApplicantProfilePayload;
    profileReminderMessage?: string | null;
}>;

const AVATAR_SIZE = 160;

export default function Profile({
    profile,
    profileReminderMessage,
}: ProfilePageProps) {
    const {
        form,
        photoPreview,
        photoChanged,
        feedback,
        setFeedback,
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
    
    useEffect(() => {
        setReminderOpen(Boolean(profileReminderMessage));
    }, [profileReminderMessage]);
    const flatErrors = form.errors as Record<string, string>;

    return (
        <>
            <Head title="Profil Pelamar" />
            <PelamarLayout
                title="Profil Pelamar"
                description="Lengkapi informasi diri untuk dapat mengajukan lamaran"
                breadcrumbs={['Dashboard', 'Profil']}
                showProfileReminder={false}
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
                />

                {/* Edit Mode Toggle Button */}
                <div className="mb-6 flex justify-end">
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
                </div>

                <Tabs defaultValue="personal" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="personal">Data Pribadi</TabsTrigger>
                        <TabsTrigger value="education">Pendidikan</TabsTrigger>
                        <TabsTrigger value="experience">Pengalaman</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal">
                        <PersonalForm
                            data={form.data.personal}
                            errors={form.errors as Record<string, string>}
                            onChange={setPersonalField}
                            onSave={() => submitSection('personal')}
                            onReset={handleReset}
                            processing={
                                form.processing && submittingSection === 'personal'
                            }
                            disabled={!isEditing}
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
                            onSave={() => submitSection('education')}
                            processing={
                                form.processing && submittingSection === 'education'
                            }
                            getFieldError={getEducationError}
                            disabled={!isEditing}
                        />
                    </TabsContent>

                    <TabsContent value="experience">
                        <ExperienceForm
                            experiences={form.data.experiences}
                            onChange={handleExperienceChange}
                            onAdd={addExperience}
                            onRemove={removeExperience}
                            onSave={() => submitSection('experience')}
                            processing={
                                form.processing && submittingSection === 'experience'
                            }
                            disabled={!isEditing}
                        />
                    </TabsContent>
                </Tabs>
            </PelamarLayout>

            <FeedbackDialog feedback={feedback} onClose={() => setFeedback(null)} />
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
        </>
    );
}
