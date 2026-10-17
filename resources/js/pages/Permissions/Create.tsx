import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

export default function PermissionsCreate() {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Permissions',
            href: '/permissions',
        },
        {
            title: 'Create',
            href: '/permissions/create',
        },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('permissions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Permission created successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
                reset();
            },
            onError: () => {
                toast.error('Error creating permission', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Permission" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Create New Permission</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Permission Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Permission Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={processing}
                                    placeholder="e.g., create-users, update-patients"
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('permissions.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create Permission
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
