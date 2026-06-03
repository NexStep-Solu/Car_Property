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

interface Currency {
    id: number;
    name: string;
    code: string;
    symbol: string;
    rate: number;
}

interface Props {
    currency: Currency;
}

export default function CurrenciesEdit({ currency }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Currencies',
            href: '/currencies',
        },
        {
            title: 'Edit',
            href: `/currencies/${currency.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: currency.name || '',
        code: currency.code || '',
        symbol: currency.symbol || '',
        rate: currency.rate || 1,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('currencies.update', currency.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Currency updated successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error updating currency', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Currency" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Edit Currency</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Currency Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Currency Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={processing}
                                    placeholder="e.g., US Dollar"
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Currency Code *</Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        required
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., USD"
                                    />
                                    <InputError message={errors.code} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="symbol">Symbol *</Label>
                                    <Input
                                        id="symbol"
                                        type="text"
                                        required
                                        value={data.symbol}
                                        onChange={(e) => setData('symbol', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., $"
                                    />
                                    <InputError message={errors.symbol} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="rate">Exchange Rate *</Label>
                                <Input
                                    id="rate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={data.rate}
                                    onChange={(e) => setData('rate', parseFloat(e.target.value) || 0)}
                                    disabled={processing}
                                    placeholder="1.00"
                                />
                                <InputError message={errors.rate} className="mt-1" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('currencies.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Currency
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
