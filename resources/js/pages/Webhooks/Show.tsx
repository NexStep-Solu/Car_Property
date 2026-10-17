import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

interface WebhookEvent {
    id: number;
    provider: string;
    event_id: string;
    event_type: string;
    payload_safe: Record<string, unknown> | null;
    received_at: string;
    processed_at: string | null;
    attempts: number;
    last_error: string | null;
}

interface Props {
    event: WebhookEvent;
}

export default function WebhooksShow({ event }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Webhook Events', href: '/webhooks' },
        { title: `#${event.id}`, href: `/webhooks/${event.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Webhook #${event.id}`} />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {event.provider} · {event.event_type}
                    </h1>
                    <Button variant="secondary" onClick={() => router.visit(route('webhooks.index'))}>
                        Back
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Event Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                            <p className="text-muted-foreground">Event ID</p>
                            <p className="font-mono text-xs break-all">{event.event_id}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Processed</p>
                            <Badge variant="outline">{event.processed_at ? new Date(event.processed_at).toLocaleString() : 'Pending'}</Badge>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Attempts</p>
                            <p className="font-medium">{event.attempts}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Received</p>
                            <p className="font-medium">{new Date(event.received_at).toLocaleString()}</p>
                        </div>
                        {event.last_error && (
                            <div className="md:col-span-2">
                                <p className="text-muted-foreground">Last error</p>
                                <p className="font-mono text-xs break-all whitespace-pre-line">{event.last_error}</p>
                            </div>
                        )}
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground">Payload (safe)</p>
                            <pre className="bg-muted overflow-x-auto rounded-lg p-4 font-mono text-xs">{JSON.stringify(event.payload_safe, null, 2)}</pre>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
