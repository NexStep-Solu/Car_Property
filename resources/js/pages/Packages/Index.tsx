import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Package {
    id: number;
    name: string;
    slug: string;
    price_amount: number;
    currency: string;
    duration_days: number;
    active_listing_limit: number;
    featured_ads_limit: number;
    is_active: boolean;
    sort_order: number;
}

interface PaginatedPackages {
    data: Package[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    packages: PaginatedPackages;
    expiredAdsActions: string[];
}

export default function PackagesIndex({ packages }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Packages', href: '/packages' }];

    const deletePackage = (pkg: Package) => {
        if (!confirm(`Delete package "${pkg.name}"?`)) return;
        router.delete(route('packages.destroy', pkg.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Package deleted.'),
            onError: () => toast.error('Could not delete package.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Packages" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Packages</h1>
                    <Link href={route('packages.create')}>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Package
                        </Button>
                    </Link>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Packages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Listings</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {packages.data.map((pkg: Package) => (
                                    <TableRow key={pkg.id}>
                                        <TableCell className="font-medium">{pkg.name}</TableCell>
                                        <TableCell>
                                            {Number(pkg.price_amount).toLocaleString()} {pkg.currency}
                                        </TableCell>
                                        <TableCell>{pkg.duration_days} days</TableCell>
                                        <TableCell>{pkg.active_listing_limit === 0 ? 'Unlimited' : pkg.active_listing_limit}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{pkg.is_active ? 'Yes' : 'No'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('packages.edit', pkg.id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="outline" size="icon" onClick={() => deletePackage(pkg)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {packages.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-muted-foreground py-6 text-center text-sm">
                                            No packages yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {packages.links && packages.links.length > 1 && <Pagination links={packages.links} />}
            </div>
        </AppLayout>
    );
}
