import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    minDate?: Date;
    placeholder?: string;
    className?: string;
}

export function DateTimePicker({
    selected,
    onChange,
    minDate = new Date(),
    placeholder = 'Pilih tanggal dan waktu',
    className,
}: DateTimePickerProps) {
    return (
        <div className={cn('relative', className)}>
            <DatePicker
                selected={selected}
                onChange={onChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                minDate={minDate}
                placeholderText={placeholder}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                wrapperClassName="w-full"
                calendarClassName="!font-sans"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-muted-foreground">
                <Calendar className="size-4" />
                <Clock className="size-4" />
            </div>
        </div>
    );
}
