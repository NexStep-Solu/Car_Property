import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface Supplier {
    id: number;
    supplier_code: string;
    name: string;
    phone: string | null;
    email: string | null;
}

interface InventoryStock {
    id: number;
    supplier: Supplier;
    batch_number: string;
    expiry_date: string;
    quantity: number;
    cost_price: string;
    received_date: string;
}

interface Medicine {
    id: number;
    medicine_code: string;
    name: string;
    generic_name: string | null;
    brand_name: string | null;
    category: Category | null;
    dosage_form: string | null;
    strength: string | null;
    unit: string;
    manufacturer: string | null;
    cost_price: string;
    selling_price: string;
    reorder_level: number;
    minimum_stock: number;
    total_stock: number;
    requires_prescription: boolean;
    is_controlled: boolean;
    is_active: boolean;
    is_vaccine: boolean;
    side_effects: string | null;
    contraindications: string | null;
    storage_instructions: string | null;
    description: string | null;
    inventoryStocks: InventoryStock[];
}

interface Props {
    medicine: Medicine;
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

function InfoBadge({ label, value }: { label: string; value: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-sm">{label}</p>
            <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>
        </div>
    );
}

export default function MedicinesShow({ medicine }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Medicines', href: '/medicines' },
        { title: medicine.name, href: `/medicines/${medicine.id}` },
    ];

    const profitMargin =
        parseFloat(medicine.cost_price) > 0
            ? (((parseFloat(medicine.selling_price) - parseFloat(medicine.cost_price)) / parseFloat(medicine.cost_price)) * 100).toFixed(2)
            : '0.00';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Medicine: ${medicine.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" onClick={() => router.visit(route('medicines.index'))}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{medicine.name}</h1>
                            <p className="text-muted-foreground text-sm">
                                Code: {medicine.medicine_code}
                                {medicine.category && ` • ${medicine.category.name}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={medicine.is_active ? 'default' : 'secondary'} className="px-3 py-1 text-sm">
                            {medicine.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Link href={route('medicines.edit', medicine.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                <Info label="Medicine Code" value={medicine.medicine_code} />
                                <Info label="Name" value={medicine.name} />
                                <Info label="Generic Name" value={medicine.generic_name} />
                                <Info label="Brand Name" value={medicine.brand_name} />
                                <Info label="Category" value={medicine.category?.name} />
                                <Info label="Dosage Form" value={medicine.dosage_form} />
                                <Info label="Strength" value={medicine.strength} />
                                <Info label="Unit" value={medicine.unit} />
                                <Info label="Manufacturer" value={medicine.manufacturer} />
                                <InfoBadge label="Vaccine" value={medicine.is_vaccine} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                    <div className="rounded-lg border p-4">
                                        <p className="text-muted-foreground text-sm">Cost Price</p>
                                        <p className="text-2xl font-bold">${parseFloat(medicine.cost_price).toFixed(2)}</p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-muted-foreground text-sm">Selling Price</p>
                                        <p className="text-2xl font-bold">${parseFloat(medicine.selling_price).toFixed(2)}</p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-muted-foreground text-sm">Profit Margin</p>
                                        <p className="text-2xl font-bold text-green-600">{profitMargin}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                    <div className="rounded-lg border p-4">
                                        <p className="text-muted-foreground text-sm">Total Stock</p>
                                        <p
                                            className={`text-2xl font-bold ${
                                                medicine.total_stock <= medicine.reorder_level
                                                    ? 'text-red-600'
                                                    : medicine.total_stock <= medicine.minimum_stock
                                                      ? 'text-yellow-600'
                                                      : 'text-green-600'
                                            }`}
                                        >
                                            {medicine.total_stock} {medicine.unit}
                                        </p>
                                        {medicine.total_stock <= medicine.reorder_level && (
                                            <Badge variant="destructive" className="mt-2 text-xs">
                                                Below Reorder Level
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-muted-foreground text-sm">Reorder Level</p>
                                        <p className="text-2xl font-bold">{medicine.reorder_level}</p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-muted-foreground text-sm">Minimum Stock</p>
                                        <p className="text-2xl font-bold">{medicine.minimum_stock}</p>
                                    </div>
                                </div>

                                {medicine.inventoryStocks && medicine.inventoryStocks.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="mb-2 font-medium">Stock Details</h4>
                                        <div className="space-y-2">
                                            {medicine.inventoryStocks.map((stock) => (
                                                <div key={stock.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                                                    <div>
                                                        <p className="font-medium">Batch: {stock.batch_number}</p>
                                                        <p className="text-muted-foreground">
                                                            Supplier: {stock.supplier.name} • Received: {stock.received_date}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">{stock.quantity} units</p>
                                                        <p className="text-muted-foreground text-xs">Exp: {stock.expiry_date}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Medical Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-4">
                                    <InfoBadge label="Requires Prescription" value={medicine.requires_prescription} />
                                    <InfoBadge label="Controlled Substance" value={medicine.is_controlled} />
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-muted-foreground text-sm">Side Effects</p>
                                        <p className="font-medium whitespace-pre-wrap">{medicine.side_effects || '-'}</p>
                                    </div>

                                    <div>
                                        <p className="text-muted-foreground text-sm">Contraindications</p>
                                        <p className="font-medium whitespace-pre-wrap">{medicine.contraindications || '-'}</p>
                                    </div>

                                    <div>
                                        <p className="text-muted-foreground text-sm">Storage Instructions</p>
                                        <p className="font-medium whitespace-pre-wrap">{medicine.storage_instructions || '-'}</p>
                                    </div>

                                    <div>
                                        <p className="text-muted-foreground text-sm">Description</p>
                                        <p className="font-medium whitespace-pre-wrap">{medicine.description || '-'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Stock Status</span>
                                    <Badge
                                        variant={
                                            medicine.total_stock <= medicine.reorder_level
                                                ? 'destructive'
                                                : medicine.total_stock <= medicine.minimum_stock
                                                  ? 'secondary'
                                                  : 'default'
                                        }
                                    >
                                        {medicine.total_stock <= medicine.reorder_level
                                            ? 'Low Stock'
                                            : medicine.total_stock <= medicine.minimum_stock
                                              ? 'Warning'
                                              : 'In Stock'}
                                    </Badge>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Value</span>
                                    <span className="font-semibold">${(parseFloat(medicine.cost_price) * medicine.total_stock).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Potential Revenue</span>
                                    <span className="font-semibold">${(parseFloat(medicine.selling_price) * medicine.total_stock).toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Profit</span>
                                    <span className="font-semibold text-green-600">
                                        ${((parseFloat(medicine.selling_price) - parseFloat(medicine.cost_price)) * medicine.total_stock).toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Medicine Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Medicine ID</span>
                                    <span className="font-mono text-sm">{medicine.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Category</span>
                                    <Badge variant="outline">{medicine.category?.name || 'Uncategorized'}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Unit Type</span>
                                    <span>{medicine.unit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Type</span>
                                    <Badge variant={medicine.is_vaccine ? 'default' : 'outline'}>
                                        {medicine.is_vaccine ? 'Vaccine' : 'Medicine'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {medicine.inventoryStocks && medicine.inventoryStocks.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Suppliers</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {Array.from(new Map(medicine.inventoryStocks.map((stock) => [stock.supplier.id, stock.supplier])).values()).map(
                                        (supplier) => (
                                            <div key={supplier.id} className="text-sm">
                                                <p className="font-medium">{supplier.name}</p>
                                                <p className="text-muted-foreground">{supplier.supplier_code}</p>
                                                {supplier.phone && <p className="text-muted-foreground text-xs">{supplier.phone}</p>}
                                            </div>
                                        ),
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
