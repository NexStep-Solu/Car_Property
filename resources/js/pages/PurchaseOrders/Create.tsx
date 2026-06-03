import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Medicine {
    id: number;
    medicine_code: string;
    name: string;
    cost_price: string;
}

interface Supplier {
    id: number;
    supplier_code: string;
    name: string;
}

interface OrderItem {
    medicine_id: number;
    ordered_quantity: number;
    unit_cost: number;
    tax_rate: number;
    discount_rate: number;
    batch_number: string;
    expiry_date: string;
}

interface Props {
    medicines: Medicine[];
    suppliers: Supplier[];
}

export default function PurchaseOrdersCreate({ medicines, suppliers }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Purchase Orders', href: '/purchase-orders' },
        { title: 'Create', href: '/purchase-orders/create' },
    ];

    const [items, setItems] = useState<OrderItem[]>([
        { medicine_id: 0, ordered_quantity: 1, unit_cost: 0, tax_rate: 0, discount_rate: 0, batch_number: '', expiry_date: '' },
    ]);

    const { data, setData, post, processing } = useForm({
        supplier_id: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        notes: '',
        internal_notes: '',
        items: items as unknown as Record<string, unknown>[],
    });

    const addItem = () => {
        setItems([...items, { medicine_id: 0, ordered_quantity: 1, unit_cost: 0, tax_rate: 0, discount_rate: 0, batch_number: '', expiry_date: '' }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'medicine_id') {
            const medicine = medicines.find((m) => m.id === value);
            if (medicine) {
                newItems[index].unit_cost = parseFloat(medicine.cost_price) || 0;
            }
        }

        setItems(newItems);
    };

    const calculateLineTotal = (item: OrderItem) => {
        const subtotal = item.ordered_quantity * item.unit_cost;
        const discount = subtotal * (item.discount_rate / 100);
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * (item.tax_rate / 100);
        return afterDiscount + tax;
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validItems = items.filter((item) => item.medicine_id > 0 && item.ordered_quantity > 0);

        if (validItems.length === 0) {
            toast.error('Please add at least one valid item', { position: 'top-center', duration: 3000 });
            return;
        }

        setData('items', validItems as unknown as Record<string, unknown>[]);

        post(route('purchase-orders.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Purchase order created successfully', { position: 'top-center', duration: 3000 });
            },
            onError: () => {
                toast.error('Error creating purchase order', { position: 'top-center', duration: 3000 });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Purchase Order" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.get(route('purchase-orders.index'))}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">Create Purchase Order</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label>Supplier *</Label>
                                    <Select value={data.supplier_id} onValueChange={(v) => setData('supplier_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select supplier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map((sup) => (
                                                <SelectItem key={sup.id} value={sup.id.toString()}>
                                                    {sup.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Order Date *</Label>
                                    <Input type="date" value={data.order_date} onChange={(e) => setData('order_date', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Expected Delivery</Label>
                                    <Input
                                        type="date"
                                        value={data.expected_delivery_date}
                                        onChange={(e) => setData('expected_delivery_date', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Input value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="Order notes" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Order Items</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    <Plus className="mr-1 h-4 w-4" /> Add Item
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Medicine</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Unit Cost</TableHead>
                                        <TableHead>Disc %</TableHead>
                                        <TableHead>Tax %</TableHead>
                                        <TableHead>Line Total</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="w-64">
                                                <Select
                                                    value={item.medicine_id.toString()}
                                                    onValueChange={(v) => updateItem(index, 'medicine_id', parseInt(v))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select medicine" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {medicines.map((med) => (
                                                            <SelectItem key={med.id} value={med.id.toString()}>
                                                                {med.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="w-24">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.ordered_quantity}
                                                    onChange={(e) => updateItem(index, 'ordered_quantity', parseInt(e.target.value))}
                                                />
                                            </TableCell>
                                            <TableCell className="w-32">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={item.unit_cost}
                                                    onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value))}
                                                />
                                            </TableCell>
                                            <TableCell className="w-24">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    value={item.discount_rate}
                                                    onChange={(e) => updateItem(index, 'discount_rate', parseFloat(e.target.value))}
                                                />
                                            </TableCell>
                                            <TableCell className="w-24">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    value={item.tax_rate}
                                                    onChange={(e) => updateItem(index, 'tax_rate', parseFloat(e.target.value))}
                                                />
                                            </TableCell>
                                            <TableCell className="w-32 font-semibold">${calculateLineTotal(item).toFixed(2)}</TableCell>
                                            <TableCell className="w-12">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeItem(index)}
                                                    disabled={items.length === 1}
                                                >
                                                    <Trash2 className="text-destructive h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="mt-4 flex justify-end">
                                <div className="text-right">
                                    <div className="text-muted-foreground text-sm">Subtotal</div>
                                    <div className="text-2xl font-bold">${calculateSubtotal().toFixed(2)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.get(route('purchase-orders.index'))}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Order'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
