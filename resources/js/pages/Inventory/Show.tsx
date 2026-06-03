import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Building2, Calendar, DollarSign, Edit, FileText, Hash, MapPin, Package } from 'lucide-react';

interface Medicine {
    id: number;
    medicine_code: string;
    name: string;
    category: { id: number; name: string } | null;
    generic_name: string | null;
    manufacturer: string | null;
}

interface Supplier {
    id: number;
    supplier_code: string;
    name: string;
    email: string | null;
    phone: string | null;
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
    total_value: string;
    created_at: string;
    updated_at: string;
}

export default function InventoryShow({ stock }: { stock: InventoryStock }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Inventory', href: '/inventory' },
        { title: stock.medicine.name, href: `/inventory/${stock.id}` },
    ];

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

    const getExpiryStatus = () => {
        if (!stock.days_to_expiry) return null;
        if (stock.days_to_expiry <= 0) {
            return { variant: 'destructive' as const, text: 'Expired' };
        }
        if (stock.days_to_expiry <= 30) {
            return { variant: 'destructive' as const, text: `Expires in ${stock.days_to_expiry} days` };
        }
        if (stock.days_to_expiry <= 90) {
            return { variant: 'secondary' as const, text: `Expires in ${stock.days_to_expiry} days` };
        }
        return { variant: 'default' as const, text: `Expires in ${stock.days_to_expiry} days` };
    };

    const expiryStatus = getExpiryStatus();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Inventory Stock - ${stock.medicine.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{stock.medicine.name}</h1>
                            <p className="text-muted-foreground text-sm">
                                {stock.medicine.medicine_code} {stock.batch_number && `• Batch: ${stock.batch_number}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadge(stock.status)} className="text-base capitalize">
                            {stock.status}
                        </Badge>
                        <Button
                            variant="outline"
                            onClick={() => {
                                window.location.href = route('inventory.edit', stock.id);
                            }}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </div>
                </div>

                {expiryStatus && (
                    <div
                        className={`rounded-lg border p-4 ${stock.is_expired ? 'border-destructive bg-destructive/10' : 'border-yellow-500/50 bg-yellow-500/10'}`}
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-5 w-5 ${stock.is_expired ? 'text-destructive' : 'text-yellow-500'}`} />
                            <span className={`font-medium ${stock.is_expired ? 'text-destructive' : 'text-yellow-700 dark:text-yellow-500'}`}>
                                {expiryStatus.text}
                            </span>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Medicine Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-muted-foreground text-sm">Medicine Name</p>
                                    <p className="font-medium">{stock.medicine.name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Medicine Code</p>
                                    <p className="font-mono">{stock.medicine.medicine_code}</p>
                                </div>
                                {stock.medicine.category && (
                                    <div>
                                        <p className="text-muted-foreground text-sm">Category</p>
                                        <p className="font-medium">{stock.medicine.category.name}</p>
                                    </div>
                                )}
                                {stock.medicine.generic_name && (
                                    <div>
                                        <p className="text-muted-foreground text-sm">Generic Name</p>
                                        <p className="font-medium">{stock.medicine.generic_name}</p>
                                    </div>
                                )}
                                {stock.medicine.manufacturer && (
                                    <div>
                                        <p className="text-muted-foreground text-sm">Manufacturer</p>
                                        <p className="font-medium">{stock.medicine.manufacturer}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Pricing
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-muted-foreground text-sm">Unit Cost</p>
                                    <p className="text-2xl font-bold">${parseFloat(stock.unit_cost).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Unit Price</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        ${parseFloat(stock.unit_price).toFixed(2)}
                                    </p>
                                </div>
                                <div className="border-t pt-4">
                                    <p className="text-muted-foreground text-sm">Total Value</p>
                                    <p className="text-xl font-semibold">{stock.total_value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Hash className="h-5 w-5" />
                                Batch Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                <div>
                                    <p className="text-muted-foreground text-sm">Batch Number</p>
                                    <p className="font-mono font-medium">{stock.batch_number || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Pack Size</p>
                                    <p className="font-medium">{stock.pack_size || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Expiry Date</p>
                                    <p className={`font-medium ${stock.is_expired ? 'text-destructive' : ''}`}>{stock.expiry_date || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Manufacture Date</p>
                                    <p className="font-medium">{stock.manufacture_date || '-'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Stock Quantities
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="bg-card rounded-lg border p-4">
                                    <p className="text-muted-foreground text-sm">Total Quantity</p>
                                    <p className="text-3xl font-bold">{stock.quantity}</p>
                                </div>
                                <div className="bg-card rounded-lg border p-4">
                                    <p className="text-muted-foreground text-sm">Available</p>
                                    <p className={`text-3xl font-bold ${stock.available_quantity <= 10 ? 'text-destructive' : ''}`}>
                                        {stock.available_quantity}
                                    </p>
                                </div>
                                <div className="bg-card rounded-lg border p-4">
                                    <p className="text-muted-foreground text-sm">Reserved</p>
                                    <p className="text-3xl font-bold text-yellow-500">{stock.reserved_quantity}</p>
                                </div>
                                <div className="bg-card rounded-lg border p-4">
                                    <p className="text-muted-foreground text-sm">Damaged</p>
                                    <p className={`text-3xl font-bold ${stock.damaged_quantity > 0 ? 'text-destructive' : ''}`}>
                                        {stock.damaged_quantity}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Supplier
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stock.supplier ? (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-muted-foreground text-sm">Supplier Name</p>
                                        <p className="font-medium">{stock.supplier.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">Supplier Code</p>
                                        <p className="font-mono">{stock.supplier.supplier_code}</p>
                                    </div>
                                    {stock.supplier.email && (
                                        <div>
                                            <p className="text-muted-foreground text-sm">Email</p>
                                            <p className="font-medium">{stock.supplier.email}</p>
                                        </div>
                                    )}
                                    {stock.supplier.phone && (
                                        <div>
                                            <p className="text-muted-foreground text-sm">Phone</p>
                                            <p className="font-medium">{stock.supplier.phone}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No supplier assigned</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Warehouse Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <p className="text-muted-foreground text-sm">Warehouse</p>
                                    <p className="font-medium">{stock.warehouse || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Shelf Location</p>
                                    <p className="font-mono font-medium">{stock.shelf_location || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Received Date</p>
                                    <p className="font-medium">{stock.received_date || '-'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-muted-foreground text-sm">Created At</p>
                                    <p className="font-medium">{stock.created_at}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Last Updated</p>
                                    <p className="font-medium">{stock.updated_at}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {stock.notes && (
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{stock.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
