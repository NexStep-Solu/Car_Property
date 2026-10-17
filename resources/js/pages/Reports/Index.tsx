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

interface Report {
    id: number;
    target_type: string;
    target_id: number;
    reason: string;
    status: string;
    created_at: string;
    reporter?: { id: number; name: string } | null;
}

interface PaginatedReports {
    data: Report[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    reports: PaginatedReports;
    filters: { status?: string };
    statuses: string[];
    canHandle: boolean;
}

export default function ReportsIndex({ reports }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reports', href: '/reports' }];

    const deleteReport = (report: Report) => {
        if (!confirm(`Delete report #${report.id}?`)) return;
        router.delete(route('reports.destroy', report.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Report deleted.'),
            onError: () => toast.error('Could not delete report.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Reports</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Submitted Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Reporter</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.data.map((report: Report) => (
                                    <TableRow key={report.id}>
                                        <TableCell className="font-medium">
                                            {capitalizeFirst(report.target_type)} #{report.target_id}
                                        </TableCell>
                                        <TableCell>{capitalizeFirst(report.reason.replace(/_/g, ' '))}</TableCell>
                                        <TableCell>{report.reporter?.name || 'Anonymous'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{capitalizeFirst(report.status.replace(/_/g, ' '))}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('reports.show', report.id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="outline" size="icon" onClick={() => deleteReport(report)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {reports.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-muted-foreground py-6 text-center text-sm">
                                            No reports yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {reports.links && reports.links.length > 1 && <Pagination links={reports.links} />}
            </div>
        </AppLayout>
    );
}
