import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Currency {
    id: number;
    name: string;
    code: string;
    symbol: string;
    rate: number;
}

interface Props {
    currencies: {
        data: Currency[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function CurrencyIndex({ currencies, filters }: Props) {
    const { hasPermission } = usePermission();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Currencies', href: '/currencies' }];

    const {
        data: createData,
        setData: setCreateData,
        post,
        processing: creating,
        reset: resetCreate,
    } = useForm({
        name: '',
        code: '',
        symbol: '',
        rate: 1,
    });

    const {
        data: updateData,
        setData: setUpdateData,
        put,
        processing: updating,
        reset: resetUpdate,
    } = useForm({
        name: '',
        code: '',
        symbol: '',
        rate: 1,
    });

    const handleSearch = () => {
        router.get(route('currencies.index'), { search: searchQuery }, { preserveState: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('currencies.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
                toast.success('Currency created successfully', { position: 'top-center', duration: 3000 });
            },
            onError: () => {
                toast.error('Error creating currency', { position: 'top-center', duration: 3000 });
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCurrency) return;

        put(route('currencies.update', editingCurrency.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingCurrency(null);
                resetUpdate();
                toast.success('Currency updated successfully', { position: 'top-center', duration: 3000 });
            },
            onError: () => {
                toast.error('Error updating currency', { position: 'top-center', duration: 3000 });
            },
        });
    };

    const handleDelete = (currencyId: number) => {
        if (confirm('Are you sure you want to delete this currency?')) {
            router.delete(route('currencies.destroy', currencyId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Currency deleted successfully', { position: 'top-center', duration: 3000 });
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Error deleting currency', { position: 'top-center', duration: 3000 });
                },
            });
        }
    };

    const openEditDialog = (currency: Currency) => {
        setEditingCurrency(currency);
        setUpdateData({
            name: currency.name,
            code: currency.code,
            symbol: currency.symbol,
            rate: currency.rate,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Currencies" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Currencies</h1>
                    {hasPermission('create_currencies') && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add Currency
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Create New Currency</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Currency Name *</Label>
                                        <Input
                                            value={createData.name}
                                            onChange={(e) => setCreateData('name', e.target.value)}
                                            placeholder="e.g., US Dollar"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Code *</Label>
                                            <Input
                                                value={createData.code}
                                                onChange={(e) => setCreateData('code', e.target.value.toUpperCase())}
                                                placeholder="e.g., USD"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Symbol *</Label>
                                            <Input
                                                value={createData.symbol}
                                                onChange={(e) => setCreateData('symbol', e.target.value)}
                                                placeholder="e.g., $"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Exchange Rate *</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={createData.rate}
                                            onChange={(e) => setCreateData('rate', parseFloat(e.target.value) || 0)}
                                            placeholder="1.00"
                                            required
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
                                            {creating ? 'Creating...' : 'Create Currency'}
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
                            <CardTitle>Currencies</CardTitle>
                            <div className="relative">
                                <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    placeholder="Search currencies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-64 pl-8"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Symbol</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currencies.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-muted-foreground text-center">
                                            No currencies found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currencies.data.map((currency) => (
                                        <TableRow key={currency.id}>
                                            <TableCell>{currency.id}</TableCell>
                                            <TableCell className="font-mono">{currency.code}</TableCell>
                                            <TableCell className="font-medium">{currency.name}</TableCell>
                                            <TableCell>{currency.symbol}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{currency.rate}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={route('currencies.show', currency.id)}>
                                                        <Button variant="outline" size="icon">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {hasPermission('update_currencies') && (
                                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(currency)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('delete_currencies') && (
                                                        <Button variant="outline" size="icon" onClick={() => handleDelete(currency.id)}>
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

                {currencies.links && currencies.links.length > 1 && <Pagination links={currencies.links} />}

                {editingCurrency && (
                    <Dialog open={!!editingCurrency} onOpenChange={(open) => !open && setEditingCurrency(null)}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Edit Currency</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Currency Name *</Label>
                                    <Input value={updateData.name} onChange={(e) => setUpdateData('name', e.target.value)} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Code *</Label>
                                        <Input
                                            value={updateData.code}
                                            onChange={(e) => setUpdateData('code', e.target.value.toUpperCase())}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Symbol *</Label>
                                        <Input value={updateData.symbol} onChange={(e) => setUpdateData('symbol', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Exchange Rate *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={updateData.rate}
                                        onChange={(e) => setUpdateData('rate', parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingCurrency(null);
                                            resetUpdate();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={updating}>
                                        {updating ? 'Updating...' : 'Update Currency'}
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
