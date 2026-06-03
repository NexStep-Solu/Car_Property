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
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
}

interface Props {
    suppliers: {
        data: Supplier[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        rating?: string;
    };
}

export default function SuppliersIndex({ suppliers, filters }: Props) {
    const { hasPermission } = usePermission();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Suppliers', href: '/suppliers' },
    ];

    const {
        data: createData,
        setData: setCreateData,
        post,
        processing: creating,
        reset: resetCreate,
    } = useForm({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        tax_id: '',
        license_number: '',
        credit_limit: '',
        payment_terms_days: 30,
        rating: 'A',
        is_active: '1',
        notes: '',
    });

    const {
        data: updateData,
        setData: setUpdateData,
        put,
        processing: updating,
        reset: resetUpdate,
    } = useForm({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        tax_id: '',
        license_number: '',
        credit_limit: '',
        payment_terms_days: 30,
        rating: 'A',
        is_active: '1',
        notes: '',
    });

    const handleSearch = () => {
        router.get(
            route('suppliers.index'),
            {
                search: searchQuery,
            },
            { preserveState: true },
        );
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('suppliers.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
                toast.success('Supplier created successfully', { position: 'top-center', duration: 3000 });
            },
            onError: () => {
                toast.error('Error creating supplier', { position: 'top-center', duration: 3000 });
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSupplier) return;

        put(route('suppliers.update', editingSupplier.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingSupplier(null);
                resetUpdate();
                toast.success('Supplier updated successfully', { position: 'top-center', duration: 3000 });
            },
            onError: () => {
                toast.error('Error updating supplier', { position: 'top-center', duration: 3000 });
            },
        });
    };

    const handleDelete = (supplierId: number) => {
        if (confirm('Are you sure you want to delete this supplier?')) {
            router.delete(route('suppliers.destroy', supplierId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Supplier deleted successfully', { position: 'top-center', duration: 3000 });
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Error deleting supplier', { position: 'top-center', duration: 3000 });
                },
            });
        }
    };

    const openEditDialog = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setUpdateData({
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            mobile: supplier.mobile || '',
            address: supplier.address || '',
            city: supplier.city || '',
            state: supplier.state || '',
            country: supplier.country || '',
            postal_code: supplier.postal_code || '',
            tax_id: supplier.tax_id || '',
            license_number: supplier.license_number || '',
            credit_limit: supplier.credit_limit || '',
            payment_terms_days: supplier.payment_terms_days,
            rating: supplier.rating,
            is_active: supplier.is_active ? '1' : '0',
            notes: supplier.notes || '',
        });
    };

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Suppliers Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Suppliers Management</h1>
                    {hasPermission('create_suppliers') && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add Supplier
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create New Supplier</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Supplier Name *</Label>
                                            <Input value={createData.name} onChange={(e) => setCreateData('name', e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Contact Person</Label>
                                            <Input
                                                value={createData.contact_person}
                                                onChange={(e) => setCreateData('contact_person', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input type="email" value={createData.email} onChange={(e) => setCreateData('email', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input value={createData.phone} onChange={(e) => setCreateData('phone', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mobile</Label>
                                            <Input value={createData.mobile} onChange={(e) => setCreateData('mobile', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>City</Label>
                                            <Input value={createData.city} onChange={(e) => setCreateData('city', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>State</Label>
                                            <Input value={createData.state} onChange={(e) => setCreateData('state', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Country</Label>
                                            <Input value={createData.country} onChange={(e) => setCreateData('country', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Postal Code</Label>
                                            <Input value={createData.postal_code} onChange={(e) => setCreateData('postal_code', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tax ID</Label>
                                            <Input value={createData.tax_id} onChange={(e) => setCreateData('tax_id', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>License Number</Label>
                                            <Input
                                                value={createData.license_number}
                                                onChange={(e) => setCreateData('license_number', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Credit Limit</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={createData.credit_limit}
                                                onChange={(e) => setCreateData('credit_limit', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Payment Terms (Days)</Label>
                                            <Input
                                                type="number"
                                                value={createData.payment_terms_days}
                                                onChange={(e) => setCreateData('payment_terms_days', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Rating</Label>
                                            <Select value={createData.rating} onValueChange={(v) => setCreateData('rating', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="A">A - Excellent</SelectItem>
                                                    <SelectItem value="B">B - Good</SelectItem>
                                                    <SelectItem value="C">C - Average</SelectItem>
                                                    <SelectItem value="D">D - Poor</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Address</Label>
                                        <Textarea value={createData.address} onChange={(e) => setCreateData('address', e.target.value)} rows={2} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Notes</Label>
                                        <Textarea value={createData.notes} onChange={(e) => setCreateData('notes', e.target.value)} rows={3} />
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
                                            {creating ? 'Creating...' : 'Create Supplier'}
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
                            <CardTitle>Suppliers</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                        placeholder="Search suppliers..."
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
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact Person</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suppliers.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-muted-foreground text-center">
                                            No suppliers found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    suppliers.data.map((supplier) => (
                                        <TableRow key={supplier.id}>
                                            <TableCell className="font-mono text-sm">{supplier.supplier_code}</TableCell>
                                            <TableCell className="font-medium">{supplier.name}</TableCell>
                                            <TableCell>{supplier.contact_person || '-'}</TableCell>
                                            <TableCell>{supplier.email || '-'}</TableCell>
                                            <TableCell>{supplier.phone || supplier.mobile || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={getRatingBadgeVariant(supplier.rating)}>{supplier.rating}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                                                    {supplier.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {hasPermission('update_suppliers') && (
                                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(supplier)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('delete_suppliers') && (
                                                        <Button variant="outline" size="icon" onClick={() => handleDelete(supplier.id)}>
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

                {suppliers.links && suppliers.links.length > 1 && <Pagination links={suppliers.links} />}

                {editingSupplier && (
                    <Dialog open={!!editingSupplier} onOpenChange={(open) => !open && setEditingSupplier(null)}>
                        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Supplier</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Supplier Name *</Label>
                                        <Input value={updateData.name} onChange={(e) => setUpdateData('name', e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Contact Person</Label>
                                        <Input value={updateData.contact_person} onChange={(e) => setUpdateData('contact_person', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input type="email" value={updateData.email} onChange={(e) => setUpdateData('email', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input value={updateData.phone} onChange={(e) => setUpdateData('phone', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mobile</Label>
                                        <Input value={updateData.mobile} onChange={(e) => setUpdateData('mobile', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>City</Label>
                                        <Input value={updateData.city} onChange={(e) => setUpdateData('city', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>State</Label>
                                        <Input value={updateData.state} onChange={(e) => setUpdateData('state', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Country</Label>
                                        <Input value={updateData.country} onChange={(e) => setUpdateData('country', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Postal Code</Label>
                                        <Input value={updateData.postal_code} onChange={(e) => setUpdateData('postal_code', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tax ID</Label>
                                        <Input value={updateData.tax_id} onChange={(e) => setUpdateData('tax_id', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>License Number</Label>
                                        <Input value={updateData.license_number} onChange={(e) => setUpdateData('license_number', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Credit Limit</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={updateData.credit_limit}
                                            onChange={(e) => setUpdateData('credit_limit', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Payment Terms (Days)</Label>
                                        <Input
                                            type="number"
                                            value={updateData.payment_terms_days}
                                            onChange={(e) => setUpdateData('payment_terms_days', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Rating</Label>
                                        <Select value={updateData.rating} onValueChange={(v) => setUpdateData('rating', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">A - Excellent</SelectItem>
                                                <SelectItem value="B">B - Good</SelectItem>
                                                <SelectItem value="C">C - Average</SelectItem>
                                                <SelectItem value="D">D - Poor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Address</Label>
                                    <Textarea value={updateData.address} onChange={(e) => setUpdateData('address', e.target.value)} rows={2} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea value={updateData.notes} onChange={(e) => setUpdateData('notes', e.target.value)} rows={3} />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingSupplier(null);
                                            resetUpdate();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={updating}>
                                        {updating ? 'Updating...' : 'Update Supplier'}
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
