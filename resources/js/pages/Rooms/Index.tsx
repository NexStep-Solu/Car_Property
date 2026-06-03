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

interface Department {
    id: number;
    name: string;
}

interface Room {
    id: number;
    name?: string | null;
    room_number: string;
    room_type_id: number;
    floor_id?: number | null;
    building_id?: number | null;
    department_id?: number | null;
    capacity: number;
    current_occupancy: number;
    square_feet?: number | null;
    amenities?: string | null;
    wing?: string | null;
    corridor?: string | null;
    status: string;
    cleaning_status: string;
    room_charges_per_day?: number | null;
    nursing_charges_per_day?: number | null;
    equipment_charges_per_day?: number | null;
    is_active: boolean;
    last_maintenance_date?: string | null;
    next_maintenance_date?: string | null;
    notes?: string | null;

    roomType?: RoomType;
    department?: Department;
}

interface Option {
    id: number;
    type_name?: string;
    name?: string;
}

interface Props {
    rooms: {
        data: Room[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    roomTypes: RoomType[];
    departments: Department[];
}

export default function RoomsIndex({ rooms, roomTypes, departments }: Props) {
    const { hasPermission } = usePermission();
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Rooms', href: '/rooms' }];

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Room | null>(null);

    const initial = useMemo(
        () => ({
            name: '',
            room_number: '',
            room_type_id: '' as string | number,
            floor_id: null as number | null,
            building_id: null as number | null,
            department_id: null as number | null,

            capacity: 1,
            current_occupancy: 0,
            square_feet: null as number | null,
            amenities: '',

            wing: '',
            corridor: '',

            status: 'Available',
            cleaning_status: 'Clean',

            room_charges_per_day: null as number | null,
            nursing_charges_per_day: null as number | null,
            equipment_charges_per_day: null as number | null,

            is_active: true,
            last_maintenance_date: null as string | null,
            next_maintenance_date: null as string | null,
            notes: '',
        }),
        [],
    );

    const { data: createData, setData: setCreateData, post, processing: creating, reset: resetCreate } = useForm(initial);

    const { data: updateData, setData: setUpdateData, put, processing: updating, reset: resetUpdate } = useForm(initial);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('rooms.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
                toast.success('Room created successfully');
            },
            onError: () => toast.error('Error creating room'),
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        put(route('rooms.update', editing.id), {
            onSuccess: () => {
                setEditing(null);
                resetUpdate();
                toast.success('Room updated successfully');
            },
            onError: () => toast.error('Error updating room'),
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this room?')) return;

        router.delete(route('rooms.destroy', id), {
            onSuccess: () => toast.success('Room deleted'),
            onError: () => toast.error('Delete failed'),
        });
    };

    const openEdit = (r: Room) => {
        setEditing(r);
        setUpdateData({
            ...initial,
            name: r.name ?? '',
            room_number: r.room_number ?? '',
            room_type_id: r.room_type_id,
            floor_id: r.floor_id ?? null,
            building_id: r.building_id ?? null,
            department_id: r.department_id ?? null,
            capacity: r.capacity ?? 1,
            current_occupancy: r.current_occupancy ?? 0,
            square_feet: r.square_feet ?? null,
            amenities: r.amenities ?? '',
            wing: r.wing ?? '',
            corridor: r.corridor ?? '',
            status: r.status ?? 'Available',
            cleaning_status: r.cleaning_status ?? 'Clean',
            room_charges_per_day: r.room_charges_per_day ?? null,
            nursing_charges_per_day: r.nursing_charges_per_day ?? null,
            equipment_charges_per_day: r.equipment_charges_per_day ?? null,
            is_active: r.is_active ?? true,
            last_maintenance_date: r.last_maintenance_date ?? null,
            next_maintenance_date: r.next_maintenance_date ?? null,
            notes: r.notes ?? '',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rooms" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Rooms</h1>

                    {hasPermission('create_rooms') && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add Room
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create Room</DialogTitle>
                                </DialogHeader>

                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Room Number *</Label>
                                            <Input value={createData.room_number} onChange={(e) => setCreateData('room_number', e.target.value)} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Room Type *</Label>
                                            <Select
                                                value={String(createData.room_type_id ?? ' ')}
                                                onValueChange={(v) => setCreateData('room_type_id', Number(v))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select room type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roomTypes.map((rt) => (
                                                        <SelectItem key={rt.id} value={String(rt.id)}>
                                                            {rt.type_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Floor ID</Label>
                                            <Input
                                                type="number"
                                                value={createData.floor_id ?? ''}
                                                onChange={(e) =>
                                                    setCreateData('floor_id', e.target.value === '' ? null : parseInt(e.target.value, 10))
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Building ID</Label>
                                            <Input
                                                type="number"
                                                value={createData.building_id ?? ''}
                                                onChange={(e) =>
                                                    setCreateData('building_id', e.target.value === '' ? null : parseInt(e.target.value, 10))
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Department</Label>
                                            <Select
                                                value={createData.department_id ? String(createData.department_id) : ''}
                                                onValueChange={(v) => setCreateData('department_id', v === 'none' ? null : Number(v))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department (optional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {departments.map((d) => (
                                                        <SelectItem key={d.id} value={String(d.id)}>
                                                            {d.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Capacity (Beds)</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={createData.capacity}
                                                onChange={(e) => setCreateData('capacity', parseInt(e.target.value, 10))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Current Occupancy</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={createData.current_occupancy}
                                                onChange={(e) => setCreateData('current_occupancy', parseInt(e.target.value, 10))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Square Feet</Label>
                                            <Input
                                                type="number"
                                                value={createData.square_feet ?? ''}
                                                onChange={(e) =>
                                                    setCreateData('square_feet', e.target.value === '' ? null : parseInt(e.target.value, 10))
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Amenities (JSON array as text)</Label>
                                        <Textarea
                                            value={createData.amenities}
                                            onChange={(e) => setCreateData('amenities', e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Wing</Label>
                                            <Input value={createData.wing} onChange={(e) => setCreateData('wing', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Corridor</Label>
                                            <Input value={createData.corridor} onChange={(e) => setCreateData('corridor', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={createData.status} onValueChange={(v) => setCreateData('status', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['Available', 'Occupied', 'Maintenance', 'Reserved', 'Cleaning', 'Out-of-Service'].map((s) => (
                                                        <SelectItem key={s} value={s}>
                                                            {s}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Cleaning Status</Label>
                                            <Select value={createData.cleaning_status} onValueChange={(v) => setCreateData('cleaning_status', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select cleaning status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['Clean', 'Dirty', 'In-Progress', 'Sanitized'].map((s) => (
                                                        <SelectItem key={s} value={s}>
                                                            {s}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label>Room Charges / Day</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={createData.room_charges_per_day ?? ''}
                                                onChange={(e) =>
                                                    setCreateData('room_charges_per_day', e.target.value === '' ? null : parseFloat(e.target.value))
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Nursing Charges / Day</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={createData.nursing_charges_per_day ?? ''}
                                                onChange={(e) =>
                                                    setCreateData(
                                                        'nursing_charges_per_day',
                                                        e.target.value === '' ? null : parseFloat(e.target.value),
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Equipment Charges / Day</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={createData.equipment_charges_per_day ?? ''}
                                                onChange={(e) =>
                                                    setCreateData(
                                                        'equipment_charges_per_day',
                                                        e.target.value === '' ? null : parseFloat(e.target.value),
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <Label>Active</Label>
                                            </div>
                                            <Checkbox
                                                checked={createData.is_active}
                                                onCheckedChange={(checked) => setCreateData('is_active', checked === true)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Last Maintenance</Label>
                                                <Input
                                                    type="date"
                                                    value={createData.last_maintenance_date ?? ''}
                                                    onChange={(e) =>
                                                        setCreateData('last_maintenance_date', e.target.value === '' ? null : e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Next Maintenance</Label>
                                                <Input
                                                    type="date"
                                                    value={createData.next_maintenance_date ?? ''}
                                                    onChange={(e) =>
                                                        setCreateData('next_maintenance_date', e.target.value === '' ? null : e.target.value)
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
                        <CardTitle>Rooms List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Room Number</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {rooms.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-muted-foreground text-center">
                                            No rooms found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rooms.data.map((r: Room) => (
                                        <TableRow key={r.id}>
                                            <TableCell>{r.id}</TableCell>
                                            <TableCell className="font-medium">{r.room_number}</TableCell>
                                            <TableCell>{r.roomType?.type_name ?? '-'}</TableCell>
                                            <TableCell>{r.department?.name ?? '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={r.status === 'Available' ? 'default' : 'secondary'}>{r.status}</Badge>
                                            </TableCell>
                                            <TableCell>{r.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {hasPermission('update_rooms') && (
                                                        <Button size="icon" variant="outline" onClick={() => openEdit(r)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('delete_rooms') && (
                                                        <Button size="icon" variant="outline" onClick={() => handleDelete(r.id)}>
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

                        {rooms.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-muted-foreground text-sm">
                                    Showing {rooms.data.length > 0 ? (rooms.current_page - 1) * rooms.per_page + 1 : 0} to{' '}
                                    {Math.min(rooms.current_page * rooms.per_page, rooms.total)} of {rooms.total} results
                                </p>
                                <div className="flex gap-1">
                                    {rooms.links.map((link, index) => (
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
                                <DialogTitle>Edit Room</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Room Number *</Label>
                                        <Input value={updateData.room_number} onChange={(e) => setUpdateData('room_number', e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Room Type *</Label>
                                        <Select
                                            value={String(updateData.room_type_id ?? ' ')}
                                            onValueChange={(v) => setUpdateData('room_type_id', Number(v))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select room type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roomTypes.map((rt) => (
                                                    <SelectItem key={rt.id} value={String(rt.id)}>
                                                        {rt.type_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Floor ID</Label>
                                        <Input
                                            type="number"
                                            value={updateData.floor_id ?? ''}
                                            onChange={(e) => setUpdateData('floor_id', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Building ID</Label>
                                        <Input
                                            type="number"
                                            value={updateData.building_id ?? ''}
                                            onChange={(e) =>
                                                setUpdateData('building_id', e.target.value === '' ? null : parseInt(e.target.value, 10))
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Department</Label>
                                        <Select
                                            value={updateData.department_id ? String(updateData.department_id) : ''}
                                            onValueChange={(v) => setUpdateData('department_id', v === 'none' ? null : Number(v))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {departments.map((d) => (
                                                    <SelectItem key={d.id} value={String(d.id)}>
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Capacity (Beds)</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={updateData.capacity}
                                            onChange={(e) => setUpdateData('capacity', parseInt(e.target.value, 10))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Current Occupancy</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={updateData.current_occupancy}
                                            onChange={(e) => setUpdateData('current_occupancy', parseInt(e.target.value, 10))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Square Feet</Label>
                                        <Input
                                            type="number"
                                            value={updateData.square_feet ?? ''}
                                            onChange={(e) =>
                                                setUpdateData('square_feet', e.target.value === '' ? null : parseInt(e.target.value, 10))
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Amenities (JSON array as text)</Label>
                                    <Textarea value={updateData.amenities} onChange={(e) => setUpdateData('amenities', e.target.value)} rows={3} />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Wing</Label>
                                        <Input value={updateData.wing} onChange={(e) => setUpdateData('wing', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Corridor</Label>
                                        <Input value={updateData.corridor} onChange={(e) => setUpdateData('corridor', e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={updateData.status} onValueChange={(v) => setUpdateData('status', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['Available', 'Occupied', 'Maintenance', 'Reserved', 'Cleaning', 'Out-of-Service'].map((s) => (
                                                    <SelectItem key={s} value={s}>
                                                        {s}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Cleaning Status</Label>
                                        <Select value={updateData.cleaning_status} onValueChange={(v) => setUpdateData('cleaning_status', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select cleaning status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['Clean', 'Dirty', 'In-Progress', 'Sanitized'].map((s) => (
                                                    <SelectItem key={s} value={s}>
                                                        {s}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label>Room Charges / Day</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={updateData.room_charges_per_day ?? ''}
                                            onChange={(e) =>
                                                setUpdateData('room_charges_per_day', e.target.value === '' ? null : parseFloat(e.target.value))
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Nursing Charges / Day</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={updateData.nursing_charges_per_day ?? ''}
                                            onChange={(e) =>
                                                setUpdateData('nursing_charges_per_day', e.target.value === '' ? null : parseFloat(e.target.value))
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Equipment Charges / Day</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={updateData.equipment_charges_per_day ?? ''}
                                            onChange={(e) =>
                                                setUpdateData('equipment_charges_per_day', e.target.value === '' ? null : parseFloat(e.target.value))
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <Label>Active</Label>
                                        </div>
                                        <Checkbox
                                            checked={updateData.is_active}
                                            onCheckedChange={(checked) => setUpdateData('is_active', checked === true)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Last Maintenance</Label>
                                            <Input
                                                type="date"
                                                value={updateData.last_maintenance_date ?? ''}
                                                onChange={(e) =>
                                                    setUpdateData('last_maintenance_date', e.target.value === '' ? null : e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Next Maintenance</Label>
                                            <Input
                                                type="date"
                                                value={updateData.next_maintenance_date ?? ''}
                                                onChange={(e) =>
                                                    setUpdateData('next_maintenance_date', e.target.value === '' ? null : e.target.value)
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
