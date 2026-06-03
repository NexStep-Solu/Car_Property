import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Package } from 'lucide-react';

interface PurchaseOrder {
    id: number;
    order_number: string;
    order_date: string;
    expected_delivery_date: string | null;
    status: string;
    total_amount: string;
}

interface Supplier {
    id: number;
    supplier_code: string;
    name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postal_code: string | null;
    tax_id: string | null;
    license_number: string | null;
    credit_limit: string | null;
    payment_terms_days: number;
    rating: string;
    is_active: boolean;
    notes: string | null;
    created_at: string;
    purchaseOrders: PurchaseOrder[];
}

interface Props {
    supplier: Supplier;
}

function Info({ label, value }: { label: string; value?: string | number | boolean | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">
                {value === null || value === undefined || value === '' ? '-' : typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}
            </p>
        </div>
    );
}

export default function SuppliersShow({ supplier }: Props) {
    const { hasPermission } = usePermission();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Suppliers', href: '/suppliers' },
        { title: supplier.name, href: `/suppliers/${supplier.id}` },
    ];

    const getRatingBadgeVariant = (rating: string) => {
        switch (rating) {
            case 'A':
                return 'default';
            case 'B':
                return 'secondary';
            case 'C':
                return 'outline';
            case 'D':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getOrderStatusBadge = (status: string) => {
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
            <Head title={`Supplier: ${supplier.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" onClick={() => router.visit(route('suppliers.index'))}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{supplier.name}</h1>
                            <p className="text-muted-foreground text-sm">Code: {supplier.supplier_code}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={supplier.is_active ? 'default' : 'secondary'} className="px-3 py-1 text-sm">
                            {supplier.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={getRatingBadgeVariant(supplier.rating)} className="px-3 py-1 text-sm">
                            Rating: {supplier.rating}
                        </Badge>
                        {hasPermission('update_suppliers') && (
                            <Link href={route('suppliers.edit', supplier.id)}>
                                <Button variant="outline" className="gap-2">
                                    <Edit className="h-4 w-4" /> Edit
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                <Info label="Supplier Name" value={supplier.name} />
                                <Info label="Contact Person" value={supplier.contact_person} />
                                <Info label="Email" value={supplier.email} />
                                <Info label="Phone" value={supplier.phone} />
                                <Info label="Mobile" value={supplier.mobile} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Address Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-muted-foreground text-sm">Address</p>
                                    <p className="font-medium whitespace-pre-wrap">{supplier.address || '-'}</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
                                    <Info label="City" value={supplier.city} />
                                    <Info label="State" value={supplier.state} />
                                    <Info label="Country" value={supplier.country} />
                                    <Info label="Postal Code" value={supplier.postal_code} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tax & License Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                <Info label="Tax ID" value={supplier.tax_id} />
                                <Info label="License Number" value={supplier.license_number} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Terms</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                    <div className="rounded-lg border p-4">
                                        <p className="text-muted-foreground text-sm">Credit Limit</p>
                                        <p className="text-2xl font-bold">
                                            ${supplier.credit_limit ? parseFloat(supplier.credit_limit).toFixed(2) : '0.00'}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-muted-foreground text-sm">Payment Terms</p>
                                        <p className="text-2xl font-bold">{supplier.payment_terms_days} days</p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-muted-foreground text-sm">Rating</p>
                                        <p className="text-2xl font-bold">{supplier.rating}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {(supplier.notes || (supplier.purchaseOrders && supplier.purchaseOrders.length > 0)) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium whitespace-pre-wrap">{supplier.notes || '-'}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge variant={supplier.is_active ? 'default' : 'secondary'}>{supplier.is_active ? 'Active' : 'Inactive'}</Badge>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Credit Limit</span>
                                    <span className="font-semibold">
                                        ${supplier.credit_limit ? parseFloat(supplier.credit_limit).toFixed(2) : '0.00'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment Terms</span>
                                    <span className="font-semibold">{supplier.payment_terms_days} days</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Orders</span>
                                    <span className="font-semibold">{supplier.purchaseOrders?.length || 0}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Supplier Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Supplier ID</span>
                                    <span className="font-mono text-sm">{supplier.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Supplier Code</span>
                                    <span className="font-mono text-sm">{supplier.supplier_code}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Rating</span>
                                    <Badge variant={getRatingBadgeVariant(supplier.rating)}>{supplier.rating}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created</span>
                                    <span className="text-sm">{supplier.created_at}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {supplier.purchaseOrders && supplier.purchaseOrders.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Purchase Orders</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order #</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {supplier.purchaseOrders.slice(0, 5).map((order) => (
                                                <TableRow key={order.id}>
                                                    <TableCell className="font-medium">
                                                        <Link href={route('purchase-orders.show', order.id)} className="hover:underline">
                                                            {order.order_number}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-sm">{order.order_date}</TableCell>
                                                    <TableCell className="text-right">${parseFloat(order.total_amount).toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getOrderStatusBadge(order.status)} className="text-xs">
                                                            {order.status.replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {supplier.purchaseOrders.length > 5 && (
                                        <div className="mt-4 text-center">
                                            <Link href={route('purchase-orders.index', { supplier_id: supplier.id })}>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <Package className="h-4 w-4" /> View All Orders
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
