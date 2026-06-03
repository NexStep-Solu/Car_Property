import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface RoomType {
    id: number;
    type_name: string;
    type_code: string | null;
}

interface Department {
    id: number;
    name: string;
}

interface Bed {
    id: number;
    room_id: number;
    bed_number: string;
    bed_type: string;
    status: string;
    is_active: boolean;
    has_ventilator: boolean;
    has_monitor: boolean;
    has_suction: boolean;
    has_oxygen: boolean;
    is_isolated: boolean;
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
    beds?: Bed[];
}

interface Props {
    room: Room;
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status.toLowerCase()) {
        case 'available':
            return 'default';
        case 'occupied':
            return 'secondary';
        case 'maintenance':
        case 'out-of-service':
            return 'destructive';
        case 'reserved':
        case 'cleaning':
            return 'outline';
        default:
            return 'secondary';
    }
}

function getCleaningStatusVariant(status: string): 'default' | 'secondary' | 'outline' {
    switch (status.toLowerCase()) {
        case 'clean':
        case 'sanitized':
            return 'default';
        case 'in-progress':
            return 'outline';
        case 'dirty':
            return 'secondary';
        default:
            return 'secondary';
    }
}

export default function RoomsShow({ room }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Rooms', href: '/rooms' },
        { title: room.room_number, href: `/rooms/${room.id}` },
    ];

    const totalChargesPerDay = (room.room_charges_per_day ?? 0) + (room.nursing_charges_per_day ?? 0) + (room.equipment_charges_per_day ?? 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Room: ${room.room_number}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{room.room_number}</h1>
                        {room.name && <p className="text-muted-foreground">{room.name}</p>}
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('rooms.edit', room.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('rooms.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Room Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <Info label="ID" value={room.id} />
                            <Info label="Room Number" value={room.room_number} />
                            <Info label="Name" value={room.name} />
                            <Info label="Room Type" value={room.roomType?.type_name} />
                            <Info label="Type Code" value={room.roomType?.type_code} />
                            <Info label="Department" value={room.department?.name} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <div>
                                <p className="text-muted-foreground text-sm">Status</p>
                                <Badge variant={getStatusVariant(room.status)}>{room.status}</Badge>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">Cleaning Status</p>
                                <Badge variant={getCleaningStatusVariant(room.cleaning_status)}>{room.cleaning_status}</Badge>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">Active</p>
                                {room.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                            </div>
                            <Info label="Capacity (Beds)" value={room.capacity} />
                            <Info label="Current Occupancy" value={`${room.current_occupancy} / ${room.capacity}`} />
                            <Info label="Square Feet" value={room.square_feet ? `${room.square_feet} sq ft` : null} />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Location</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <Info label="Floor ID" value={room.floor_id} />
                            <Info label="Building ID" value={room.building_id} />
                            <Info label="Wing" value={room.wing} />
                            <Info label="Corridor" value={room.corridor} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Charges (Per Day)</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <Info label="Room Charges" value={formatCurrency(room.room_charges_per_day)} />
                            <Info label="Nursing Charges" value={formatCurrency(room.nursing_charges_per_day)} />
                            <Info label="Equipment Charges" value={formatCurrency(room.equipment_charges_per_day)} />
                            <div className="border-t pt-2 md:col-span-2">
                                <p className="text-muted-foreground text-sm">Total Charges</p>
                                <p className="text-lg font-bold">{formatCurrency(totalChargesPerDay)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Maintenance</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="Last Maintenance Date" value={formatDate(room.last_maintenance_date)} />
                        <Info label="Next Maintenance Date" value={formatDate(room.next_maintenance_date)} />
                    </CardContent>
                </Card>

                {room.amenities && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Amenities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{room.amenities}</p>
                        </CardContent>
                    </Card>
                )}

                {room.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{room.notes}</p>
                        </CardContent>
                    </Card>
                )}

                {room.beds && room.beds.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Beds ({room.beds.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Bed Number</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Active</TableHead>
                                        <TableHead>Equipment</TableHead>
                                        <TableHead>Isolated</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {room.beds.map((bed) => (
                                        <TableRow key={bed.id}>
                                            <TableCell className="font-medium">{bed.bed_number}</TableCell>
                                            <TableCell>{bed.bed_type}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(bed.status)}>{bed.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {bed.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {bed.has_ventilator && <Badge variant="outline">Vent</Badge>}
                                                    {bed.has_monitor && <Badge variant="outline">Mon</Badge>}
                                                    {bed.has_suction && <Badge variant="outline">Suc</Badge>}
                                                    {bed.has_oxygen && <Badge variant="outline">O2</Badge>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {bed.is_isolated ? <Badge variant="destructive">Yes</Badge> : <Badge variant="outline">No</Badge>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
