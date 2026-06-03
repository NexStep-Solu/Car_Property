import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
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
    medicine: Medicine;
    supplier: Supplier | null;
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
    is_expired: boolean;
    days_to_expiry: number | null;
    available_quantity: number;
}

interface Props {
    stocks: {
        data: InventoryStock[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    medicines: Medicine[];
    suppliers: Supplier[];
    warehouses: string[];
    filters: {
        search?: string;
        medicine_id?: string;
        supplier_id?: string;
        warehouse?: string;
        status?: string;
        expiring_soon?: string;
        low_stock?: string;
    };
}

export default function InventoryIndex({ stocks, medicines, suppliers, warehouses, filters }: Props) {
    const { hasPermission } = usePermission();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingStock, setEditingStock] = useState<InventoryStock | null>(null);
    const [adjustingStock, setAdjustingStock] = useState<InventoryStock | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Inventory', href: '/inventory' },
    ];

    const {
        data: createData,
        setData: setCreateData,
        post,
        processing: creating,
        reset: resetCreate,
    } = useForm({
        medicine_id: '',
        supplier_id: '',
        batch_number: '',
        expiry_date: '',
        manufacture_date: '',
        quantity: 0,
        unit_cost: '',
        unit_price: '',
        pack_size: '',
        warehouse: '',
        shelf_location: '',
        received_date: '',
        notes: '',
    });

    const {
        data: adjustData,
        setData: setAdjustData,
        post: postAdjust,
        processing: adjusting,
        reset: resetAdjust,
    } = useForm({
        adjustment_quantity: 0,
        reason: '',
        notes: '',
    });

    const handleSearch = () => {
        router.get(route('inventory.index'), { search: searchQuery }, { preserveState: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('inventory.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
                toast.success('Stock created successfully', { position: 'top-center', duration: 3000 });
            },
            onError: () => {
                toast.error('Error creating stock', { position: 'top-center', duration: 3000 });
            },
        });
    };

    const handleAdjust = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adjustingStock) return;

        postAdjust(route('inventory.adjust', adjustingStock.id), {
            preserveScroll: true,
            onSuccess: () => {
                setAdjustingStock(null);
                resetAdjust();
                toast.success('Stock adjusted successfully', { position: 'top-center', duration: 3000 });
            },
            onError: () => {
                toast.error('Error adjusting stock', { position: 'top-center', duration: 3000 });
            },
        });
    };

    const openAdjustDialog = (stock: InventoryStock) => {
        setAdjustingStock(stock);
        setAdjustData({
            adjustment_quantity: 0,
            reason: '',
            notes: '',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available':
                return 'default';
            case 'reserved':
                return 'secondary';
            case 'damaged':
                return 'destructive';
            case 'expired':
                return 'destructive';
            case 'recalled':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Inventory Management</h1>
                    {hasPermission('create_inventory') && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add Stock
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Add New Stock</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Medicine *</Label>
                                            <Select value={createData.medicine_id} onValueChange={(v) => setCreateData('medicine_id', v)}>
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
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Supplier</Label>
                                            <Select value={createData.supplier_id} onValueChange={(v) => setCreateData('supplier_id', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select supplier" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value=" ">None</SelectItem>
                                                    {suppliers.map((sup) => (
                                                        <SelectItem key={sup.id} value={sup.id.toString()}>
                                                            {sup.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Batch Number</Label>
                                            <Input value={createData.batch_number} onChange={(e) => setCreateData('batch_number', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Quantity *</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={createData.quantity}
                                                onChange={(e) => setCreateData('quantity', parseInt(e.target.value))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Expiry Date</Label>
                                            <Input
                                                type="date"
                                                value={createData.expiry_date}
                                                onChange={(e) => setCreateData('expiry_date', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Unit Cost</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={createData.unit_cost}
                                                onChange={(e) => setCreateData('unit_cost', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Unit Price</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={createData.unit_price}
                                                onChange={(e) => setCreateData('unit_price', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Warehouse</Label>
                                            <Input value={createData.warehouse} onChange={(e) => setCreateData('warehouse', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Shelf Location</Label>
                                            <Input
                                                value={createData.shelf_location}
                                                onChange={(e) => setCreateData('shelf_location', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Received Date</Label>
                                            <Input
                                                type="date"
                                                value={createData.received_date}
                                                onChange={(e) => setCreateData('received_date', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Notes</Label>
                                        <Textarea value={createData.notes} onChange={(e) => setCreateData('notes', e.target.value)} rows={2} />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsCreateOpen(false);
                                                resetCreate();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={creating}>
                                            {creating ? 'Adding...' : 'Add Stock'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Inventory Stocks</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                        placeholder="Search by medicine or batch..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-72 pl-8"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Medicine</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead>Expiry</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Available</TableHead>
                                    <TableHead>Damaged</TableHead>
                                    <TableHead>Unit Cost</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stocks.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-muted-foreground text-center">
                                            No inventory records found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stocks.data.map((stock) => (
                                        <TableRow key={stock.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{stock.medicine.name}</div>
                                                    <div className="text-muted-foreground text-xs">{stock.medicine.medicine_code}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{stock.batch_number || '-'}</TableCell>
                                            <TableCell>
                                                {stock.expiry_date ? (
                                                    <div
                                                        className={`text-sm ${stock.days_to_expiry !== null && stock.days_to_expiry <= 30 ? 'text-red-500' : ''}`}
                                                    >
                                                        {stock.expiry_date}
                                                        {stock.days_to_expiry !== null && stock.days_to_expiry <= 90 && (
                                                            <Badge variant="destructive" className="ml-1 text-xs">
                                                                {stock.days_to_expiry}d
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell>{stock.quantity}</TableCell>
                                            <TableCell>
                                                <Badge variant={stock.available_quantity <= 10 ? 'destructive' : 'secondary'}>
                                                    {stock.available_quantity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {stock.damaged_quantity > 0 && <Badge variant="destructive">{stock.damaged_quantity}</Badge>}
                                            </TableCell>
                                            <TableCell>${parseFloat(stock.unit_cost).toFixed(2)}</TableCell>
                                            <TableCell className="text-sm">
                                                {stock.warehouse && <div>{stock.warehouse}</div>}
                                                {stock.shelf_location && <div className="text-muted-foreground">{stock.shelf_location}</div>}
                                                {!stock.warehouse && !stock.shelf_location && '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadge(stock.status)} className="capitalize">
                                                    {stock.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {hasPermission('adjust_inventory') && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => openAdjustDialog(stock)}
                                                            title="Adjust Stock"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {stocks.links && stocks.links.length > 1 && <Pagination links={stocks.links} />}

                {adjustingStock && (
                    <Dialog open={!!adjustingStock} onOpenChange={(open) => !open && setAdjustingStock(null)}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Adjust Stock - {adjustingStock.medicine.name}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAdjust} className="space-y-4">
                                <div className="bg-muted rounded-lg p-4">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>Current Quantity:</div>
                                        <div className="font-semibold">{adjustingStock.quantity}</div>
                                        <div>Batch:</div>
                                        <div className="font-mono">{adjustingStock.batch_number || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Adjustment Quantity (use negative to reduce)</Label>
                                    <Input
                                        type="number"
                                        value={adjustData.adjustment_quantity}
                                        onChange={(e) => setAdjustData('adjustment_quantity', parseInt(e.target.value))}
                                        placeholder="e.g., -5 or 10"
                                    />
                                    <p className="text-muted-foreground text-sm">
                                        New quantity will be: {adjustingStock.quantity + adjustData.adjustment_quantity}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Reason *</Label>
                                    <Input
                                        value={adjustData.reason}
                                        onChange={(e) => setAdjustData('reason', e.target.value)}
                                        placeholder="e.g., Physical count, Breakage, Found extra"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea value={adjustData.notes} onChange={(e) => setAdjustData('notes', e.target.value)} rows={2} />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setAdjustingStock(null);
                                            resetAdjust();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={adjusting}>
                                        {adjusting ? 'Adjusting...' : 'Adjust Stock'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}
