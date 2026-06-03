import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface Room {
    id: number;
    room_number: string;
}

interface Employee {
    id: number;
    employee_id: string | null;
}

interface Bed {
    id: number;
    room_id: number;
    bed_number: string;
    bed_type: string;
    has_ventilator: boolean;
    has_monitor: boolean;
    has_suction: boolean;
    has_oxygen: boolean;
    status: string;
    is_isolated: boolean;
    current_patient_id: number | null;
    current_encounter_id: number | null;
    occupied_since: string | null;
    expected_vacate_date: string | null;
    is_active: boolean;
    last_cleaned_date: string | null;
    last_cleaned_by: number | null;
    notes: string | null;
}

interface Props {
    bed: Bed;
    rooms: Room[];
    employees: Employee[];
}

function toDateTimeLocal(value: string | null | undefined): string {
    if (!value) return '';
    return String(value).replace(' ', 'T').slice(0, 16);
}

export default function BedsEdit({ bed, rooms, employees }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Beds', href: '/beds' },
        { title: `Edit ${bed.bed_number}`, href: `/beds/${bed.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        room_id: bed.room_id,
        bed_number: bed.bed_number ?? '',
        bed_type: bed.bed_type ?? 'Standard',
        has_ventilator: bed.has_ventilator ?? false,
        has_monitor: bed.has_monitor ?? false,
        has_suction: bed.has_suction ?? false,
        has_oxygen: bed.has_oxygen ?? false,
        status: bed.status ?? 'Available',
        is_isolated: bed.is_isolated ?? false,
        current_patient_id: bed.current_patient_id ?? null,
        current_encounter_id: bed.current_encounter_id ?? null,
        occupied_since: bed.occupied_since ? toDateTimeLocal(bed.occupied_since) : null,
        expected_vacate_date: bed.expected_vacate_date ? toDateTimeLocal(bed.expected_vacate_date) : null,
        is_active: bed.is_active ?? true,
        last_cleaned_date: bed.last_cleaned_date ? toDateTimeLocal(bed.last_cleaned_date) : null,
        last_cleaned_by: bed.last_cleaned_by ?? null,
        notes: bed.notes ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('beds.update', bed.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Bed updated successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error updating bed', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Bed" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Edit Bed</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bed Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="room_id">Room *</Label>
                                    <Select value={data.room_id ? String(data.room_id) : ''} onValueChange={(v) => setData('room_id', Number(v))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select room" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rooms.map((r) => (
                                                <SelectItem key={r.id} value={String(r.id)}>
                                                    {r.room_number}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.room_id} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bed_number">Bed Number *</Label>
                                    <Input
                                        id="bed_number"
                                        type="text"
                                        required
                                        value={data.bed_number}
                                        onChange={(e) => setData('bed_number', e.target.value)}
                                        disabled={processing}
                                        placeholder="Enter bed number"
                                    />
                                    <InputError message={errors.bed_number} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bed_type">Bed Type</Label>
                                    <Select value={data.bed_type} onValueChange={(v) => setData('bed_type', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select bed type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['Standard', 'Electric', 'ICU', 'Pediatric', 'Bariatric', 'Stretcher'].map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['Available', 'Occupied', 'Reserved', 'Maintenance', 'Cleaning'].map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div className="flex items-center justify-between gap-4">
                                    <Label htmlFor="has_ventilator">Ventilator</Label>
                                    <Checkbox
                                        id="has_ventilator"
                                        checked={data.has_ventilator}
                                        onCheckedChange={(checked) => setData('has_ventilator', checked === true)}
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <Label htmlFor="has_monitor">Monitor</Label>
                                    <Checkbox
                                        id="has_monitor"
                                        checked={data.has_monitor}
                                        onCheckedChange={(checked) => setData('has_monitor', checked === true)}
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <Label htmlFor="has_suction">Suction</Label>
                                    <Checkbox
                                        id="has_suction"
                                        checked={data.has_suction}
                                        onCheckedChange={(checked) => setData('has_suction', checked === true)}
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <Label htmlFor="has_oxygen">Oxygen</Label>
                                    <Checkbox
                                        id="has_oxygen"
                                        checked={data.has_oxygen}
                                        onCheckedChange={(checked) => setData('has_oxygen', checked === true)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="flex items-center justify-between gap-4">
                                    <Label htmlFor="is_isolated">Isolated</Label>
                                    <Checkbox
                                        id="is_isolated"
                                        checked={data.is_isolated}
                                        onCheckedChange={(checked) => setData('is_isolated', checked === true)}
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <Label htmlFor="is_active">Active</Label>
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked === true)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="last_cleaned_by">Last Cleaned By</Label>
                                    <Select
                                        value={data.last_cleaned_by ? String(data.last_cleaned_by) : ''}
                                        onValueChange={(v) => setData('last_cleaned_by', v === 'none' ? null : Number(v))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Optional" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {employees.map((emp) => (
                                                <SelectItem key={emp.id} value={String(emp.id)}>
                                                    {emp.employee_id ?? `#${emp.id}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="occupied_since">Occupied Since</Label>
                                    <Input
                                        id="occupied_since"
                                        type="datetime-local"
                                        value={data.occupied_since ?? ''}
                                        onChange={(e) => setData('occupied_since', e.target.value === '' ? null : e.target.value)}
                                        disabled={processing}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="expected_vacate_date">Expected Vacate</Label>
                                    <Input
                                        id="expected_vacate_date"
                                        type="datetime-local"
                                        value={data.expected_vacate_date ?? ''}
                                        onChange={(e) => setData('expected_vacate_date', e.target.value === '' ? null : e.target.value)}
                                        disabled={processing}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="last_cleaned_date">Last Cleaned Date</Label>
                                    <Input
                                        id="last_cleaned_date"
                                        type="datetime-local"
                                        value={data.last_cleaned_date ?? ''}
                                        onChange={(e) => setData('last_cleaned_date', e.target.value === '' ? null : e.target.value)}
                                        disabled={processing}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    disabled={processing}
                                    placeholder="Enter notes"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('beds.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Bed
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
