import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface AuditLog {
    id: number;
    action: string;
    target_type: string | null;
    target_id: string | null;
    ip_address: string | null;
    created_at: string;
    actor?: { id: number; name: string } | null;
}

interface PaginatedLogs {
    data: AuditLog[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    logs: PaginatedLogs;
    filters: { action?: string; actor?: string };
}

export default function AuditLogsIndex({ logs, filters }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Audit Logs', href: '/audit-logs' }];

    const [action, setAction] = useState(filters.action || '');
    const [actor, setActor] = useState(filters.actor || '');

    const apply = () => {
        router.get(
            route('audit-logs.index'),
            { ...(action ? { action } : {}), ...(actor ? { actor } : {}) },
            { preserveState: true, replace: true },
        );
    };

    const clear = () => {
        setAction('');
        setActor('');
        router.get(route('audit-logs.index'), {}, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Audit Logs</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="action">Action contains</Label>
                                <Input id="action" value={action} onChange={(e) => setAction(e.target.value)} placeholder="user.created" className="w-[220px]" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="actor">Actor name</Label>
                                <Input id="actor" value={actor} onChange={(e) => setActor(e.target.value)} placeholder="Admin" className="w-[220px]" />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={apply}>Apply</Button>
                                <Button variant="outline" onClick={clear}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Entries (read-only)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Actor</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>IP</TableHead>
                                    <TableHead>At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.map((log: AuditLog) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-mono text-xs font-medium">{log.action}</TableCell>
                                        <TableCell>{log.actor?.name || 'System'}</TableCell>
                                        <TableCell className="text-xs">
                                            {log.target_type ? `${log.target_type} #${log.target_id}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-xs">{log.ip_address || '-'}</TableCell>
                                        <TableCell className="text-xs">{new Date(log.created_at).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                {logs.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-muted-foreground py-6 text-center text-sm">
                                            No audit entries yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {logs.links && logs.links.length > 1 && <Pagination links={logs.links} />}
            </div>
        </AppLayout>
    );
}
