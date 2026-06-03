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

interface CreditLevel {
    id: number;
    name: string;
    description: string | null;
    min_amount: number;
    max_amount: number;
    max_term: number | null;
    interest_rate: number | null;
    is_default: boolean;
}

interface Props {
    creditLevel: CreditLevel;
}

export default function CreditLevelsEdit({ creditLevel }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Credit Levels',
            href: '/credit-level',
        },
        {
            title: 'Edit',
            href: `/credit-level/${creditLevel.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: creditLevel.name || '',
        description: creditLevel.description || '',
        min_amount: creditLevel.min_amount?.toString() || '',
        max_amount: creditLevel.max_amount?.toString() || '',
        max_term: creditLevel.max_term?.toString() || '',
        interest_rate: creditLevel.interest_rate?.toString() || '',
        is_default: creditLevel.is_default,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('creditlevels.update', creditLevel.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Credit level updated successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error updating credit level', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Credit Level" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Edit Credit Level</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Credit Level Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Level Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={processing}
                                    placeholder="e.g., Silver, Gold, Platinum"
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    type="text"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    disabled={processing}
                                    placeholder="Brief description"
                                />
                                <InputError message={errors.description} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="min_amount">Minimum Amount *</Label>
                                    <Input
                                        id="min_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={data.min_amount}
                                        onChange={(e) => setData('min_amount', e.target.value)}
                                        disabled={processing}
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.min_amount} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="max_amount">Maximum Amount *</Label>
                                    <Input
                                        id="max_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={data.max_amount}
                                        onChange={(e) => setData('max_amount', e.target.value)}
                                        disabled={processing}
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.max_amount} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="max_term">Maximum Term (months)</Label>
                                    <Input
                                        id="max_term"
                                        type="number"
                                        min="0"
                                        value={data.max_term}
                                        onChange={(e) => setData('max_term', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 12"
                                    />
                                    <InputError message={errors.max_term} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                                    <Input
                                        id="interest_rate"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.interest_rate}
                                        onChange={(e) => setData('interest_rate', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 5.00"
                                    />
                                    <InputError message={errors.interest_rate} className="mt-1" />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_default"
                                    checked={data.is_default}
                                    onChange={(e) => setData('is_default', e.target.checked)}
                                    disabled={processing}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="is_default" className="cursor-pointer">
                                    Set as default credit level
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('creditlevel.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Credit Level
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
