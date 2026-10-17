import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Showroom {
    id: number;
    business_name: string;
    slug: string;
    registration_number: string | null;
    phone: string;
    email: string | null;
    address: string;
    region: string | null;
    description: string | null;
}

interface Props {
    showroom: Showroom;
    canDelete: boolean;
}

export default function ShowroomsEdit({ showroom, canDelete }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Showrooms', href: '/showrooms' },
        { title: 'Edit', href: `/showrooms/${showroom.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        business_name: showroom.business_name || '',
        slug: showroom.slug || '',
        registration_number: showroom.registration_number || '',
        phone: showroom.phone || '',
        email: showroom.email || '',
        address: showroom.address || '',
        region: showroom.region || '',
        description: showroom.description || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('showrooms.update', showroom.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Showroom" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="my-4 text-2xl font-bold">Edit Showroom</h1>
                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Business Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="business_name">Business name *</Label>
                                <Input id="business_name" value={data.business_name} onChange={(e) => setData('business_name', e.target.value)} />
                                <InputError message={errors.business_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} />
                                <InputError message={errors.slug} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="registration_number">Registration number</Label>
                                <Input id="registration_number" value={data.registration_number} onChange={(e) => setData('registration_number', e.target.value)} />
                                <InputError message={errors.registration_number} />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone *</Label>
                                    <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    <InputError message={errors.email} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Address *</Label>
                                <Textarea id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} rows={2} />
                                <InputError message={errors.address} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="region">Region</Label>
                                <Input id="region" value={data.region} onChange={(e) => setData('region', e.target.value)} />
                                <InputError message={errors.region} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} />
                                <InputError message={errors.description} />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-between">
                        {canDelete ? (
                            <Button
                                type="button"
                                variant="destructive"
                                className="gap-2"
                                onClick={() => {
                                    if (!confirm(`Delete "${showroom.business_name}"? This cannot be undone.`)) return;
                                    router.delete(route('showrooms.destroy', showroom.id), {
                                        onSuccess: () => toast.success('Showroom deleted.'),
                                        onError: () => toast.error('Could not delete showroom.'),
                                    });
                                }}
                            >
                                <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                        ) : (
                            <span />
                        )}
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Showroom
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
