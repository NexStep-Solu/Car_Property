import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface Medicine {
    id: number;
    medicine_code: string;
    name: string;
}

interface Supplier {
    id: number;
    supplier_code: string;
    name: string;
}

interface Props {
    medicines: Medicine[];
    suppliers: Supplier[];
    movementTypes: Record<string, string>;
}

export default function StockMovementsCreate({ medicines, suppliers, movementTypes }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Stock Movements', href: '/stock-movements' },
        { title: 'Create', href: '/stock-movements/create' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        medicine_id: '',
        supplier_id: '',
        movement_type: '',
        quantity: 0,
        unit_cost: '',
        batch_number: '',
        movement_date: new Date().toISOString().slice(0, 10),
        invoice_number: '',
        challan_number: '',
        reason: '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('stock-movements.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Stock movement recorded successfully', { position: 'top-center', duration: 3000 });
                reset();
            },
            onError: () => {
                toast.error('Error recording stock movement', { position: 'top-center', duration: 3000 });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Record Stock Movement" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="mb-4 text-2xl font-bold">Record Stock Movement</h1>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Movement Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="medicine_id">Medicine *</Label>
                                    <Select value={data.medicine_id} onValueChange={(value) => setData('medicine_id', value)} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select medicine" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {medicines.map((medicine) => (
                                                <SelectItem key={medicine.id} value={medicine.id.toString()}>
                                                    {medicine.name} ({medicine.medicine_code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.medicine_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="movement_type">Movement Type *</Label>
                                    <Select value={data.movement_type} onValueChange={(value) => setData('movement_type', value)} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select movement type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(movementTypes).map(([key, value]) => (
                                                <SelectItem key={key} value={key}>
                                                    {value}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.movement_type} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="movement_date">Movement Date *</Label>
                                    <Input
                                        id="movement_date"
                                        type="date"
                                        value={data.movement_date}
                                        onChange={(e) => setData('movement_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.movement_date} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="quantity">Quantity *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', parseInt(e.target.value))}
                                        required
                                    />
                                    <InputError message={errors.quantity} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="unit_cost">Unit Cost</Label>
                                    <Input
                                        id="unit_cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.unit_cost}
                                        onChange={(e) => setData('unit_cost', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.unit_cost} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="supplier_id">Supplier</Label>
                                    <Select
                                        value={data.supplier_id || 'none'}
                                        onValueChange={(value) => setData('supplier_id', value === 'none' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select supplier (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {suppliers.map((supplier) => (
                                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                    {supplier.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.supplier_id} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Reference Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="batch_number">Batch Number</Label>
                                    <Input
                                        id="batch_number"
                                        type="text"
                                        value={data.batch_number}
                                        onChange={(e) => setData('batch_number', e.target.value)}
                                        placeholder="Enter batch number"
                                    />
                                    <InputError message={errors.batch_number} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="invoice_number">Invoice Number</Label>
                                    <Input
                                        id="invoice_number"
                                        type="text"
                                        value={data.invoice_number}
                                        onChange={(e) => setData('invoice_number', e.target.value)}
                                        placeholder="Enter invoice number"
                                    />
                                    <InputError message={errors.invoice_number} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="challan_number">Challan Number</Label>
                                    <Input
                                        id="challan_number"
                                        type="text"
                                        value={data.challan_number}
                                        onChange={(e) => setData('challan_number', e.target.value)}
                                        placeholder="Enter challan number"
                                    />
                                    <InputError message={errors.challan_number} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="reason">Reason</Label>
                                    <Input
                                        id="reason"
                                        type="text"
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        placeholder="Brief reason for movement"
                                    />
                                    <InputError message={errors.reason} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    type="text"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes or comments"
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('stock-movements.index'))}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Recording...' : 'Record Movement'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
