import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Package } from 'lucide-react';

interface Medicine {
    id: number;
    medicine_code: string;
    name: string;
}

interface Supplier {
    id: number;
    supplier_code: string;
    name: string;
    phone: string | null;
    email: string | null;
}

interface User {
    id: number;
    name: string;
}

interface PurchaseOrderItem {
    id: number;
    medicine: Medicine;
    ordered_quantity: number;
    received_quantity: number;
    rejected_quantity: number;
    unit_cost: string;
    line_total: string;
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
    notes: string | null;
    internal_notes: string | null;
    items: PurchaseOrderItem[];
}

interface Props {
    order: PurchaseOrder;
}

export default function PurchaseOrdersShow({ order }: Props) {
    const { hasPermission } = usePermission();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Purchase Orders', href: '/purchase-orders' },
        { title: order.order_number, href: `/purchase-orders/${order.id}` },
    ];

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
            <Head title={`Purchase Order ${order.order_number}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.get(route('purchase-orders.index'))}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Purchase Order {order.order_number}</h1>
                            <p className="text-muted-foreground text-sm">
                                Created on {order.order_date} by {order.user?.name || 'Unknown'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadge(order.status)} className="px-4 py-1 text-base capitalize">
                            {order.status.replace('_', ' ')}
                        </Badge>
                        {(order.status === 'draft' || order.status === 'pending') && hasPermission('update_purchase_orders') && (
                            <Button onClick={() => router.get(route('purchase-orders.edit', order.id))}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Order
                            </Button>
                        )}
                        {order.status === 'ordered' && hasPermission('receive_purchase_orders') && (
                            <Button onClick={() => router.get(route('purchase-orders.receive', order.id))}>
                                <Package className="mr-2 h-4 w-4" /> Receive Stock
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Medicine</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead className="text-right">Ordered</TableHead>
                                        <TableHead className="text-right">Received</TableHead>
                                        <TableHead className="text-right">Unit Cost</TableHead>
                                        <TableHead className="text-right">Line Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.medicine.name}</TableCell>
                                            <TableCell className="font-mono text-sm">{item.medicine.medicine_code}</TableCell>
                                            <TableCell className="text-right">{item.ordered_quantity}</TableCell>
                                            <TableCell className="text-right">
                                                {item.received_quantity} / {item.ordered_quantity}
                                            </TableCell>
                                            <TableCell className="text-right">${parseFloat(item.unit_cost).toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-semibold">${parseFloat(item.line_total).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Supplier Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <div className="font-medium">{order.supplier.name}</div>
                                    <div className="text-muted-foreground text-sm">{order.supplier.supplier_code}</div>
                                </div>
                                {order.supplier.phone && <div className="text-sm">Phone: {order.supplier.phone}</div>}
                                {order.supplier.email && <div className="text-sm">Email: {order.supplier.email}</div>}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                                </div>
                                {parseFloat(order.discount_amount) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Discount</span>
                                        <span className="text-green-600">-${parseFloat(order.discount_amount).toFixed(2)}</span>
                                    </div>
                                )}
                                {parseFloat(order.tax_amount) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax</span>
                                        <span>${parseFloat(order.tax_amount).toFixed(2)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Order Date: </span>
                                    {order.order_date}
                                </div>
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Expected: </span>
                                    {order.expected_delivery_date || 'Not set'}
                                </div>
                                {order.actual_delivery_date && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Delivered: </span>
                                        {order.actual_delivery_date}
                                    </div>
                                )}
                                {order.invoice_number && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Invoice: </span>
                                        {order.invoice_number}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {order.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
