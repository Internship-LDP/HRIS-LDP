import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { TerminationRecord } from '../types';

interface TerminationDetailDialogProps {
  termination: TerminationRecord;
  trigger: ReactNode;
}

export default function TerminationDetailDialog({
  termination,
  trigger,
}: TerminationDetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] border-0 bg-white p-0">
        <div className="flex max-h-[90vh] flex-col">
          {/* Header tetap, tidak ikut scroll */}
          <DialogHeader className="space-y-1 border-b border-slate-200 px-6 py-4 text-left">
            <DialogTitle>Detail Pengajuan Offboarding</DialogTitle>
            <DialogDescription>
              Informasi lengkap mengenai karyawan dan alasan pengajuan termination.
            </DialogDescription>
          </DialogHeader>

          {/* Isi dialog yang bisa discroll */}
          <ScrollArea className="flex-1 px-6 pb-6 pt-4 text-sm">
            <div className="space-y-6">
              <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2">
                <Detail label="ID" value={termination.reference} />
                <Detail label="Nama" value={termination.employeeName} />
                <Detail label="ID Karyawan" value={termination.employeeCode} />
                <Detail label="Divisi" value={termination.division} />
                <Detail label="Posisi" value={termination.position} />

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <div className="mt-1">
                    {renderStatusBadge(termination.status)}
                  </div>
                </div>

                <Detail
                  label="Tanggal Pengajuan"
                  value={termination.requestDate}
                />
                <Detail
                  label="Tanggal Efektif"
                  value={termination.effectiveDate}
                />
                <Detail label="Tipe" value={termination.type} />

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Progress
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-blue-900"
                        style={{ width: `${termination.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">
                      {termination.progress}%
                    </span>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-semibold text-slate-900">
                  Alasan Pengajuan
                </h4>
                <p className="rounded-lg border border-slate-200 bg-white/70 p-3 text-slate-700 whitespace-pre-line break-words">
                  {termination.reason ?? '-'}
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-semibold text-slate-900">
                  Saran / Masukan
                </h4>
                <p className="rounded-lg border border-slate-200 bg-white/70 p-3 text-slate-700 whitespace-pre-line break-words">
                  {termination.suggestion ?? '-'}
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-semibold text-slate-900">
                  Catatan HR
                </h4>
                <p className="rounded-lg border border-slate-200 bg-white/70 p-3 text-slate-700 whitespace-pre-line break-words">
                  {termination.notes ?? 'Belum ada catatan.'}
                </p>
              </section>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-900">
        {value ?? '-'}
      </p>
    </div>
  );
}

function renderStatusBadge(status: string) {
  switch (status) {
    case 'Diajukan':
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-600">
          Diajukan
        </Badge>
      );
    case 'Proses':
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600">
          Proses
        </Badge>
      );
    case 'Selesai':
      return (
        <Badge variant="outline" className="border-green-500 text-green-600">
          Selesai
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
