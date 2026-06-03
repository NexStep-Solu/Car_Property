import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowDownLeft, ArrowUpRight, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
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

interface User {
    id: number;
    name: string;
}

interface StockMovement {
    id: number;
    medicine: Medicine;
    supplier: Supplier | null;
    user: User | null;
    reference_number: string;
    movement_type: string;
    quantity: number;
    previous_quantity: number;
    new_quantity: number;
    unit_cost: string;
    total_cost: string;
    batch_number: string | null;
    movement_date: string;
    invoice_number: string | null;
    challan_number: string | null;
    reason: string | null;
    notes: string | null;
}

interface Props {
    movements: {
        data: StockMovement[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    medicines: Medicine[];
    suppliers: Supplier[];
    movementTypes: Record<string, string>;
    filters: {
        search?: string;
        medicine_id?: string;
        supplier_id?: string;
        movement_type?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function StockMovementsIndex({ movements, medicines, suppliers, movementTypes, filters }: Props) {
    const { hasPermission } = usePermission();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Stock Movements', href: '/stock-movements' },
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
        movement_type: '',
        quantity: 0,
        unit_cost: '',
        batch_number: '',
        movement_date: '',
        invoice_number: '',
        challan_number: '',
        reason: '',
        notes: '',
    });

    const handleSearch = () => {
        router.get(route('stock-movements.index'), { search: searchQuery }, { preserveState: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('stock-movements.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
                toast.success('Stock movement recorded successfully', { position: 'top-center', duration: 3000 });
            },
            onError: () => {
                toast.error('Error recording stock movement', { position: 'top-center', duration: 3000 });
            },
        });
    };

    const getMovementIcon = (type: string) => {
        switch (type) {
            case 'purchase':
            case 'initial_stock':
            case 'purchase_return':
                return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
            case 'sale':
            case 'sale_return':
                return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
            case 'expired':
            case 'damaged':
            case 'damage_write_off':
            case 'theft':
                return <Trash2 className="h-4 w-4 text-red-500" />;
            case 'adjustment':
                return <RefreshCw className="h-4 w-4 text-yellow-500" />;
            default:
                return null;
        }
    };

    const getMovementTypeBadge = (type: string) => {
        switch (type) {
            case 'purchase':
            case 'initial_stock':
            case 'purchase_return':
                return 'default';
            case 'sale':
            case 'sale_return':
                return 'secondary';
            case 'expired':
            case 'damaged':
            case 'damage_write_off':
            case 'theft':
                return 'destructive';
            case 'adjustment':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Movements" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Stock Movements</h1>
                    {hasPermission('create_stock_movements') && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Record Movement
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Record Stock Movement</DialogTitle>
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
                                            <Label>Movement Type *</Label>
                                            <Select value={createData.movement_type} onValueChange={(v) => setCreateData('movement_type', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(movementTypes).map(([key, value]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {value}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Supplier</Label>
                                            <Select
                                                value={createData.supplier_id || 'none'}
                                                onValueChange={(v) => setCreateData('supplier_id', v === 'none' ? '' : v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select supplier" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {suppliers.map((sup) => (
                                                        <SelectItem key={sup.id} value={sup.id.toString()}>
                                                            {sup.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Quantity *</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={createData.quantity}
                                                onChange={(e) => setCreateData('quantity', parseInt(e.target.value))}
                                                required
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
                                            <Label>Movement Date *</Label>
                                            <Input
                                                type="date"
                                                value={createData.movement_date}
                                                onChange={(e) => setCreateData('movement_date', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Batch Number</Label>
                                            <Input value={createData.batch_number} onChange={(e) => setCreateData('batch_number', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Invoice Number</Label>
                                            <Input
                                                value={createData.invoice_number}
                                                onChange={(e) => setCreateData('invoice_number', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Reason</Label>
                                        <Input
                                            value={createData.reason}
                                            onChange={(e) => setCreateData('reason', e.target.value)}
                                            placeholder="Brief reason for this movement"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Notes</Label>
                                        <Input
                                            value={createData.notes}
                                            onChange={(e) => setCreateData('notes', e.target.value)}
                                            placeholder="Additional notes"
                                        />
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
                                            {creating ? 'Recording...' : 'Record Movement'}
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
                            <CardTitle>Stock Movements</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                        placeholder="Search by reference..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-64 pl-8"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ref Number</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Medicine</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Prev → New</TableHead>
                                    <TableHead>Total Cost</TableHead>
                                    <TableHead>User</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {movements.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-muted-foreground text-center">
                                            No movements found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    movements.data.map((movement) => (
                                        <TableRow key={movement.id}>
                                            <TableCell className="font-mono text-sm">{movement.reference_number}</TableCell>
                                            <TableCell className="text-sm">{movement.movement_date}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{movement.medicine.name}</div>
                                                    <div className="text-muted-foreground text-xs">{movement.medicine.medicine_code}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getMovementIcon(movement.movement_type)}
                                                    <Badge variant={getMovementTypeBadge(movement.movement_type)}>
                                                        {movementTypes[movement.movement_type] || movement.movement_type}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                                                {movement.quantity > 0 ? '+' : ''}
                                                {movement.quantity}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {movement.previous_quantity} → {movement.new_quantity}
                                            </TableCell>
                                            <TableCell>${parseFloat(movement.total_cost).toFixed(2)}</TableCell>
                                            <TableCell className="text-sm">{movement.user?.name || '-'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {movements.links && movements.links.length > 1 && <Pagination links={movements.links} />}
            </div>
        </AppLayout>
    );
}
