import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Eye, Pencil, Plus } from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles?: Role[];
}

interface PaginatedUsers {
    data: User[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    users: PaginatedUsers;
    roles: Role[];
}

export default function UsersIndex({ users }: Props) {
    const { hasPermission } = usePermission();

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users', href: '/users' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">User Management (Spatie)</h1>
                    {hasPermission('create_user') && (
                        <Link href={route('users.create')}>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Add User
                            </Button>
                        </Link>
                    )}
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.map((user: User) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user.roles && user.roles.length > 0
                                                ? user.roles.map((role) => capitalizeFirst(role.name)).join(', ')
                                                : 'No role'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {hasPermission('view_user') && (
                                                    <Link href={route('users.show', user.id)}>
                                                        <Button variant="outline" size="icon">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                                {hasPermission('update_user') && (
                                                    <Link href={route('users.edit', user.id)}>
                                                        <Button variant="outline" size="icon">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {users.links && users.links.length > 1 && <Pagination links={users.links} />}
            </div>
        </AppLayout>
    );
}
