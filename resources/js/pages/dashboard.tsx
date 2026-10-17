import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Key, Shield, Users } from 'lucide-react';

interface Props {
    stats: {
        users: number;
        roles: number;
        permissions: number;
    };
}

export default function Dashboard({ stats }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />

            <div className="space-y-6 p-4 lg:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.users}</div>
                            <p className="text-muted-foreground text-xs">Registered users (Spatie)</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                            <Shield className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.roles}</div>
                            <p className="text-muted-foreground text-xs">Spatie roles</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
                            <Key className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.permissions}</div>
                            <p className="text-muted-foreground text-xs">Spatie permissions</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
