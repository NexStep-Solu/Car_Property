import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    description: string | null;
    is_active: boolean;
    medicines_count: number;
}

interface Props {
    categories: {
        data: Category[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        is_active?: string;
    };
}

export default function MedicineCategoriesIndex({ categories, filters }: Props) {
    const { hasPermission } = usePermission();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Medicine Categories', href: '/medicine-categories' },
    ];

    const {
        data: createData,
        setData: setCreateData,
        post,
        processing: creating,
        reset: resetCreate,
    } = useForm({
        name: '',
        code: '',
        description: '',
        is_active: true,
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
        description: '',
        is_active: true,
    });

    const handleSearch = () => {
        router.get(route('medicine-categories.index'), { search: searchQuery }, { preserveState: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('medicine-categories.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
                toast.success('Category created successfully', { position: 'top-center', duration: 3000 });
            },
            onError: () => {
                toast.error('Error creating category', { position: 'top-center', duration: 3000 });
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        put(route('medicine-categories.update', editingCategory.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingCategory(null);
                resetUpdate();
                toast.success('Category updated successfully', { position: 'top-center', duration: 3000 });
            },
            onError: () => {
                toast.error('Error updating category', { position: 'top-center', duration: 3000 });
            },
        });
    };

    const handleDelete = (categoryId: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(route('medicine-categories.destroy', categoryId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Category deleted successfully', { position: 'top-center', duration: 3000 });
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Error deleting category', { position: 'top-center', duration: 3000 });
                },
            });
        }
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setUpdateData({
            name: category.name,
            code: category.code,
            description: category.description || '',
            is_active: category.is_active,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medicine Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Medicine Categories</h1>
                    {hasPermission('create_medicine_categories') && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add Category
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Create New Category</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Category Name *</Label>
                                        <Input value={createData.name} onChange={(e) => setCreateData('name', e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Code *</Label>
                                        <Input
                                            value={createData.code}
                                            onChange={(e) => setCreateData('code', e.target.value.toUpperCase())}
                                            placeholder="e.g., ANTIBIOTIC"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={createData.description}
                                            onChange={(e) => setCreateData('description', e.target.value)}
                                            rows={3}
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
                                            {creating ? 'Creating...' : 'Create Category'}
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
                            <CardTitle>Categories</CardTitle>
                            <div className="relative">
                                <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    placeholder="Search categories..."
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
                                    <TableHead>Description</TableHead>
                                    <TableHead>Medicines</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-muted-foreground text-center">
                                            No categories found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.data.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell>{category.id}</TableCell>
                                            <TableCell className="font-mono">{category.code}</TableCell>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{category.description || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{category.medicines_count}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                                    {category.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {hasPermission('update_medicine_categories') && (
                                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(category)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('delete_medicine_categories') && (
                                                        <Button variant="outline" size="icon" onClick={() => handleDelete(category.id)}>
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

                {categories.links && categories.links.length > 1 && <Pagination links={categories.links} />}

                {editingCategory && (
                    <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Edit Category</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Category Name *</Label>
                                    <Input value={updateData.name} onChange={(e) => setUpdateData('name', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Code *</Label>
                                    <Input value={updateData.code} onChange={(e) => setUpdateData('code', e.target.value.toUpperCase())} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={updateData.description}
                                        onChange={(e) => setUpdateData('description', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingCategory(null);
                                            resetUpdate();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={updating}>
                                        {updating ? 'Updating...' : 'Update Category'}
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
