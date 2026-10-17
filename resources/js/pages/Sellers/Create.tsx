import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface Props {
    sellerTypes: string[];
}

export default function SellersCreate({ sellerTypes }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sellers', href: '/seller-applications' },
        { title: 'Apply', href: '/seller-applications/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        seller_type: '',
        full_name: '',
        phone: '',
        email: '',
        address: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('seller-applications.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Apply as Seller" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="my-4 text-2xl font-bold">Apply as Seller</h1>
                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Seller type *</Label>
                                <Select value={data.seller_type || undefined} onValueChange={(v) => setData('seller_type', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sellerTypes.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {capitalizeFirst(t)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.seller_type} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="full_name">Full name *</Label>
                                <Input id="full_name" value={data.full_name} onChange={(e) => setData('full_name', e.target.value)} />
                                <InputError message={errors.full_name} />
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
                                <Label htmlFor="address">Address</Label>
                                <Textarea id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} rows={2} />
                                <InputError message={errors.address} />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create Draft
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
