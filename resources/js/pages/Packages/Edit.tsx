import { PackageFormFields } from './Create';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface Package {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price_amount: number;
    currency: string;
    duration_days: number;
    active_listing_limit: number;
    featured_ads_limit: number;
    expired_ads_action: string;
    is_active: boolean;
    sort_order: number;
}

interface Props {
    package: Package;
    expiredAdsActions: string[];
}

export default function PackagesEdit({ package: pkg, expiredAdsActions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Packages', href: '/packages' },
        { title: 'Edit', href: `/packages/${pkg.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: pkg.name || '',
        slug: pkg.slug || '',
        description: pkg.description || '',
        price_amount: String(pkg.price_amount ?? ''),
        currency: pkg.currency || '',
        duration_days: String(pkg.duration_days ?? ''),
        active_listing_limit: String(pkg.active_listing_limit ?? ''),
        featured_ads_limit: String(pkg.featured_ads_limit ?? ''),
        sort_order: String(pkg.sort_order ?? ''),
        expired_ads_action: pkg.expired_ads_action || 'hide',
        is_active: !!pkg.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('packages.update', pkg.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Package" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="my-4 text-2xl font-bold">Edit Package</h1>
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
                            Update Package
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
