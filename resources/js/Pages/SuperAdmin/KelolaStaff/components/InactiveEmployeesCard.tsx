import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { FileText } from 'lucide-react';
import { InactiveEmployeeRecord } from '../types';

interface InactiveEmployeesCardProps {
    employees: InactiveEmployeeRecord[];
}

export default function InactiveEmployeesCard({ employees }: InactiveEmployeesCardProps) {
    return (
        <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-blue-900">
                Arsip Karyawan Nonaktif
            </h3>
            {employees.length === 0 ? (
                <p className="text-sm text-slate-500">
                    Belum ada data karyawan nonaktif.
                </p>
            ) : (
                <div className="space-y-3">
                    {employees.map((employee) => (
                        <div key={`${employee.employeeCode}-${employee.exitDate}`} className="rounded-lg bg-slate-50 p-4">
                            <div className="mb-2 flex items-start justify-between">
                                <div>
                                    <p className="font-medium text-slate-900">{employee.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {employee.employeeCode} • {employee.division} • {employee.position}
                                    </p>
                                </div>
                                <Badge className={employee.type === 'Resign' ? 'bg-blue-500' : 'bg-red-500'}>
                                    {employee.type}
                                </Badge>
                            </div>
                            <div className="mt-3 grid gap-4 text-sm md:grid-cols-3">
                                <Detail label="Bergabung" value={employee.joinDate} />
                                <Detail label="Keluar" value={employee.exitDate} />
                                <Detail label="Alasan" value={employee.exitReason} />
                            </div>
                            <div className="mt-3">
                                <Button variant="outline" size="sm">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Lihat Detail
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm text-slate-900">{value ?? '-'}</p>
        </div>
    );
}
