import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

export default function ShowroomsCreate() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Showrooms', href: '/showrooms' },
        { title: 'Create', href: '/showrooms/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        business_name: '',
        slug: '',
        registration_number: '',
        phone: '',
        email: '',
        address: '',
        region: '',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('showrooms.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Showroom" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="my-4 text-2xl font-bold">Create New Showroom</h1>
                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Business Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="business_name">Business name *</Label>
                                <Input id="business_name" value={data.business_name} onChange={(e) => setData('business_name', e.target.value)} placeholder="Yangon Motors" />
                                <InputError message={errors.business_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug (optional, auto-generated)</Label>
                                <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} placeholder="yangon-motors" />
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
                                    <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="09123456789" />
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="info@example.com" />
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
                                <Input id="region" value={data.region} onChange={(e) => setData('region', e.target.value)} placeholder="Yangon" />
                                <InputError message={errors.region} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} />
                                <InputError message={errors.description} />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create Showroom
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
