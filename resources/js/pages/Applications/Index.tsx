import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Application {
    id: number;
    uuid: string;
    status: string;
    submitted_at: string | null;
    showroom?: { id: number; business_name: string; slug: string } | null;
    submitter?: { id: number; name: string; email: string } | null;
    can_delete?: boolean;
}

interface PaginatedApplications {
    data: Application[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    applications: PaginatedApplications;
    canReview: boolean;
}

export default function ApplicationsIndex({ applications }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Applications', href: '/applications' }];

    const deleteApplication = (app: Application) => {
        if (!confirm(`Delete application #${app.id}? This cannot be undone.`)) return;
        router.delete(route('applications.destroy', app.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Application deleted.'),
            onError: () => toast.error('Could not delete application.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Showroom Applications" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Verification Applications</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Showroom</TableHead>
                                    <TableHead>Submitted By</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.data.map((app: Application) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">{app.showroom?.business_name || '-'}</TableCell>
                                        <TableCell>{app.submitter?.name || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{capitalizeFirst(app.status.replace(/_/g, ' '))}</Badge>
                                        </TableCell>
                                        <TableCell>{app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('applications.show', app.id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                {app.can_delete && (
                                                    <Button variant="outline" size="icon" onClick={() => deleteApplication(app)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {applications.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-muted-foreground py-6 text-center text-sm">
                                            No applications yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {applications.links && applications.links.length > 1 && <Pagination links={applications.links} />}
            </div>
        </AppLayout>
    );
}
