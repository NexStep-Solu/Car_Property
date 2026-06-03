import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus } from 'lucide-react';

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
}

interface Props {
    roomTypes: {
        data: RoomType[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function RoomTypesIndex({ roomTypes }: Props) {
    const { hasPermission } = usePermission();
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Room Types', href: '/room_types' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Room Types" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Room Types</h1>

                    {hasPermission('create_room_types') && (
                        <Link href={route('room_types.create')}>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Add Room Type
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Room Types List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Type Code</TableHead>
                                    <TableHead>Type Name</TableHead>
                                    <TableHead>Base Charges</TableHead>
                                    <TableHead>Deposit</TableHead>
                                    <TableHead>Rooms</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roomTypes.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-muted-foreground text-center">
                                            No room types found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    roomTypes.data.map((rt: RoomType) => (
                                        <TableRow key={rt.id}>
                                            <TableCell>{rt.id}</TableCell>
                                            <TableCell className="font-medium">{rt.type_code}</TableCell>
                                            <TableCell>{rt.type_name}</TableCell>
                                            <TableCell>{rt.base_charges_per_day ?? '-'}</TableCell>
                                            <TableCell>
                                                {rt.requires_deposit ? (
                                                    <Badge variant="secondary">Yes ({rt.deposit_amount ?? '-'})</Badge>
                                                ) : (
                                                    <Badge variant="outline">No</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{rt.rooms_count ?? 0}</TableCell>
                                            <TableCell>
                                                {rt.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={route('room_types.show', rt.id)}>
                                                        <Button size="icon" variant="outline">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {hasPermission('update_room_types') && (
                                                        <Link href={route('room_types.edit', rt.id)}>
                                                            <Button size="icon" variant="outline">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {roomTypes.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-muted-foreground text-sm">
                                    Showing {roomTypes.data.length > 0 ? (roomTypes.current_page - 1) * roomTypes.per_page + 1 : 0} to{' '}
                                    {Math.min(roomTypes.current_page * roomTypes.per_page, roomTypes.total)} of {roomTypes.total} results
                                </p>
                                <div className="flex gap-1">
                                    {roomTypes.links.map((link, index) => (
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
            </div>
        </AppLayout>
    );
}
