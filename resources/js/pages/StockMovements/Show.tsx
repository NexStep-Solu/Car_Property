import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, RefreshCw, Trash2 } from 'lucide-react';
import React from 'react';

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

interface InventoryStock {
    id: number;
    batch_number: string | null;
    expiry_date: string | null;
    quantity: number;
}

interface StockMovement {
    id: number;
    medicine: Medicine;
    supplier: Supplier | null;
    user: User | null;
    inventory_stock: InventoryStock | null;
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
    created_at: string;
    updated_at: string;
}

interface Props {
    movement: StockMovement;
    movementTypes: Record<string, string>;
}

function Info({ label, value }: { label: string; value?: string | null | React.ReactNode }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function StockMovementsShow({ movement, movementTypes }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Stock Movements', href: '/stock-movements' },
        { title: movement.reference_number || `Movement #${movement.id}`, href: `/stock-movements/${movement.id}` },
    ];

    const getMovementIcon = (type: string) => {
        switch (type) {
            case 'purchase':
            case 'initial_stock':
            case 'purchase_return':
                return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
            case 'sale':
            case 'sale_return':
                return <ArrowUpRight className="h-5 w-5 text-blue-500" />;
            case 'expired':
            case 'damaged':
            case 'damage_write_off':
            case 'theft':
                return <Trash2 className="h-5 w-5 text-red-500" />;
            case 'adjustment':
                return <RefreshCw className="h-5 w-5 text-yellow-500" />;
            default:
                return null;
        }
    };

    const getMovementTypeBadge = (type: string) => {
        switch (type) {
            case 'purchase':
            case 'initial_stock':
            case 'purchase_return':
                return 'default' as const;
            case 'sale':
            case 'sale_return':
                return 'secondary' as const;
            case 'expired':
            case 'damaged':
            case 'damage_write_off':
            case 'theft':
                return 'destructive' as const;
            case 'adjustment':
                return 'outline' as const;
            default:
                return 'secondary' as const;
        }
    };

    const formatCurrency = (value: string | null) => {
        if (!value) return '-';
        return `$${parseFloat(value).toFixed(2)}`;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Stock Movement: ${movement.reference_number}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" onClick={() => router.visit(route('stock-movements.index'))}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{movement.reference_number}</h1>
                            <div className="flex items-center gap-2">
                                {getMovementIcon(movement.movement_type)}
                                <Badge variant={getMovementTypeBadge(movement.movement_type)}>
                                    {movementTypes[movement.movement_type] || movement.movement_type}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Movement Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                        <Info label="Reference Number" value={movement.reference_number} />
                        <Info label="Movement Date" value={formatDate(movement.movement_date)} />
                        <Info label="Movement Type" value={movementTypes[movement.movement_type] || movement.movement_type} />
                        <Info label="Created At" value={formatDateTime(movement.created_at)} />
                        <Info label="Updated At" value={formatDateTime(movement.updated_at)} />
                        <Info label="Recorded By" value={movement.user?.name || '-'} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Medicine Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                        <Info label="Medicine Name" value={movement.medicine?.name} />
                        <Info label="Medicine Code" value={movement.medicine?.medicine_code} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quantity Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
                        <Info
                            label="Movement Quantity"
                            value={
                                <span className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {movement.quantity > 0 ? '+' : ''}
                                    {movement.quantity}
                                </span>
                            }
                        />
                        <Info label="Previous Quantity" value={movement.previous_quantity.toString()} />
                        <Info label="New Quantity" value={movement.new_quantity.toString()} />
                        <Info
                            label="Quantity Change"
                            value={`${movement.new_quantity - movement.previous_quantity >= 0 ? '+' : ''}${movement.new_quantity - movement.previous_quantity}`}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cost Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                        <Info label="Unit Cost" value={formatCurrency(movement.unit_cost)} />
                        <Info label="Total Cost" value={formatCurrency(movement.total_cost)} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Reference Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                        <Info label="Batch Number" value={movement.batch_number} />
                        <Info label="Invoice Number" value={movement.invoice_number} />
                        <Info label="Challan Number" value={movement.challan_number} />
                    </CardContent>
                </Card>

                {movement.supplier && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Supplier Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                            <Info label="Supplier Name" value={movement.supplier.name} />
                            <Info label="Supplier Code" value={movement.supplier.supplier_code} />
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm">
                        <Info label="Reason" value={movement.reason} />
                        <Info label="Notes" value={movement.notes} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
