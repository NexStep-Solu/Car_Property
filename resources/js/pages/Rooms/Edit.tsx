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
}

interface Props {
    room: Room;
    roomTypes: RoomType[];
    departments: Department[];
}

const STATUS_OPTIONS = ['Available', 'Occupied', 'Maintenance', 'Reserved', 'Cleaning', 'Out-of-Service'];
const CLEANING_STATUS_OPTIONS = ['Clean', 'Dirty', 'In-Progress', 'Sanitized'];

export default function RoomsEdit({ room, roomTypes, departments }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Rooms', href: '/rooms' },
        { title: room.room_number, href: `/rooms/${room.id}` },
        { title: 'Edit', href: `/rooms/${room.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: room.name ?? '',
        room_number: room.room_number ?? '',
        room_type_id: room.room_type_id ?? null,
        floor_id: room.floor_id ?? null,
        building_id: room.building_id ?? null,
        department_id: room.department_id ?? null,
        capacity: room.capacity ?? 1,
        current_occupancy: room.current_occupancy ?? 0,
        square_feet: room.square_feet ?? null,
        amenities: room.amenities ?? '',
        wing: room.wing ?? '',
        corridor: room.corridor ?? '',
        status: room.status ?? 'Available',
        cleaning_status: room.cleaning_status ?? 'Clean',
        room_charges_per_day: room.room_charges_per_day ?? null,
        nursing_charges_per_day: room.nursing_charges_per_day ?? null,
        equipment_charges_per_day: room.equipment_charges_per_day ?? null,
        is_active: room.is_active ?? true,
        last_maintenance_date: room.last_maintenance_date ?? null,
        next_maintenance_date: room.next_maintenance_date ?? null,
        notes: room.notes ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('rooms.update', room.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Room updated successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error updating room', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Room: ${room.room_number}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Edit Room</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="room_number">Room Number *</Label>
                                    <Input
                                        id="room_number"
                                        type="text"
                                        required
                                        value={data.room_number}
                                        onChange={(e) => setData('room_number', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 101A"
                                    />
                                    <InputError message={errors.room_number} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        placeholder="Optional room name"
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="room_type_id">Room Type *</Label>
                                    <Select
                                        value={data.room_type_id ? String(data.room_type_id) : ''}
                                        onValueChange={(v) => setData('room_type_id', Number(v))}
                                        disabled={processing}
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
                                    <InputError message={errors.room_type_id} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="department_id">Department</Label>
                                    <Select
                                        value={data.department_id ? String(data.department_id) : ''}
                                        onValueChange={(v) => setData('department_id', v === 'none' ? null : Number(v))}
                                        disabled={processing}
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
                                    <InputError message={errors.department_id} className="mt-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Location & Capacity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="floor_id">Floor ID</Label>
                                    <Input
                                        id="floor_id"
                                        type="number"
                                        value={data.floor_id ?? ''}
                                        onChange={(e) => setData('floor_id', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.floor_id} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="building_id">Building ID</Label>
                                    <Input
                                        id="building_id"
                                        type="number"
                                        value={data.building_id ?? ''}
                                        onChange={(e) => setData('building_id', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.building_id} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="wing">Wing</Label>
                                    <Input
                                        id="wing"
                                        type="text"
                                        value={data.wing}
                                        onChange={(e) => setData('wing', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., A, B, C"
                                    />
                                    <InputError message={errors.wing} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="corridor">Corridor</Label>
                                    <Input
                                        id="corridor"
                                        type="text"
                                        value={data.corridor}
                                        onChange={(e) => setData('corridor', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., East, West"
                                    />
                                    <InputError message={errors.corridor} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="capacity">Capacity (Beds)</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        min={1}
                                        value={data.capacity}
                                        onChange={(e) => setData('capacity', parseInt(e.target.value, 10) || 1)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.capacity} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="current_occupancy">Current Occupancy</Label>
                                    <Input
                                        id="current_occupancy"
                                        type="number"
                                        min={0}
                                        value={data.current_occupancy}
                                        onChange={(e) => setData('current_occupancy', parseInt(e.target.value, 10) || 0)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.current_occupancy} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="square_feet">Square Feet</Label>
                                    <Input
                                        id="square_feet"
                                        type="number"
                                        value={data.square_feet ?? ''}
                                        onChange={(e) => setData('square_feet', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.square_feet} className="mt-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(v) => setData('status', v)} disabled={processing}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="cleaning_status">Cleaning Status</Label>
                                    <Select value={data.cleaning_status} onValueChange={(v) => setData('cleaning_status', v)} disabled={processing}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select cleaning status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CLEANING_STATUS_OPTIONS.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.cleaning_status} className="mt-1" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <Label>Active</Label>
                                    <p className="text-muted-foreground text-sm">Room is available for use</p>
                                </div>
                                <Checkbox checked={data.is_active} onCheckedChange={(checked) => setData('is_active', !!checked)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Charges</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="room_charges_per_day">Room Charges / Day</Label>
                                    <Input
                                        id="room_charges_per_day"
                                        type="number"
                                        step="0.01"
                                        value={data.room_charges_per_day ?? ''}
                                        onChange={(e) => setData('room_charges_per_day', e.target.value === '' ? null : parseFloat(e.target.value))}
                                        disabled={processing}
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.room_charges_per_day} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="nursing_charges_per_day">Nursing Charges / Day</Label>
                                    <Input
                                        id="nursing_charges_per_day"
                                        type="number"
                                        step="0.01"
                                        value={data.nursing_charges_per_day ?? ''}
                                        onChange={(e) =>
                                            setData('nursing_charges_per_day', e.target.value === '' ? null : parseFloat(e.target.value))
                                        }
                                        disabled={processing}
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.nursing_charges_per_day} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="equipment_charges_per_day">Equipment Charges / Day</Label>
                                    <Input
                                        id="equipment_charges_per_day"
                                        type="number"
                                        step="0.01"
                                        value={data.equipment_charges_per_day ?? ''}
                                        onChange={(e) =>
                                            setData('equipment_charges_per_day', e.target.value === '' ? null : parseFloat(e.target.value))
                                        }
                                        disabled={processing}
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.equipment_charges_per_day} className="mt-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Maintenance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="last_maintenance_date">Last Maintenance</Label>
                                    <Input
                                        id="last_maintenance_date"
                                        type="date"
                                        value={data.last_maintenance_date ?? ''}
                                        onChange={(e) => setData('last_maintenance_date', e.target.value === '' ? null : e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.last_maintenance_date} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="next_maintenance_date">Next Maintenance</Label>
                                    <Input
                                        id="next_maintenance_date"
                                        type="date"
                                        value={data.next_maintenance_date ?? ''}
                                        onChange={(e) => setData('next_maintenance_date', e.target.value === '' ? null : e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.next_maintenance_date} className="mt-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amenities">Amenities</Label>
                                <Textarea
                                    id="amenities"
                                    value={data.amenities}
                                    onChange={(e) => setData('amenities', e.target.value)}
                                    disabled={processing}
                                    placeholder="List room amenities"
                                    rows={3}
                                />
                                <InputError message={errors.amenities} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    disabled={processing}
                                    placeholder="Additional notes about this room"
                                    rows={3}
                                />
                                <InputError message={errors.notes} className="mt-1" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('rooms.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Room
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
