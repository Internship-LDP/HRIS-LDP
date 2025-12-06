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
import { Save } from 'lucide-react';
import { ApplicantProfileForm } from '../profileTypes';

interface PersonalFormProps {
    data: ApplicantProfileForm['personal'];
    errors: Record<string, string>;
    onChange: (key: keyof ApplicantProfileForm['personal'], value: string) => void;
    onSave: () => void;
    onReset: () => void;
    processing: boolean;
    disabled?: boolean;
}

export default function PersonalForm({
    data,
    errors,
    onChange,
    onSave,
    onReset,
    processing,
    disabled = false,
}: PersonalFormProps) {
    // Validation: Only letters, spaces, hyphens, and apostrophes
    const handleNameChange = (value: string) => {
        const validNamePattern = /^[a-zA-Z\s\-']*$/;
        if (validNamePattern.test(value) || value === '') {
            onChange('full_name', value);
        }
    };

    // Validation: Must contain @
    const handleEmailChange = (value: string) => {
        onChange('email', value);
    };

    // Validation: Only numbers, 8-12 characters
    const handlePhoneChange = (value: string) => {
        const numbersOnly = value.replace(/\D/g, '');
        if (numbersOnly.length <= 12) {
            onChange('phone', numbersOnly);
        }
    };

    // Validation: Only letters and spaces for city/province
    const handleCityChange = (value: string) => {
        const validCityPattern = /^[a-zA-Z\s]*$/;
        if (validCityPattern.test(value) || value === '') {
            onChange('city', value);
        }
    };

    const handleProvinceChange = (value: string) => {
        const validProvincePattern = /^[a-zA-Z\s]*$/;
        if (validProvincePattern.test(value) || value === '') {
            onChange('province', value);
        }
    };

    // Get today's date in YYYY-MM-DD format for max date restriction
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const maxDate = yesterday.toISOString().split('T')[0];

    return (
        <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-blue-900">
                Data Pribadi
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <Label>Nama Lengkap *</Label>
                    <Input
                        value={data.full_name}
                        onChange={(event) => handleNameChange(event.target.value)}
                        placeholder="Masukkan nama lengkap"
                        disabled={disabled}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        Hanya huruf, spasi, tanda hubung (-) dan apostrof (')
                    </p>
                    {errors['personal.full_name'] && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors['personal.full_name']}
                        </p>
                    )}
                </div>
                <div>
                    <Label>Email *</Label>
                    <Input
                        type="email"
                        value={data.email}
                        onChange={(event) => handleEmailChange(event.target.value)}
                        placeholder="email@contoh.com"
                        disabled={disabled}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        Harus mengandung simbol @
                    </p>
                    {errors['personal.email'] && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors['personal.email']}
                        </p>
                    )}
                </div>
                <div>
                    <Label>Nomor Telepon *</Label>
                    <Input
                        value={data.phone}
                        onChange={(event) => handlePhoneChange(event.target.value)}
                        placeholder="08xxxxxxxxxx"
                        disabled={disabled}
                        maxLength={12}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        8-12 digit angka
                    </p>
                    {data.phone && (data.phone.length < 8 || data.phone.length > 12) && (
                        <p className="mt-1 text-sm text-amber-600">
                            Nomor telepon harus 8-12 digit
                        </p>
                    )}
                    {errors['personal.phone'] && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors['personal.phone']}
                        </p>
                    )}
                </div>
                <div>
                    <Label>Tanggal Lahir *</Label>
                    <Input
                        type="date"
                        value={data.date_of_birth}
                        onChange={(event) => onChange('date_of_birth', event.target.value)}
                        disabled={disabled}
                        max={maxDate}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        Tidak dapat memilih tanggal hari ini atau masa depan
                    </p>
                    {errors['personal.date_of_birth'] && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors['personal.date_of_birth']}
                        </p>
                    )}
                </div>
                <div>
                    <Label>Jenis Kelamin *</Label>
                    <Select
                        value={data.gender}
                        onValueChange={(value) => onChange('gender', value)}
                        disabled={disabled}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors['personal.gender'] && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors['personal.gender']}
                        </p>
                    )}
                </div>
                <div>
                    <Label>Agama *</Label>
                    <Select
                        value={data.religion}
                        onValueChange={(value) => onChange('religion', value)}
                        disabled={disabled}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih agama" />
                        </SelectTrigger>
                        <SelectContent>
                            {['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'].map(
                                (religion) => (
                                    <SelectItem key={religion} value={religion}>
                                        {religion}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                    {errors['personal.religion'] && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors['personal.religion']}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-6">
                <Label>Alamat Lengkap *</Label>
                <Textarea
                    value={data.address}
                    onChange={(event) => onChange('address', event.target.value)}
                    placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                    rows={3}
                    disabled={disabled}
                />
                {errors['personal.address'] && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors['personal.address']}
                    </p>
                )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <Label>Kota/Kabupaten *</Label>
                    <Input
                        value={data.city}
                        onChange={(event) => handleCityChange(event.target.value)}
                        placeholder="Contoh: Jakarta Selatan"
                        disabled={disabled}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        Hanya huruf dan spasi
                    </p>
                    {errors['personal.city'] && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors['personal.city']}
                        </p>
                    )}
                </div>
                <div>
                    <Label>Provinsi *</Label>
                    <Input
                        value={data.province}
                        onChange={(event) => handleProvinceChange(event.target.value)}
                        placeholder="Contoh: DKI Jakarta"
                        disabled={disabled}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        Hanya huruf dan spasi
                    </p>
                    {errors['personal.province'] && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors['personal.province']}
                        </p>
                    )}
                </div>
            </div>

            {!disabled && (
                <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                        onClick={onSave}
                        disabled={processing}
                        className="bg-blue-900 hover:bg-blue-800"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Simpan Data Pribadi
                    </Button>
                </div>
            )}
        </Card>
    );
}
