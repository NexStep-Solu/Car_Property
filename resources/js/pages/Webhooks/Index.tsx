import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { useState } from 'react';

interface WebhookEvent {
    id: number;
    provider: string;
    event_id: string;
    event_type: string;
    attempts: number;
    processed_at: string | null;
    received_at: string;
    last_error: string | null;
}

interface PaginatedEvents {
    data: WebhookEvent[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    events: PaginatedEvents;
    filters: { provider?: string; pending?: string };
    providers: string[];
}

export default function WebhooksIndex({ events, filters, providers }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Webhook Events', href: '/webhooks' }];

    const [provider, setProvider] = useState(filters.provider || '');
    const [pendingOnly, setPendingOnly] = useState(filters.pending === '1');

    const apply = () => {
        router.get(
            route('webhooks.index'),
            { ...(provider ? { provider } : {}), ...(pendingOnly ? { pending: '1' } : {}) },
            { preserveState: true, replace: true },
        );
    };

    const clear = () => {
        setProvider('');
        setPendingOnly(false);
        router.get(route('webhooks.index'), {}, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Webhook Events" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Payment Webhook Events</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="provider">Provider</Label>
                                <Input
                                    id="provider"
                                    value={provider}
                                    onChange={(e) => setProvider(e.target.value)}
                                    placeholder={providers[0] || 'manual'}
                                    className="w-[200px]"
                                    list="webhook-providers"
                                />
                                <datalist id="webhook-providers">
                                    {providers.map((p) => (
                                        <option key={p} value={p} />
                                    ))}
                                </datalist>
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={pendingOnly} onChange={(e) => setPendingOnly(e.target.checked)} />
                                Unprocessed only
                            </label>
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
                        <CardTitle>Events (read-only)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Attempts</TableHead>
                                    <TableHead>Processed</TableHead>
                                    <TableHead>Received</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.data.map((event: WebhookEvent) => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-medium">{event.provider}</TableCell>
                                        <TableCell className="font-mono text-xs">{event.event_type}</TableCell>
                                        <TableCell>{event.attempts}</TableCell>
                                        <TableCell>
                                            {event.processed_at ? (
                                                <Badge variant="outline">Yes</Badge>
                                            ) : (
                                                <Badge variant="secondary">Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs">{new Date(event.received_at).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={route('webhooks.show', event.id)}>
                                                <Button variant="outline" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {events.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-muted-foreground py-6 text-center text-sm">
                                            No webhook events yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {events.links && events.links.length > 1 && <Pagination links={events.links} />}
            </div>
        </AppLayout>
    );
}
