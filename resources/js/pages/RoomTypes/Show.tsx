import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface Room {
    id: number;
    room_number: string;
    name: string | null;
    floor_id: number | null;
    building_id: number | null;
    status: string;
    is_active: boolean;
}

interface RoomType {
    id: number;
    type_code: string;
    type_name: string;
    description: string | null;
    base_charges_per_day: number | null;
    requires_deposit: boolean;
    deposit_amount: number | null;
    is_active: boolean;
    rooms_count?: number;
    rooms?: Room[];
}

interface Props {
    roomType: RoomType;
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function RoomTypesShow({ roomType }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Room Types', href: '/room_types' },
        { title: roomType.type_name, href: `/room_types/${roomType.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Room Type: ${roomType.type_name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{roomType.type_name}</h1>
                        <p className="text-muted-foreground text-sm">Room Type Details</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('room_types.edit', roomType.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('room_types.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Room Type Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                        <Info label="ID" value={roomType.id} />
                        <Info label="Type Code" value={roomType.type_code} />
                        <Info label="Type Name" value={roomType.type_name} />
                        <Info label="Base Charges Per Day" value={roomType.base_charges_per_day} />
                        <Info label="Rooms Count" value={roomType.rooms_count ?? 0} />
                        <Info label="Status" value={roomType.is_active ? 'Active' : 'Inactive'} />
                        <Info label="Requires Deposit" value={roomType.requires_deposit ? 'Yes' : 'No'} />
                        <Info label="Deposit Amount" value={roomType.deposit_amount} />
                        <div className="md:col-span-2 lg:col-span-3">
                            <p className="text-muted-foreground text-sm">Description</p>
                            <p className="font-medium">{roomType.description || '-'}</p>
                        </div>
                    </CardContent>
                </Card>

                {roomType.rooms && roomType.rooms.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Rooms ({roomType.rooms.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Room Number</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Active</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roomType.rooms.map((room) => (
                                        <TableRow key={room.id}>
                                            <TableCell>{room.id}</TableCell>
                                            <TableCell className="font-medium">{room.room_number}</TableCell>
                                            <TableCell>{room.name || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{room.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {room.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={route('rooms.show', room.id)}>
                                                    <Button size="sm" variant="outline">
                                                        View
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {(!roomType.rooms || roomType.rooms.length === 0) && (
                    <Card>
                        <CardContent className="text-muted-foreground py-8 text-center">No rooms found for this type</CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
