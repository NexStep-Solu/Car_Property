import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface Props {
    user: User;
}

export default function UsersShow({ user }: Props) {
    const { hasPermission } = usePermission();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: '/users' },
        { title: user.name, href: `/users/${user.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User: ${user.name}`} />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{user.name}</h1>
                        <p className="text-muted-foreground text-sm">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                        {hasPermission('update_user') && (
                            <Link href={route('users.edit', user.id)}>
                                <Button variant="outline" className="gap-2">
                                    <Pencil className="h-4 w-4" /> Edit
                                </Button>
                            </Link>
                        )}
                        <Button variant="secondary" onClick={() => router.visit(route('users.index'))}>
                            Back
                        </Button>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>User Information (Spatie)</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                            <p className="text-muted-foreground">Name</p>
                            <p className="font-medium">{user.name}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Email</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Roles</p>
                            <p className="font-medium">
                                {user.roles?.length ? user.roles.map((r) => capitalizeFirst(r.name)).join(', ') : '-'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
