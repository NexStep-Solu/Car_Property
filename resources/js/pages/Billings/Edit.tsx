import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

interface Patient {
    patient_id: number;
    name: string;
}

interface Service {
    id: number;
    name: string;
    price: number;
}

interface Medicine {
    id: number;
    name: string;
    selling_price: number;
}

interface BillingItem {
    id?: number;
    type: string;
    item_id: string;
    quantity: string;
    service_id?: number;
    medicine_id?: number;
}

interface Billing {
    id: number;
    invoice_number: string;
    patient_id: number;
    billing_date: string;
    total: number;
    amount_paid: number;
    status: string;
    payment_method: string | null;
    notes: string | null;
    items: BillingItem[];
}

interface Props {
    billing: Billing;
    patients: Patient[];
    services: Service[];
    medicines: Medicine[];
}

export default function BillingsEdit({ billing, patients, services, medicines }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Billings', href: '/billings' },
        { title: 'Edit', href: `/billings/${billing.id}/edit` },
    ];

    const [items, setItems] = useState<BillingItem[]>(
        billing.items.length > 0
            ? billing.items.map((item) => ({
                  id: item.id,
                  type: item.service_id ? 'service' : 'medicine',
                  item_id: String(item.service_id || item.medicine_id || ''),
                  quantity: String(item.quantity),
              }))
            : [{ type: 'service', item_id: '', quantity: '1' }],
    );

    const { data, setData, put, processing, errors, transform } = useForm({
        patient_id: String(billing.patient_id),
        billing_date: billing.billing_date,
        status: billing.status,
        payment_method: billing.payment_method || '',
        notes: billing.notes || '',
        items: [] as { type: string; id: number; quantity: number }[],
    });

    transform((values) => ({
        ...values,
        items: items.map((item) => ({
            type: item.type,
            id: Number(item.item_id),
            quantity: Number(item.quantity),
        })),
    }));

    const addItem = () => {
        setItems([...items, { type: 'service', item_id: '', quantity: '1' }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, idx: number) => idx !== index));
    };

    const updateItem = (index: number, field: keyof BillingItem, value: string) => {
        const newItems = [...items];
        (newItems[index] as unknown as Record<string, string>)[field] = value;
        if (field === 'type') {
            newItems[index].item_id = '';
        }
        setItems(newItems);
    };

    const calculateTotal = () => {
        let subtotal = 0;
        items.forEach((item: BillingItem) => {
            if (item.type === 'service') {
                const service = services.find((s) => s.id === Number(item.item_id));
                if (service) subtotal += service.price * Number(item.quantity);
            } else {
                const medicine = medicines.find((m) => m.id === Number(item.item_id));
                if (medicine) subtotal += medicine.selling_price * Number(item.quantity);
            }
        });
        return subtotal.toFixed(2);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('billings.update', billing.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Billing updated successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error updating billing', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Billing" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Edit Billing</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="patient_id">Patient *</Label>
                                <Select value={data.patient_id} onValueChange={(value) => setData('patient_id', value)} disabled={processing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map((patient) => (
                                            <SelectItem key={patient.patient_id} value={String(patient.patient_id)}>
                                                {patient.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.patient_id} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="billing_date">Billing Date *</Label>
                                    <Input
                                        id="billing_date"
                                        type="date"
                                        required
                                        value={data.billing_date}
                                        onChange={(e) => setData('billing_date', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.billing_date} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)} disabled={processing}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="partial">Partial</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="payment_method">Payment Method</Label>
                                <Select value={data.payment_method} onValueChange={(value) => setData('payment_method', value)} disabled={processing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="insurance">Insurance</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.payment_method} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    disabled={processing}
                                    placeholder="Additional notes..."
                                    rows={3}
                                />
                                <InputError message={errors.notes} className="mt-1" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Bill Items</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={processing}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InputError message={errors.items} className="mt-1" />
                            {items.map((item, index) => (
                                <div key={index} className="grid gap-4 rounded-lg border p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Item {index + 1}</span>
                                        {items.length > 1 && (
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} disabled={processing}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label>Type *</Label>
                                            <Select
                                                value={item.type}
                                                onValueChange={(value) => updateItem(index, 'type', value)}
                                                disabled={processing}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="service">Service</SelectItem>
                                                    <SelectItem value="medicine">Medicine</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>{item.type === 'service' ? 'Service' : 'Medicine'} *</Label>
                                            <Select
                                                value={item.item_id}
                                                onValueChange={(value) => updateItem(index, 'item_id', value)}
                                                disabled={processing}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={`Select ${item.type}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {item.type === 'service'
                                                        ? services.map((service) => (
                                                              <SelectItem key={service.id} value={String(service.id)}>
                                                                  {service.name} (${Number(service.price).toFixed(2)})
                                                              </SelectItem>
                                                          ))
                                                        : medicines.map((medicine) => (
                                                              <SelectItem key={medicine.id} value={String(medicine.id)}>
                                                                  {medicine.name} (${Number(medicine.selling_price).toFixed(2)})
                                                              </SelectItem>
                                                          ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Quantity *</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                disabled={processing}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-end text-lg font-bold">Total: ${calculateTotal()}</div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('billings.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Billing
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
