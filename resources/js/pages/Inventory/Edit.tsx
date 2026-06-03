import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Medicine {
    id: number;
    medicine_code: string;
    name: string;
    category: { id: number; name: string } | null;
}

interface Supplier {
    id: number;
    supplier_code: string;
    name: string;
}

interface InventoryStock {
    id: number;
    medicine_id: number;
    supplier_id: number | null;
    batch_number: string | null;
    expiry_date: string | null;
    manufacture_date: string | null;
    quantity: number;
    reserved_quantity: number;
    damaged_quantity: number;
    unit_cost: string;
    unit_price: string;
    pack_size: string | null;
    warehouse: string | null;
    shelf_location: string | null;
    received_date: string | null;
    status: string;
    notes: string | null;
}

interface Props {
    stock: InventoryStock;
    medicines: Medicine[];
    suppliers: Supplier[];
    warehouses: string[];
}

export default function InventoryEdit({ stock, medicines, suppliers, warehouses }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        medicine_id: stock.medicine_id?.toString() || '',
        supplier_id: stock.supplier_id?.toString() || '',
        batch_number: stock.batch_number || '',
        expiry_date: stock.expiry_date || '',
        manufacture_date: stock.manufacture_date || '',
        quantity: stock.quantity?.toString() || '',
        reserved_quantity: stock.reserved_quantity || 0,
        damaged_quantity: stock.damaged_quantity || 0,
        unit_cost: stock.unit_cost || '',
        unit_price: stock.unit_price || '',
        pack_size: stock.pack_size || '',
        warehouse: stock.warehouse || '',
        shelf_location: stock.shelf_location || '',
        received_date: stock.received_date || '',
        status: stock.status || 'available',
        notes: stock.notes || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Inventory', href: '/inventory' },
        { title: `Edit Stock #${stock.id}`, href: `/inventory/${stock.id}/edit` },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('inventory.update', stock.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Stock updated successfully', { position: 'top-center', duration: 3000 });
            },
            onError: () => {
                toast.error('Error updating stock', { position: 'top-center', duration: 3000 });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Inventory Stock #${stock.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Inventory Stock</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Medicine & Supplier</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="medicine_id">
                                            Medicine <span className="text-destructive">*</span>
                                        </Label>
                                        <Select value={data.medicine_id} onValueChange={(v) => setData('medicine_id', v)}>
                                            <SelectTrigger id="medicine_id" className={errors.medicine_id ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Select medicine" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {medicines.map((med) => (
                                                    <SelectItem key={med.id} value={med.id.toString()}>
                                                        {med.name} ({med.medicine_code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.medicine_id && <p className="text-destructive text-sm">{errors.medicine_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="supplier_id">Supplier</Label>
                                        <Select
                                            value={data.supplier_id || 'none'}
                                            onValueChange={(v) => setData('supplier_id', v === 'none' ? '' : v)}
                                        >
                                            <SelectTrigger id="supplier_id">
                                                <SelectValue placeholder="Select supplier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {suppliers.map((sup) => (
                                                    <SelectItem key={sup.id} value={sup.id.toString()}>
                                                        {sup.name} ({sup.supplier_code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.supplier_id && <p className="text-destructive text-sm">{errors.supplier_id}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Stock Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="reserved">Reserved</SelectItem>
                                            <SelectItem value="damaged">Damaged</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
                                            <SelectItem value="recalled">Recalled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-destructive text-sm">{errors.status}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="received_date">Received Date</Label>
                                    <Input
                                        id="received_date"
                                        type="date"
                                        value={data.received_date}
                                        onChange={(e) => setData('received_date', e.target.value)}
                                    />
                                    {errors.received_date && <p className="text-destructive text-sm">{errors.received_date}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Batch Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="batch_number">Batch Number</Label>
                                        <Input
                                            id="batch_number"
                                            value={data.batch_number}
                                            onChange={(e) => setData('batch_number', e.target.value)}
                                            placeholder="e.g., BTH-2024-001"
                                        />
                                        {errors.batch_number && <p className="text-destructive text-sm">{errors.batch_number}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry_date">Expiry Date</Label>
                                        <Input
                                            id="expiry_date"
                                            type="date"
                                            value={data.expiry_date}
                                            onChange={(e) => setData('expiry_date', e.target.value)}
                                        />
                                        {errors.expiry_date && <p className="text-destructive text-sm">{errors.expiry_date}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="manufacture_date">Manufacture Date</Label>
                                        <Input
                                            id="manufacture_date"
                                            type="date"
                                            value={data.manufacture_date}
                                            onChange={(e) => setData('manufacture_date', e.target.value)}
                                        />
                                        {errors.manufacture_date && <p className="text-destructive text-sm">{errors.manufacture_date}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pack_size">Pack Size</Label>
                                        <Input
                                            id="pack_size"
                                            value={data.pack_size}
                                            onChange={(e) => setData('pack_size', e.target.value)}
                                            placeholder="e.g., 10x10"
                                        />
                                        {errors.pack_size && <p className="text-destructive text-sm">{errors.pack_size}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Quantities</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">
                                            Quantity <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            min="0"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', e.target.value)}
                                            placeholder="0"
                                        />
                                        {errors.quantity && <p className="text-destructive text-sm">{errors.quantity}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reserved_quantity">Reserved Quantity</Label>
                                        <Input
                                            id="reserved_quantity"
                                            type="number"
                                            min="0"
                                            value={data.reserved_quantity}
                                            onChange={(e) => setData('reserved_quantity', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                        {errors.reserved_quantity && <p className="text-destructive text-sm">{errors.reserved_quantity}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="damaged_quantity">Damaged Quantity</Label>
                                        <Input
                                            id="damaged_quantity"
                                            type="number"
                                            min="0"
                                            value={data.damaged_quantity}
                                            onChange={(e) => setData('damaged_quantity', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                        {errors.damaged_quantity && <p className="text-destructive text-sm">{errors.damaged_quantity}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
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
                                    {errors.unit_cost && <p className="text-destructive text-sm">{errors.unit_cost}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="unit_price">Unit Price</Label>
                                    <Input
                                        id="unit_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.unit_price}
                                        onChange={(e) => setData('unit_price', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.unit_price && <p className="text-destructive text-sm">{errors.unit_price}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Warehouse Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="warehouse">Warehouse</Label>
                                        <Select value={data.warehouse || 'none'} onValueChange={(v) => setData('warehouse', v === 'none' ? '' : v)}>
                                            <SelectTrigger id="warehouse">
                                                <SelectValue placeholder="Select warehouse" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {warehouses.map((wh) => (
                                                    <SelectItem key={wh} value={wh}>
                                                        {wh}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.warehouse && <p className="text-destructive text-sm">{errors.warehouse}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="shelf_location">Shelf Location</Label>
                                        <Input
                                            id="shelf_location"
                                            value={data.shelf_location}
                                            onChange={(e) => setData('shelf_location', e.target.value)}
                                            placeholder="e.g., A-12-3"
                                        />
                                        {errors.shelf_location && <p className="text-destructive text-sm">{errors.shelf_location}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                        placeholder="Any additional information about this stock..."
                                    />
                                    {errors.notes && <p className="text-destructive text-sm">{errors.notes}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Stock'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
