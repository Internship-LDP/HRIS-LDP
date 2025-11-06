import { ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import type { Option } from '../types';

interface ComplaintFiltersProps {
    search: string;
    status: string;
    priority: string;
    category: string;
    statusOptions: Option[];
    priorityOptions: Option[];
    categoryOptions: string[];
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onPriorityChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
}

export default function ComplaintFilters({
    search,
    status,
    priority,
    category,
    statusOptions,
    priorityOptions,
    categoryOptions,
    onSearchChange,
    onStatusChange,
    onPriorityChange,
    onCategoryChange,
}: ComplaintFiltersProps) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    value={search}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        onSearchChange(event.target.value)
                    }
                    placeholder="Cari ID, subjek, atau isi pengaduan..."
                    className="pl-10"
                />
            </div>
            <div className="flex flex-1 flex-wrap gap-2 lg:flex-none">
                <FilterSelect
                    placeholder="Status"
                    emptyLabel="Semua Status"
                    value={status}
                    onChange={onStatusChange}
                    options={statusOptions}
                />
                <FilterSelect
                    placeholder="Prioritas"
                    emptyLabel="Semua Prioritas"
                    value={priority}
                    onChange={onPriorityChange}
                    options={priorityOptions}
                />
                <FilterSelect
                    placeholder="Kategori"
                    emptyLabel="Semua Kategori"
                    value={category}
                    onChange={onCategoryChange}
                    options={categoryOptions.map((value) => ({
                        value,
                        label: value,
                    }))}
                />
            </div>
        </div>
    );
}

interface FilterSelectProps {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    emptyLabel: string;
}

function FilterSelect({
    placeholder,
    value,
    onChange,
    options,
    emptyLabel,
}: FilterSelectProps) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full min-w-[160px] lg:w-40">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">{emptyLabel}</SelectItem>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
