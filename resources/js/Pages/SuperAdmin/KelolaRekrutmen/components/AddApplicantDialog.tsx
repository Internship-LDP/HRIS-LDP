import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { UserPlus } from 'lucide-react';

export default function AddApplicantDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800">
                    <UserPlus className="h-4 w-4" />
                    Tambah Pelamar
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Tambah Pelamar Baru</DialogTitle>
                </DialogHeader>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                        <Label>Nama Lengkap</Label>
                        <Input placeholder="Nama pelamar" />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input type="email" placeholder="email@example.com" />
                    </div>
                    <div>
                        <Label>Posisi</Label>
                        <Input placeholder="Software Engineer" />
                    </div>
                    <div>
                        <Label>Status</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="applied">Applied</SelectItem>
                                <SelectItem value="screening">Screening</SelectItem>
                                <SelectItem value="interview">Interview</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-2">
                        <Label>Catatan</Label>
                        <Textarea placeholder="Tambahkan catatan singkat" />
                    </div>
                    <div className="col-span-2">
                        <Button className="bg-blue-900 hover:bg-blue-800">Simpan</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
