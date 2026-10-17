import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';

interface Car {
    id: number;
    title: string;
    year: number;
    price_amount: number;
    currency: string;
    location: string;
    status: string;
    is_featured: boolean;
    make?: { id: number; name: string } | null;
    model?: { id: number; name: string } | null;
    showroom?: { id: number; business_name: string } | null;
    seller?: { id: number; name: string } | null;
}

interface PaginatedCars {
    data: Car[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Filters {
    status?: string;
    make_id?: string;
    search?: string;
}

interface Props {
    cars: PaginatedCars;
    filters: Filters;
    statuses: string[];
    makes: Array<{ id: number; name: string }>;
    canReview: boolean;
}

function formatPrice(amount: number, currency: string): string {
    return `${Number(amount).toLocaleString()} ${currency}`;
}

export default function CarsIndex({ cars, filters, statuses, makes }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Cars', href: '/cars' }];

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [makeId, setMakeId] = useState(filters.make_id || '');

    const applyFilters = () => {
        router.get(
            route('cars.index'),
            {
                ...(search ? { search } : {}),
                ...(status ? { status } : {}),
                ...(makeId ? { make_id: makeId } : {}),
            },
            { preserveState: true, replace: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setMakeId('');
        router.get(route('cars.index'), {}, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cars" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Cars</h1>
                    <Link href={route('cars.create')}>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Car
                        </Button>
                    </Link>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="search">Search</Label>
                                <Input
                                    id="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Title or location"
                                    className="w-[220px]"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select value={status || undefined} onValueChange={setStatus}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {capitalizeFirst(s.replace(/_/g, ' '))}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Make</Label>
                                <Select value={makeId || undefined} onValueChange={setMakeId}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All makes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {makes.map((m) => (
                                            <SelectItem key={m.id} value={String(m.id)}>
                                                {m.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={applyFilters}>Apply</Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Listings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Make / Model</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cars.data.map((car: Car) => (
                                    <TableRow key={car.id}>
                                        <TableCell className="font-medium">
                                            {car.title}
                                            {car.is_featured && (
                                                <Badge variant="secondary" className="ml-2">
                                                    Featured
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {[car.make?.name, car.model?.name].filter(Boolean).join(' ') || '-'}
                                        </TableCell>
                                        <TableCell>{car.year}</TableCell>
                                        <TableCell>{formatPrice(car.price_amount, car.currency)}</TableCell>
                                        <TableCell>{car.location}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{capitalizeFirst(car.status.replace(/_/g, ' '))}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('cars.show', car.id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={route('cars.edit', car.id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {cars.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-muted-foreground py-6 text-center text-sm">
                                            No cars found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {cars.links && cars.links.length > 1 && <Pagination links={cars.links} />}
            </div>
        </AppLayout>
    );
}
