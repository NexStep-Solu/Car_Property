import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

interface Permission {
    id: number;
    name: string;
}

interface Props {
    permissions: Permission[];
}

export default function RolesCreate({ permissions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Roles',
            href: '/roles',
        },
        {
            title: 'Create',
            href: '/roles/create',
        },
    ];

    const [, setSelectedPermissions] = useState<number[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        permissions: [] as number[],
    });

    const togglePermission = (permissionId: number) => {
        const newPermissions = data.permissions.includes(permissionId)
            ? data.permissions.filter((id) => id !== permissionId)
            : [...data.permissions, permissionId];
        setData('permissions', newPermissions);
        setSelectedPermissions(newPermissions);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('roles.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Role created successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
                reset();
                setSelectedPermissions([]);
            },
            onError: () => {
                toast.error('Error creating role', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Create New Role</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Role Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={processing}
                                    placeholder="Enter role name"
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-4">
                                {permissions.map((permission) => (
                                    <div key={permission.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`perm-${permission.id}`}
                                            checked={data.permissions.includes(permission.id)}
                                            onCheckedChange={() => togglePermission(permission.id)}
                                        />
                                        <Label htmlFor={`perm-${permission.id}`} className="cursor-pointer text-sm font-normal">
                                            {permission.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <InputError message={errors.permissions} className="mt-1" />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('roles.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create Role
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
