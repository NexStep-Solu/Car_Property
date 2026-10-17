import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface Report {
    id: number;
    uuid: string;
    target_type: string;
    target_id: number;
    reason: string;
    description: string | null;
    status: string;
    resolved_at: string | null;
    created_at: string;
    reporter?: { id: number; name: string; email: string } | null;
    handler?: { id: number; name: string } | null;
    target_label: string;
}

interface Props {
    report: Report;
    canHandle: boolean;
    statuses: string[];
}

export default function ReportsShow({ report, canHandle, statuses }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: '/reports' },
        { title: `#${report.id}`, href: `/reports/${report.id}` },
    ];

    const handleForm = useForm({ status: '' });

    const submitHandle = (e: React.FormEvent) => {
        e.preventDefault();
        handleForm.post(route('reports.handle', report.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Report updated.'),
            onError: () => toast.error('Could not update report.'),
        });
    };

    const isOpen = report.status === 'open' || report.status === 'reviewing';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Report #${report.id}`} />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Report #{report.id}</h1>
                    <Button variant="secondary" onClick={() => router.visit(route('reports.index'))}>
                        Back
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Report Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                            <p className="text-muted-foreground">Target</p>
                            <p className="font-medium">{report.target_label}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Reason</p>
                            <p className="font-medium">{capitalizeFirst(report.reason.replace(/_/g, ' '))}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Status</p>
                            <Badge variant="outline">{capitalizeFirst(report.status.replace(/_/g, ' '))}</Badge>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Reporter</p>
                            <p className="font-medium">{report.reporter?.name || 'Anonymous'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Handler</p>
                            <p className="font-medium">{report.handler?.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Resolved at</p>
                            <p className="font-medium">{report.resolved_at ? new Date(report.resolved_at).toLocaleString() : '-'}</p>
                        </div>
                        {report.description && (
                            <div className="md:col-span-2">
                                <p className="text-muted-foreground">Description</p>
                                <p className="font-medium whitespace-pre-line">{report.description}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {canHandle && isOpen && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Handle Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitHandle} className="flex flex-wrap items-end gap-4">
                                <div className="grid gap-2">
                                    <Label>New status</Label>
                                    <Select value={handleForm.data.status || undefined} onValueChange={(v) => handleForm.setData('status', v)}>
                                        <SelectTrigger className="w-[220px]">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses
                                                .filter((s) => s !== 'open')
                                                .map((s) => (
                                                    <SelectItem key={s} value={s}>
                                                        {capitalizeFirst(s.replace(/_/g, ' '))}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={handleForm.errors.status} />
                                </div>
                                <Button type="submit" disabled={handleForm.processing}>
                                    Update
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
