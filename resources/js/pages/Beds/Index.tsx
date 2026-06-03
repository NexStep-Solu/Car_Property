import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface RoomType {
    id: number;
    type_name: string;
}

interface Room {
    id: number;
    room_number: string;
    roomType?: RoomType;
}

interface Employee {
    id: number;
    employee_id: string | null;
    position?: string | null;
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

    room?: Room;
}

interface Props {
    beds: {
        data: Bed[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    rooms: Room[];
    employees: Employee[];
}

function toDateTimeLocal(value: string | null | undefined): string {
    if (!value) return '';
    // Handles "YYYY-MM-DD HH:mm:ss" or ISO strings.
    return String(value).replace(' ', 'T').slice(0, 16);
}

export default function BedsIndex({ beds, rooms, employees }: Props) {
    const { hasPermission } = usePermission();
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Beds', href: '/beds' }];

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Bed | null>(null);

    const initial = useMemo(
        () => ({
            room_id: null as number | null,
            bed_number: '',
            bed_type: 'Standard',
            has_ventilator: false,
            has_monitor: false,
            has_suction: false,
            has_oxygen: false,
            status: 'Available',
            is_isolated: false,
            current_patient_id: null as number | null,
            current_encounter_id: null as number | null,
            occupied_since: null as string | null,
            expected_vacate_date: null as string | null,
            is_active: true,
            last_cleaned_date: null as string | null,
            last_cleaned_by: null as number | null,
            notes: '',
        }),
        [],
    );

    const { data: createData, setData: setCreateData, post, processing: creating, reset: resetCreate } = useForm(initial);
    const { data: updateData, setData: setUpdateData, put, processing: updating, reset: resetUpdate } = useForm(initial);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('beds.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
                toast.success('Bed created successfully');
            },
            onError: () => toast.error('Error creating bed'),
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        put(route('beds.update', editing.id), {
            onSuccess: () => {
                setEditing(null);
                resetUpdate();
                toast.success('Bed updated successfully');
            },
            onError: () => toast.error('Error updating bed'),
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this bed?')) return;

        router.delete(route('beds.destroy', id), {
            onSuccess: () => toast.success('Bed deleted'),
            onError: () => toast.error('Delete failed'),
        });
    };

    const openEdit = (b: Bed) => {
        setEditing(b);
        setUpdateData({
            ...initial,
            room_id: b.room_id,
            bed_number: b.bed_number ?? '',
            bed_type: b.bed_type ?? 'Standard',
            has_ventilator: b.has_ventilator ?? false,
            has_monitor: b.has_monitor ?? false,
            has_suction: b.has_suction ?? false,
            has_oxygen: b.has_oxygen ?? false,
            status: b.status ?? 'Available',
            is_isolated: b.is_isolated ?? false,
            current_patient_id: b.current_patient_id ?? null,
            current_encounter_id: b.current_encounter_id ?? null,
            occupied_since: b.occupied_since ? toDateTimeLocal(b.occupied_since) : null,
            expected_vacate_date: b.expected_vacate_date ? toDateTimeLocal(b.expected_vacate_date) : null,
            is_active: b.is_active ?? true,
            last_cleaned_date: b.last_cleaned_date ? toDateTimeLocal(b.last_cleaned_date) : null,
            last_cleaned_by: b.last_cleaned_by ?? null,
            notes: b.notes ?? '',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Beds" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Beds</h1>

                    {hasPermission('create_beds') && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add Bed
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create Bed</DialogTitle>
                                </DialogHeader>

                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Room *</Label>
                                            <Select
                                                value={createData.room_id ? String(createData.room_id) : ''}
                                                onValueChange={(v) => setCreateData('room_id', Number(v))}
                                            >
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
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Bed Number *</Label>
                                            <Input value={createData.bed_number} onChange={(e) => setCreateData('bed_number', e.target.value)} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Bed Type</Label>
                                            <Select value={createData.bed_type} onValueChange={(v) => setCreateData('bed_type', v)}>
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

                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={createData.status} onValueChange={(v) => setCreateData('status', v)}>
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

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <Label>Ventilator</Label>
                                            </div>
                                            <Checkbox
                                                checked={createData.has_ventilator}
                                                onCheckedChange={(checked) => setCreateData('has_ventilator', checked === true)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <Label>Monitor</Label>
                                            </div>
                                            <Checkbox
                                                checked={createData.has_monitor}
                                                onCheckedChange={(checked) => setCreateData('has_monitor', checked === true)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <Label>Suction</Label>
                                            </div>
                                            <Checkbox
                                                checked={createData.has_suction}
                                                onCheckedChange={(checked) => setCreateData('has_suction', checked === true)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <Label>Oxygen</Label>
                                            </div>
                                            <Checkbox
                                                checked={createData.has_oxygen}
                                                onCheckedChange={(checked) => setCreateData('has_oxygen', checked === true)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <Label>Isolated</Label>
                                            </div>
                                            <Checkbox
                                                checked={createData.is_isolated}
                                                onCheckedChange={(checked) => setCreateData('is_isolated', checked === true)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <Label>Active</Label>
                                            </div>
                                            <Checkbox
                                                checked={createData.is_active}
                                                onCheckedChange={(checked) => setCreateData('is_active', checked === true)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Last Cleaned By</Label>
                                            <Select
                                                value={createData.last_cleaned_by ? String(createData.last_cleaned_by) : ''}
                                                onValueChange={(v) => setCreateData('last_cleaned_by', v === 'none' ? null : Number(v))}
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
                                        <div className="space-y-2">
                                            <Label>Occupied Since</Label>
                                            <Input
                                                type="datetime-local"
                                                value={createData.occupied_since ?? ''}
                                                onChange={(e) => setCreateData('occupied_since', e.target.value === '' ? null : e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Expected Vacate</Label>
                                            <Input
                                                type="datetime-local"
                                                value={createData.expected_vacate_date ?? ''}
                                                onChange={(e) => setCreateData('expected_vacate_date', e.target.value === '' ? null : e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Last Cleaned Date</Label>
                                            <Input
                                                type="datetime-local"
                                                value={createData.last_cleaned_date ?? ''}
                                                onChange={(e) => setCreateData('last_cleaned_date', e.target.value === '' ? null : e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Current Patient ID</Label>
                                                <Input
                                                    type="number"
                                                    value={createData.current_patient_id ?? ''}
                                                    onChange={(e) =>
                                                        setCreateData(
                                                            'current_patient_id',
                                                            e.target.value === '' ? null : parseInt(e.target.value, 10),
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Current Encounter ID</Label>
                                                <Input
                                                    type="number"
                                                    value={createData.current_encounter_id ?? ''}
                                                    onChange={(e) =>
                                                        setCreateData(
                                                            'current_encounter_id',
                                                            e.target.value === '' ? null : parseInt(e.target.value, 10),
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Notes</Label>
                                        <Textarea value={createData.notes} onChange={(e) => setCreateData('notes', e.target.value)} rows={3} />
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button disabled={creating}>Create</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Beds List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead>Bed Number</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Isolated</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {beds.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-muted-foreground text-center">
                                            No beds found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    beds.data.map((b: Bed) => (
                                        <TableRow key={b.id}>
                                            <TableCell>{b.id}</TableCell>
                                            <TableCell>{b.room?.room_number ?? '-'}</TableCell>
                                            <TableCell className="font-medium">{b.bed_number}</TableCell>
                                            <TableCell>{b.bed_type}</TableCell>
                                            <TableCell>
                                                <Badge variant={b.status === 'Available' ? 'default' : 'secondary'}>{b.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {b.is_isolated ? <Badge variant="secondary">Yes</Badge> : <Badge variant="outline">No</Badge>}
                                            </TableCell>
                                            <TableCell>{b.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {hasPermission('update_beds') && (
                                                        <Button size="icon" variant="outline" onClick={() => openEdit(b)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('delete_beds') && (
                                                        <Button size="icon" variant="outline" onClick={() => handleDelete(b.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {beds.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-muted-foreground text-sm">
                                    Showing {beds.data.length > 0 ? (beds.current_page - 1) * beds.per_page + 1 : 0} to{' '}
                                    {Math.min(beds.current_page * beds.per_page, beds.total)} of {beds.total} results
                                </p>
                                <div className="flex gap-1">
                                    {beds.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {editing && (
                    <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
                        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Bed</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Room *</Label>
                                        <Select
                                            value={updateData.room_id ? String(updateData.room_id) : ''}
                                            onValueChange={(v) => setUpdateData('room_id', Number(v))}
                                        >
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
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Bed Number *</Label>
                                        <Input value={updateData.bed_number} onChange={(e) => setUpdateData('bed_number', e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Bed Type</Label>
                                        <Select value={updateData.bed_type} onValueChange={(v) => setUpdateData('bed_type', v)}>
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

                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={updateData.status} onValueChange={(v) => setUpdateData('status', v)}>
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

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <Label>Ventilator</Label>
                                        </div>
                                        <Checkbox
                                            checked={updateData.has_ventilator}
                                            onCheckedChange={(checked) => setUpdateData('has_ventilator', checked === true)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <Label>Monitor</Label>
                                        </div>
                                        <Checkbox
                                            checked={updateData.has_monitor}
                                            onCheckedChange={(checked) => setUpdateData('has_monitor', checked === true)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <Label>Suction</Label>
                                        </div>
                                        <Checkbox
                                            checked={updateData.has_suction}
                                            onCheckedChange={(checked) => setUpdateData('has_suction', checked === true)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <Label>Oxygen</Label>
                                        </div>
                                        <Checkbox
                                            checked={updateData.has_oxygen}
                                            onCheckedChange={(checked) => setUpdateData('has_oxygen', checked === true)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <Label>Isolated</Label>
                                        </div>
                                        <Checkbox
                                            checked={updateData.is_isolated}
                                            onCheckedChange={(checked) => setUpdateData('is_isolated', checked === true)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <Label>Active</Label>
                                        </div>
                                        <Checkbox
                                            checked={updateData.is_active}
                                            onCheckedChange={(checked) => setUpdateData('is_active', checked === true)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Cleaned By</Label>
                                        <Select
                                            value={updateData.last_cleaned_by ? String(updateData.last_cleaned_by) : ''}
                                            onValueChange={(v) => setUpdateData('last_cleaned_by', v === 'none' ? null : Number(v))}
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
                                    <div className="space-y-2">
                                        <Label>Occupied Since</Label>
                                        <Input
                                            type="datetime-local"
                                            value={updateData.occupied_since ?? ''}
                                            onChange={(e) => setUpdateData('occupied_since', e.target.value === '' ? null : e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Expected Vacate</Label>
                                        <Input
                                            type="datetime-local"
                                            value={updateData.expected_vacate_date ?? ''}
                                            onChange={(e) => setUpdateData('expected_vacate_date', e.target.value === '' ? null : e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Last Cleaned Date</Label>
                                        <Input
                                            type="datetime-local"
                                            value={updateData.last_cleaned_date ?? ''}
                                            onChange={(e) => setUpdateData('last_cleaned_date', e.target.value === '' ? null : e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Current Patient ID</Label>
                                            <Input
                                                type="number"
                                                value={updateData.current_patient_id ?? ''}
                                                onChange={(e) =>
                                                    setUpdateData('current_patient_id', e.target.value === '' ? null : parseInt(e.target.value, 10))
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Current Encounter ID</Label>
                                            <Input
                                                type="number"
                                                value={updateData.current_encounter_id ?? ''}
                                                onChange={(e) =>
                                                    setUpdateData('current_encounter_id', e.target.value === '' ? null : parseInt(e.target.value, 10))
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea value={updateData.notes} onChange={(e) => setUpdateData('notes', e.target.value)} rows={3} />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                                        Cancel
                                    </Button>
                                    <Button disabled={updating}>Update</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}
