import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    code: string;
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
}

interface Props {
    medicines: {
        data: Medicine[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Category[];
    filters: {
        search?: string;
        category_id?: string;
        is_active?: string;
        requires_prescription?: string;
        is_controlled?: string;
    };
}

export default function MedicinesIndex({ medicines, categories, filters }: Props) {
    const { hasPermission } = usePermission();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Medicines', href: '/medicines' },
    ];

    const {
        data: createData,
        setData: setCreateData,
        post,
        processing: creating,
        reset: resetCreate,
    } = useForm({
        name: '',
        generic_name: '',
        brand_name: '',
        category_id: '',
        dosage_form: '',
        strength: '',
        unit: 'piece',
        manufacturer: '',
        sku: '',
        barcode: '',
        rack_location: '',
        cost_price: '',
        selling_price: '',
        wholesale_price: '',
        reorder_level: 10,
        minimum_stock: 5,
        maximum_stock: '',
        requires_prescription: false,
        is_controlled: false,
        is_active: true,
        is_vaccine: false,
        side_effects: '',
        contraindications: '',
        storage_instructions: '',
        description: '',
    });

    const {
        data: updateData,
        setData: setUpdateData,
        put,
        processing: updating,
        reset: resetUpdate,
    } = useForm({
        name: '',
        generic_name: '',
        brand_name: '',
        category_id: '',
        dosage_form: '',
        strength: '',
        unit: 'piece',
        manufacturer: '',
        sku: '',
        barcode: '',
        rack_location: '',
        cost_price: '',
        selling_price: '',
        wholesale_price: '',
        reorder_level: 10,
        minimum_stock: 5,
        maximum_stock: '',
        requires_prescription: false,
        is_controlled: false,
        is_active: true,
        is_vaccine: false,
        side_effects: '',
        contraindications: '',
        storage_instructions: '',
        description: '',
    });

    const handleSearch = () => {
        router.get(
            route('medicines.index'),
            {
                search: searchQuery,
                category_id: selectedCategory,
            },
            { preserveState: true },
        );
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('medicines.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
                toast.success('Medicine created successfully', { position: 'top-center', duration: 3000 });
            },
            onError: () => {
                toast.error('Error creating medicine', { position: 'top-center', duration: 3000 });
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMedicine) return;

        put(route('medicines.update', editingMedicine.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingMedicine(null);
                resetUpdate();
                toast.success('Medicine updated successfully', { position: 'top-center', duration: 3000 });
            },
            onError: () => {
                toast.error('Error updating medicine', { position: 'top-center', duration: 3000 });
            },
        });
    };

    const handleDelete = (medicineId: number) => {
        if (confirm('Are you sure you want to delete this medicine?')) {
            router.delete(route('medicines.destroy', medicineId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Medicine deleted successfully', { position: 'top-center', duration: 3000 });
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Error deleting medicine', { position: 'top-center', duration: 3000 });
                },
            });
        }
    };

    const openEditDialog = (medicine: Medicine) => {
        setEditingMedicine(medicine);
        setUpdateData({
            name: medicine.name,
            generic_name: medicine.generic_name || '',
            brand_name: medicine.brand_name || '',
            category_id: medicine.category?.id?.toString() || '',
            dosage_form: medicine.dosage_form || '',
            strength: medicine.strength || '',
            unit: medicine.unit,
            manufacturer: medicine.manufacturer || '',
            sku: '',
            barcode: '',
            rack_location: '',
            cost_price: medicine.cost_price,
            selling_price: medicine.selling_price,
            wholesale_price: '',
            reorder_level: medicine.reorder_level,
            minimum_stock: medicine.minimum_stock,
            maximum_stock: '',
            requires_prescription: medicine.requires_prescription,
            is_controlled: medicine.is_controlled,
            is_active: medicine.is_active,
            is_vaccine: medicine.is_vaccine,
            side_effects: '',
            contraindications: '',
            storage_instructions: '',
            description: '',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medicines Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Medicines Management</h1>
                    {hasPermission('create_medicines') && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add Medicine
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create New Medicine</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label>Medicine Name *</Label>
                                            <Input value={createData.name} onChange={(e) => setCreateData('name', e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Generic Name</Label>
                                            <Input value={createData.generic_name} onChange={(e) => setCreateData('generic_name', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Brand Name</Label>
                                            <Input value={createData.brand_name} onChange={(e) => setCreateData('brand_name', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select value={createData.category_id} onValueChange={(v) => setCreateData('category_id', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Dosage Form</Label>
                                            <Input
                                                value={createData.dosage_form}
                                                onChange={(e) => setCreateData('dosage_form', e.target.value)}
                                                placeholder="Tablet, Capsule, etc."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Strength</Label>
                                            <Input
                                                value={createData.strength}
                                                onChange={(e) => setCreateData('strength', e.target.value)}
                                                placeholder="500mg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Unit</Label>
                                            <Input value={createData.unit} onChange={(e) => setCreateData('unit', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Manufacturer</Label>
                                            <Input value={createData.manufacturer} onChange={(e) => setCreateData('manufacturer', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Rack Location</Label>
                                            <Input
                                                value={createData.rack_location}
                                                onChange={(e) => setCreateData('rack_location', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Cost Price</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={createData.cost_price}
                                                onChange={(e) => setCreateData('cost_price', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Selling Price</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={createData.selling_price}
                                                onChange={(e) => setCreateData('selling_price', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Reorder Level</Label>
                                            <Input
                                                type="number"
                                                value={createData.reorder_level}
                                                onChange={(e) => setCreateData('reorder_level', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Minimum Stock</Label>
                                            <Input
                                                type="number"
                                                value={createData.minimum_stock}
                                                onChange={(e) => setCreateData('minimum_stock', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="requires_prescription"
                                                checked={createData.requires_prescription}
                                                onCheckedChange={(checked) => setCreateData('requires_prescription', !!checked)}
                                            />
                                            <Label htmlFor="requires_prescription">Requires Prescription</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_controlled"
                                                checked={createData.is_controlled}
                                                onCheckedChange={(checked) => setCreateData('is_controlled', !!checked)}
                                            />
                                            <Label htmlFor="is_controlled">Controlled Substance</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_vaccine"
                                                checked={createData.is_vaccine}
                                                onCheckedChange={(checked) => setCreateData('is_vaccine', !!checked)}
                                            />
                                            <Label htmlFor="is_vaccine">Vaccine</Label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={createData.description}
                                            onChange={(e) => setCreateData('description', e.target.value)}
                                            rows={2}
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
                                            {creating ? 'Creating...' : 'Create Medicine'}
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
                            <CardTitle>Medicines</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                        placeholder="Search medicines..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-64 pl-8"
                                    />
                                </div>
                                <Select
                                    value={selectedCategory}
                                    onValueChange={(v) => {
                                        setSelectedCategory(v);
                                        handleSearch();
                                    }}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value=" ">All Categories</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Generic Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Dosage</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {medicines.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-muted-foreground text-center">
                                            No medicines found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    medicines.data.map((medicine) => (
                                        <TableRow key={medicine.id}>
                                            <TableCell className="font-mono text-sm">{medicine.medicine_code}</TableCell>
                                            <TableCell className="font-medium">{medicine.name}</TableCell>
                                            <TableCell>{medicine.generic_name || '-'}</TableCell>
                                            <TableCell>{medicine.category?.name || '-'}</TableCell>
                                            <TableCell>{medicine.strength || '-'}</TableCell>
                                            <TableCell>${parseFloat(medicine.cost_price).toFixed(2)}</TableCell>
                                            <TableCell>${parseFloat(medicine.selling_price).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant={medicine.total_stock <= medicine.reorder_level ? 'destructive' : 'secondary'}>
                                                    {medicine.total_stock}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {medicine.is_active && <Badge variant="default">Active</Badge>}
                                                    {medicine.requires_prescription && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Rx
                                                        </Badge>
                                                    )}
                                                    {medicine.is_controlled && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            Ctrl
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {hasPermission('update_medicines') && (
                                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(medicine)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('delete_medicines') && (
                                                        <Button variant="outline" size="icon" onClick={() => handleDelete(medicine.id)}>
                                                            <Trash2 className="h-4 w-4" />
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

                {medicines.links && medicines.links.length > 1 && <Pagination links={medicines.links} />}

                {editingMedicine && (
                    <Dialog open={!!editingMedicine} onOpenChange={(open) => !open && setEditingMedicine(null)}>
                        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Medicine</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label>Medicine Name *</Label>
                                        <Input value={updateData.name} onChange={(e) => setUpdateData('name', e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Generic Name</Label>
                                        <Input value={updateData.generic_name} onChange={(e) => setUpdateData('generic_name', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Brand Name</Label>
                                        <Input value={updateData.brand_name} onChange={(e) => setUpdateData('brand_name', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select value={updateData.category_id} onValueChange={(v) => setUpdateData('category_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Dosage Form</Label>
                                        <Input value={updateData.dosage_form} onChange={(e) => setUpdateData('dosage_form', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Strength</Label>
                                        <Input value={updateData.strength} onChange={(e) => setUpdateData('strength', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Unit</Label>
                                        <Input value={updateData.unit} onChange={(e) => setUpdateData('unit', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Manufacturer</Label>
                                        <Input value={updateData.manufacturer} onChange={(e) => setUpdateData('manufacturer', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cost Price</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={updateData.cost_price}
                                            onChange={(e) => setUpdateData('cost_price', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Selling Price</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={updateData.selling_price}
                                            onChange={(e) => setUpdateData('selling_price', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Reorder Level</Label>
                                        <Input
                                            type="number"
                                            value={updateData.reorder_level}
                                            onChange={(e) => setUpdateData('reorder_level', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Minimum Stock</Label>
                                        <Input
                                            type="number"
                                            value={updateData.minimum_stock}
                                            onChange={(e) => setUpdateData('minimum_stock', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="update_requires_prescription"
                                            checked={updateData.requires_prescription}
                                            onCheckedChange={(checked) => setUpdateData('requires_prescription', !!checked)}
                                        />
                                        <Label htmlFor="update_requires_prescription">Requires Prescription</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="update_is_controlled"
                                            checked={updateData.is_controlled}
                                            onCheckedChange={(checked) => setUpdateData('is_controlled', !!checked)}
                                        />
                                        <Label htmlFor="update_is_controlled">Controlled Substance</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="update_is_vaccine"
                                            checked={updateData.is_vaccine}
                                            onCheckedChange={(checked) => setUpdateData('is_vaccine', !!checked)}
                                        />
                                        <Label htmlFor="update_is_vaccine">Vaccine</Label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingMedicine(null);
                                            resetUpdate();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={updating}>
                                        {updating ? 'Updating...' : 'Update Medicine'}
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
