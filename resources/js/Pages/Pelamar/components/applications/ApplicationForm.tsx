import { FormEvent } from 'react';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Upload } from 'lucide-react';

export interface ApplicationFormData {
    full_name: string;
    email: string;
    phone: string;
    position: string;
    education: string;
    experience: string;
    skills: string;
}

interface ApplicationFormProps {
    positions: string[];
    data: ApplicationFormData;
    errors: Record<string, string>;
    processing: boolean;
    setData: <K extends keyof ApplicationFormData>(
        field: K,
        value: ApplicationFormData[K],
    ) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function ApplicationForm({
    positions,
    data,
    errors,
    processing,
    setData,
    onSubmit,
}: ApplicationFormProps) {
    return (
        <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-blue-900">
                Form Lamaran
            </h3>
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="fullname">Nama Lengkap</Label>
                    <Input
                        id="fullname"
                        value={data.full_name}
                        onChange={(event) => setData('full_name', event.target.value)}
                        placeholder="Masukkan nama lengkap"
                    />
                    {errors.full_name && (
                        <p className="mt-1 text-xs text-red-500">{errors.full_name}</p>
                    )}
                </div>
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        placeholder="email@example.com"
                    />
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                </div>
                <div>
                    <Label htmlFor="phone">No. Telepon</Label>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(event) => setData('phone', event.target.value)}
                        placeholder="081234567890"
                    />
                    {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                    )}
                </div>
                <div>
                    <Label>Posisi yang Dilamar</Label>
                    <Select
                        value={data.position || undefined}
                        onValueChange={(value) => setData('position', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih posisi" />
                        </SelectTrigger>
                        <SelectContent>
                            {positions.map((position) => (
                                <SelectItem key={position} value={position}>
                                    {position}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.position && (
                        <p className="mt-1 text-xs text-red-500">{errors.position}</p>
                    )}
                </div>
                <div>
                    <Label htmlFor="education">Pendidikan Terakhir</Label>
                    <Input
                        id="education"
                        value={data.education}
                        onChange={(event) => setData('education', event.target.value)}
                        placeholder="S1 Informatika"
                    />
                    {errors.education && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.education}
                        </p>
                    )}
                </div>
                <div>
                    <Label htmlFor="experience">Pengalaman Kerja</Label>
                    <Input
                        id="experience"
                        value={data.experience}
                        onChange={(event) => setData('experience', event.target.value)}
                        placeholder="3 tahun"
                    />
                    {errors.experience && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.experience}
                        </p>
                    )}
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="skills">Keahlian</Label>
                    <Textarea
                        id="skills"
                        value={data.skills}
                        onChange={(event) => setData('skills', event.target.value)}
                        placeholder="Sebutkan keahlian Anda (pisahkan dengan koma)"
                    />
                    {errors.skills && (
                        <p className="mt-1 text-xs text-red-500">{errors.skills}</p>
                    )}
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="cv">Upload CV (PDF)</Label>
                    <div className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-blue-500">
                        <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                        <p className="text-sm text-slate-600">
                            Klik untuk upload atau drag & drop
                        </p>
                        <p className="text-xs text-slate-400">PDF, maks 5MB</p>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <Button
                        type="submit"
                        className="bg-blue-900 hover:bg-blue-800"
                        disabled={processing}
                    >
                        Submit Lamaran
                    </Button>
                </div>
            </form>
        </Card>
    );
}
