import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Owner {
    id: number;
    name: string;
    email: string;
}

interface Showroom {
    id: number;
    business_name: string;
    slug: string;
    phone: string;
    region: string | null;
    verification_status: string;
    owner?: Owner | null;
    can_delete?: boolean;
}

interface PaginatedShowrooms {
    data: Showroom[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    showrooms: PaginatedShowrooms;
    canCreate: boolean;
    canReview: boolean;
}

export default function ShowroomsIndex({ showrooms }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Showrooms', href: '/showrooms' }];

    const deleteShowroom = (showroom: Showroom) => {
        if (!confirm(`Delete "${showroom.business_name}"? This cannot be undone.`)) return;
        router.delete(route('showrooms.destroy', showroom.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Showroom deleted.'),
            onError: () => toast.error('Could not delete showroom.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Showrooms" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Showrooms</h1>
                    <Link href={route('showrooms.create')}>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Showroom
                        </Button>
                    </Link>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Showrooms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Business</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Region</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {showrooms.data.map((showroom: Showroom) => (
                                    <TableRow key={showroom.id}>
                                        <TableCell className="font-medium">{showroom.business_name}</TableCell>
                                        <TableCell>{showroom.phone}</TableCell>
                                        <TableCell>{showroom.region || '-'}</TableCell>
                                        <TableCell>{showroom.owner?.name || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{capitalizeFirst(showroom.verification_status.replace(/_/g, ' '))}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('showrooms.show', showroom.id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={route('showrooms.edit', showroom.id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                {showroom.can_delete && (
                                                    <Button variant="outline" size="icon" onClick={() => deleteShowroom(showroom)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {showrooms.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-muted-foreground py-6 text-center text-sm">
                                            No showrooms yet. Create your first showroom to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {showrooms.links && showrooms.links.length > 1 && <Pagination links={showrooms.links} />}
            </div>
        </AppLayout>
    );
}
