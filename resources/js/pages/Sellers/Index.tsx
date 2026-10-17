import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';

interface Application {
    id: number;
    uuid: string;
    seller_type: string;
    full_name: string;
    phone: string;
    status: string;
    submitted_at: string | null;
    user?: { id: number; name: string; email: string } | null;
}

interface PaginatedApplications {
    data: Application[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Profile {
    id: number;
    seller_type: string;
    display_name: string;
    verification_status: string;
    user?: { id: number; name: string; email: string } | null;
}

interface Props {
    applications: PaginatedApplications;
    profiles: Profile[] | { data: Profile[]; links: Array<{ url: string | null; label: string; active: boolean }> };
    canReview: boolean;
}

export default function SellersIndex({ applications, profiles }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Sellers', href: '/seller-applications' }];

    const profileList: Profile[] = Array.isArray(profiles) ? profiles : profiles.data;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seller Verification" />
            <div className="space-y-6 p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Seller Verification</h1>
                    <Link href={route('seller-applications.create')}>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Apply as Seller
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Applicant</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.data.map((app: Application) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">{app.full_name}</TableCell>
                                        <TableCell>{capitalizeFirst(app.seller_type)}</TableCell>
                                        <TableCell>{app.phone}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{capitalizeFirst(app.status.replace(/_/g, ' '))}</Badge>
                                        </TableCell>
                                        <TableCell>{app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={route('seller-applications.show', app.id)}>
                                                <Button variant="outline" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {applications.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-muted-foreground py-6 text-center text-sm">
                                            No applications yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {applications.links && applications.links.length > 1 && <Pagination links={applications.links} />}

                <Card>
                    <CardHeader>
                        <CardTitle>Seller Profiles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Display Name</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Verification</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {profileList.map((profile: Profile) => (
                                    <TableRow key={profile.id}>
                                        <TableCell className="font-medium">{profile.display_name}</TableCell>
                                        <TableCell>{profile.user?.name || '-'}</TableCell>
                                        <TableCell>{capitalizeFirst(profile.seller_type)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{capitalizeFirst(profile.verification_status.replace(/_/g, ' '))}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {profileList.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-muted-foreground py-6 text-center text-sm">
                                            No seller profiles yet. Profiles are created when an application is approved.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
