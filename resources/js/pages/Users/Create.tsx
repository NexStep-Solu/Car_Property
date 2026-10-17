import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface Role {
    id: number;
    name: string;
    guard_name: string;
}

interface Props {
    roles: Role[];
}

export default function UsersCreate({ roles }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: '/users' },
        { title: 'Create', href: '/users/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as number[],
    });

    const toggleRole = (id: number) => {
        setData('roles', data.roles.includes(id) ? data.roles.filter((r) => r !== id) : [...data.roles, id]);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="my-4 text-2xl font-bold">Create New User</h1>
                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Full name" />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="email@example.com" />
                                <InputError message={errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Min 8 characters" />
                                <InputError message={errors.password} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                                <InputError message={errors.password_confirmation} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Spatie Roles</Label>
                                {(['web', 'admin'] as const).map((guard) =>
                                    roles.filter((role) => role.guard_name === guard).length > 0 ? (
                                        <div key={guard} className="space-y-2">
                                            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                                                {guard} guard
                                            </p>
                                            {roles
                                                .filter((role) => role.guard_name === guard)
                                                .map((role) => (
                                                    <label key={role.id} className="flex items-center gap-2 text-sm">
                                                        <Checkbox checked={data.roles.includes(role.id)} onClick={() => toggleRole(role.id)} />
                                                        {role.name}
                                                    </label>
                                                ))}
                                        </div>
                                    ) : null,
                                )}
                                <InputError message={errors.roles} />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create User
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
