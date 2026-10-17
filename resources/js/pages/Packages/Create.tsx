import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
    expiredAdsActions: string[];
}

export function PackageFormFields({ data, setData, errors, expiredAdsActions }: {
    data: Record<string, string | number | boolean>;
    setData: (key: string, value: string | number | boolean) => void;
    errors: Record<string, string>;
    expiredAdsActions: string[];
}) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={String(data.name || '')} onChange={(e) => setData('name', e.target.value)} />
                <InputError message={errors.name} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="slug">Slug (optional, auto-generated)</Label>
                <Input id="slug" value={String(data.slug || '')} onChange={(e) => setData('slug', e.target.value)} />
                <InputError message={errors.slug} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={String(data.description || '')} onChange={(e) => setData('description', e.target.value)} rows={3} />
                <InputError message={errors.description} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                    <Label htmlFor="price_amount">Price *</Label>
                    <Input id="price_amount" type="number" min="0" value={String(data.price_amount || '')} onChange={(e) => setData('price_amount', e.target.value)} />
                    <InputError message={errors.price_amount} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Input id="currency" value={String(data.currency || '')} onChange={(e) => setData('currency', e.target.value.toUpperCase())} maxLength={3} />
                    <InputError message={errors.currency} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="duration_days">Duration (days) *</Label>
                    <Input id="duration_days" type="number" min="1" value={String(data.duration_days || '')} onChange={(e) => setData('duration_days', e.target.value)} />
                    <InputError message={errors.duration_days} />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                    <Label htmlFor="active_listing_limit">Listing limit * (0 = unlimited)</Label>
                    <Input id="active_listing_limit" type="number" min="0" value={String(data.active_listing_limit ?? '')} onChange={(e) => setData('active_listing_limit', e.target.value)} />
                    <InputError message={errors.active_listing_limit} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="featured_ads_limit">Featured limit</Label>
                    <Input id="featured_ads_limit" type="number" min="0" value={String(data.featured_ads_limit ?? '')} onChange={(e) => setData('featured_ads_limit', e.target.value)} />
                    <InputError message={errors.featured_ads_limit} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="sort_order">Sort order</Label>
                    <Input id="sort_order" type="number" min="0" value={String(data.sort_order ?? '')} onChange={(e) => setData('sort_order', e.target.value)} />
                    <InputError message={errors.sort_order} />
                </div>
            </div>
            <div className="grid gap-2">
                <Label>Expired ads action *</Label>
                <Select value={String(data.expired_ads_action || 'hide')} onValueChange={(v) => setData('expired_ads_action', v)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {expiredAdsActions.map((a) => (
                            <SelectItem key={a} value={a}>
                                {capitalizeFirst(a.replace(/_/g, ' '))}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.expired_ads_action} />
            </div>
            <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={data.is_active === true || data.is_active === '1' || data.is_active === 1} onClick={() => setData('is_active', !(data.is_active === true))} />
                Active
            </label>
        </>
    );
}

export default function PackagesCreate({ expiredAdsActions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Packages', href: '/packages' },
        { title: 'Create', href: '/packages/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        price_amount: '',
        currency: 'MMK',
        duration_days: '30',
        active_listing_limit: '10',
        featured_ads_limit: '',
        sort_order: '',
        expired_ads_action: 'hide',
        is_active: true as boolean,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('packages.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Package" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="my-4 text-2xl font-bold">Create Package</h1>
                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Package Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <PackageFormFields data={data} setData={setData} errors={errors} expiredAdsActions={expiredAdsActions} />
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create Package
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
