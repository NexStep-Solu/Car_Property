import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CheckCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
    id: number;
    type: string;
    title: string;
    body: string;
    read_at: string | null;
    created_at: string;
}

interface PaginatedNotifications {
    data: Notification[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    notifications: PaginatedNotifications;
    unreadCount: number;
}

export default function NotificationsIndex({ notifications, unreadCount }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Notifications', href: '/notifications' }];

    const markRead = (id: number) => {
        router.post(route('notifications.read', id), {}, {
            preserveScroll: true,
            onError: () => toast.error('Could not mark as read.'),
        });
    };

    const markAllRead = () => {
        router.post(route('notifications.read-all'), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('All marked as read.'),
            onError: () => toast.error('Could not update.'),
        });
    };

    const deleteNotification = (id: number) => {
        router.delete(route('notifications.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Notification deleted.'),
            onError: () => toast.error('Could not delete.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="flex items-center gap-2 text-2xl font-bold">
                        Notifications
                        {unreadCount > 0 && <Badge variant="secondary">{unreadCount} unread</Badge>}
                    </h1>
                    {unreadCount > 0 && (
                        <Button variant="outline" className="gap-2" onClick={markAllRead}>
                            <CheckCheck className="h-4 w-4" /> Mark all read
                        </Button>
                    )}
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            {notifications.data.map((n: Notification) => (
                                <div
                                    key={n.id}
                                    className={`flex items-start justify-between gap-4 rounded-lg border p-4 ${n.read_at ? 'opacity-70' : 'bg-primary/5 border-primary/20'}`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-semibold">{n.title}</p>
                                            {!n.read_at && <Badge variant="secondary">New</Badge>}
                                        </div>
                                        <p className="text-muted-foreground mt-1 text-sm">{n.body}</p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {n.type} · {new Date(n.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        {!n.read_at && (
                                            <Button variant="outline" size="sm" onClick={() => markRead(n.id)}>
                                                Mark read
                                            </Button>
                                        )}
                                        <Button variant="outline" size="icon" onClick={() => deleteNotification(n.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {notifications.data.length === 0 && (
                                <p className="text-muted-foreground py-6 text-center text-sm">No notifications.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                {notifications.links && notifications.links.length > 1 && <Pagination links={notifications.links} />}
            </div>
        </AppLayout>
    );
}
