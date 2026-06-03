import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface RoomType {
    id: number;
    type_code: string;
    type_name: string;
    description: string | null;
    base_charges_per_day: number | null;
    requires_deposit: boolean;
    deposit_amount: number | null;
    is_active: boolean;
}

interface Props {
    roomType: RoomType;
}

export default function RoomTypesEdit({ roomType }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Room Types', href: '/room_types' },
        { title: roomType.type_name, href: `/room_types/${roomType.id}` },
        { title: 'Edit', href: `/room_types/${roomType.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        type_code: roomType.type_code || '',
        type_name: roomType.type_name || '',
        description: roomType.description || '',
        base_charges_per_day: roomType.base_charges_per_day as number | null,
        requires_deposit: roomType.requires_deposit as boolean,
        deposit_amount: roomType.deposit_amount as number | null,
        is_active: roomType.is_active as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('room_types.update', roomType.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Room type updated successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error updating room type', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Room Type: ${roomType.type_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Edit Room Type</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Room Type Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type_code">Type Code *</Label>
                                <Input
                                    id="type_code"
                                    type="text"
                                    required
                                    value={data.type_code}
                                    onChange={(e) => setData('type_code', e.target.value)}
                                    disabled={processing}
                                    placeholder="e.g., VIP, STD, DELUXE"
                                />
                                <InputError message={errors.type_code} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="type_name">Type Name *</Label>
                                <Input
                                    id="type_name"
                                    type="text"
                                    required
                                    value={data.type_name}
                                    onChange={(e) => setData('type_name', e.target.value)}
                                    disabled={processing}
                                    placeholder="e.g., VIP Room, Standard Room"
                                />
                                <InputError message={errors.type_name} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    disabled={processing}
                                    placeholder="Enter room type description"
                                    rows={3}
                                />
                                <InputError message={errors.description} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="base_charges_per_day">Base Charges Per Day</Label>
                                <Input
                                    id="base_charges_per_day"
                                    type="number"
                                    step="0.01"
                                    value={data.base_charges_per_day ?? ''}
                                    onChange={(e) => setData('base_charges_per_day', e.target.value === '' ? null : parseFloat(e.target.value))}
                                    disabled={processing}
                                    placeholder="0.00"
                                />
                                <InputError message={errors.base_charges_per_day} className="mt-1" />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-1">
                                    <Label htmlFor="requires_deposit">Requires Deposit</Label>
                                    <p className="text-muted-foreground text-sm">Optional security deposit required</p>
                                </div>
                                <Switch
                                    id="requires_deposit"
                                    checked={data.requires_deposit}
                                    onCheckedChange={(checked) => setData('requires_deposit', !!checked)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="deposit_amount">Deposit Amount</Label>
                                <Input
                                    id="deposit_amount"
                                    type="number"
                                    step="0.01"
                                    value={data.deposit_amount ?? ''}
                                    onChange={(e) => setData('deposit_amount', e.target.value === '' ? null : parseFloat(e.target.value))}
                                    disabled={processing || !data.requires_deposit}
                                    placeholder="0.00"
                                />
                                <InputError message={errors.deposit_amount} className="mt-1" />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-1">
                                    <Label htmlFor="is_active">Active</Label>
                                    <p className="text-muted-foreground text-sm">Room type is available for use</p>
                                </div>
                                <Switch id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', !!checked)} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('room_types.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Room Type
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
