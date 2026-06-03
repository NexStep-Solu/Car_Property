import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search } from 'lucide-react';
import { useState } from 'react';

interface Supplier {
    id: number;
    supplier_code: string;
    name: string;
}

interface User {
    id: number;
    name: string;
}

interface PurchaseOrder {
    id: number;
    order_number: string;
    supplier: Supplier;
    user: User | null;
    order_date: string;
    expected_delivery_date: string | null;
    actual_delivery_date: string | null;
    status: string;
    subtotal: string;
    tax_amount: string;
    discount_amount: string;
    total_amount: string;
    invoice_number: string | null;
    items_count: number;
}

interface Props {
    orders: {
        data: PurchaseOrder[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    suppliers: Supplier[];
    statuses: Record<string, string>;
    filters: {
        search?: string;
        supplier_id?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function PurchaseOrdersIndex({ orders, suppliers, statuses, filters }: Props) {
    const { hasPermission } = usePermission();
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Purchase Orders', href: '/purchase-orders' },
    ];

    const handleSearch = () => {
        router.get(route('purchase-orders.index'), { search: searchQuery }, { preserveState: true });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return 'secondary';
            case 'pending':
                return 'outline';
            case 'approved':
                return 'default';
            case 'ordered':
                return 'default';
            case 'partial_received':
                return 'secondary';
            case 'received':
                return 'default';
            case 'cancelled':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchase Orders" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Purchase Orders</h1>
                    {hasPermission('create_purchase_orders') && (
                        <Button onClick={() => router.get(route('purchase-orders.create'))} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Create Order
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Orders</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                        placeholder="Search by order number or supplier..."
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
                                    <TableHead>Order #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Expected Delivery</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-muted-foreground text-center">
                                            No purchase orders found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders.data.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-mono">{order.order_number}</TableCell>
                                            <TableCell className="text-sm">{order.order_date}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{order.supplier.name}</div>
                                                    <div className="text-muted-foreground text-xs">{order.supplier.supplier_code}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{order.expected_delivery_date || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{order.items_count}</Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold">${parseFloat(order.total_amount).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadge(order.status)} className="capitalize">
                                                    {statuses[order.status] || order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => router.get(route('purchase-orders.show', order.id))}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {(order.status === 'draft' || order.status === 'pending') &&
                                                        hasPermission('update_purchase_orders') && (
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => router.get(route('purchase-orders.edit', order.id))}
                                                            >
                                                                <Pencil className="h-4 w-4" />
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

                {orders.links && orders.links.length > 1 && <Pagination links={orders.links} />}
            </div>
        </AppLayout>
    );
}
