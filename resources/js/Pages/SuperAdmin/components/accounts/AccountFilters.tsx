import { Filter, Search } from 'lucide-react';

interface AccountFiltersProps {
    search: string;
    role: string;
    status: string;
    onSearchChange: (value: string) => void;
    onRoleChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    roleOptions: string[];
    statusOptions: string[];
}

export default function AccountFilters({
    search,
    role,
    status,
    onSearchChange,
    onRoleChange,
    onStatusChange,
    roleOptions,
    statusOptions,
}: AccountFiltersProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    placeholder="Cari nama, email, atau ID..."
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
            </div>
            <div className="flex flex-1 gap-2 md:flex-none">
                <div className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm md:w-48">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                        value={role}
                        onChange={(event) => onRoleChange(event.target.value)}
                        className="w-full bg-transparent text-slate-700 outline-none"
                    >
                        <option value="all">Semua Role</option>
                        {roleOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm md:w-48">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                        value={status}
                        onChange={(event) =>
                            onStatusChange(event.target.value)
                        }
                        className="w-full bg-transparent text-slate-700 outline-none"
                    >
                        <option value="all">Semua Status</option>
                        {statusOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
