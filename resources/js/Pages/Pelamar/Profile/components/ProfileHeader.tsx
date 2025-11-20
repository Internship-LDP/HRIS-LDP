import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Camera, User as UserIcon } from 'lucide-react';

interface ProfileHeaderProps {
    avatarSize: number;
    photoPreview: string | null;
    onPhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    fullName: string;
    email: string;
    completion: number;
}

export default function ProfileHeader({
    avatarSize,
    photoPreview,
    onPhotoChange,
    fullName,
    email,
    completion,
}: ProfileHeaderProps) {
    return (
        <Card className="flex flex-col gap-6 p-6 md:flex-row md:items-start">
            <div
                className="relative shrink-0"
                style={{ width: avatarSize, height: avatarSize }}
            >
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-blue-900 bg-slate-100 shadow-md">
                    {photoPreview ? (
                        <img
                            src={photoPreview}
                            alt="Foto profil"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <UserIcon className="h-16 w-16" />
                        </div>
                    )}
                </div>
                <label
                    htmlFor="profile-photo"
                    className="absolute bottom-2 right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-900 text-white shadow"
                >
                    <Camera className="h-4 w-4" />
                    <input
                        id="profile-photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onPhotoChange}
                    />
                </label>
            </div>
            <div className="text-center sm:text-left">
                <h2 className="text-xl font-semibold text-blue-900">
                    {fullName || 'Nama Lengkap'}
                </h2>
                <p className="text-sm text-slate-500">
                    {email || 'email@contoh.com'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge className="bg-blue-900 text-white">Pelamar</Badge>
                    <Badge
                        variant="outline"
                        className="border-green-500 text-green-700"
                    >
                        Profil {completion}% Lengkap
                    </Badge>
                </div>
            </div>
        </Card>
    );
}
