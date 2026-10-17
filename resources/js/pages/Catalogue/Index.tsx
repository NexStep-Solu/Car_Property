import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CarModel {
    id: number;
    name: string;
    is_active: boolean;
}

interface CarMake {
    id: number;
    name: string;
    is_active: boolean;
    car_models: CarModel[];
}

interface CarCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
}

interface Props {
    makes: CarMake[];
    categories: CarCategory[];
}

export default function CatalogueIndex({ makes, categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Catalogue', href: '/catalogue' }];

    const [isMakeOpen, setIsMakeOpen] = useState(false);
    const [editingMake, setEditingMake] = useState<CarMake | null>(null);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CarCategory | null>(null);
    const [editingModel, setEditingModel] = useState<(CarModel & { make_id: number }) | null>(null);

    const makeForm = useForm({ name: '', is_active: true as boolean });
    const editMakeForm = useForm({ name: '', is_active: true as boolean });
    const categoryForm = useForm({ name: '', description: '', is_active: true as boolean });
    const editCategoryForm = useForm({ name: '', description: '', is_active: true as boolean });
    const modelForm = useForm({ make_id: '', name: '', is_active: true as boolean });
    const editModelForm = useForm({ name: '', is_active: true as boolean });

    const submitMake = (e: React.FormEvent) => {
        e.preventDefault();
        makeForm.post(route('makes.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsMakeOpen(false);
                makeForm.reset();
                toast.success('Make added.');
            },
            onError: () => toast.error('Could not add make.'),
        });
    };

    const openEditMake = (make: CarMake) => {
        setEditingMake(make);
        editMakeForm.setData({ name: make.name, is_active: make.is_active });
    };

    const submitEditMake = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMake) return;
        editMakeForm.put(route('makes.update', editingMake.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingMake(null);
                toast.success('Make updated.');
            },
            onError: () => toast.error('Could not update make.'),
        });
    };

    const deleteMake = (make: CarMake) => {
        if (!confirm(`Delete make "${make.name}"?`)) return;
        router.delete(route('makes.destroy', make.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Make deleted.'),
            onError: () => toast.error('Could not delete make.'),
        });
    };

    const submitCategory = (e: React.FormEvent) => {
        e.preventDefault();
        categoryForm.post(route('categories.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCategoryOpen(false);
                categoryForm.reset();
                toast.success('Category added.');
            },
            onError: () => toast.error('Could not add category.'),
        });
    };

    const openEditCategory = (category: CarCategory) => {
        setEditingCategory(category);
        editCategoryForm.setData({ name: category.name, description: category.description || '', is_active: category.is_active });
    };

    const submitEditCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        editCategoryForm.put(route('categories.update', editingCategory.slug), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingCategory(null);
                toast.success('Category updated.');
            },
            onError: () => toast.error('Could not update category.'),
        });
    };

    const deleteCategory = (category: CarCategory) => {
        if (!confirm(`Delete category "${category.name}"?`)) return;
        router.delete(route('categories.destroy', category.slug), {
            preserveScroll: true,
            onSuccess: () => toast.success('Category deleted.'),
            onError: () => toast.error('Could not delete category.'),
        });
    };

    const submitModel = (e: React.FormEvent) => {
        e.preventDefault();
        modelForm.post(route('models.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsModelOpen(false);
                modelForm.reset();
                toast.success('Model added.');
            },
            onError: () => toast.error('Could not add model.'),
        });
    };

    const openEditModel = (makeId: number, model: CarModel) => {
        setEditingModel({ ...model, make_id: makeId });
        editModelForm.setData({ name: model.name, is_active: model.is_active });
    };

    const submitEditModel = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingModel) return;
        editModelForm.put(route('models.update', editingModel.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingModel(null);
                toast.success('Model updated.');
            },
            onError: () => toast.error('Could not update model.'),
        });
    };

    const deleteModel = (model: CarModel) => {
        if (!confirm(`Delete model "${model.name}"?`)) return;
        router.delete(route('models.destroy', model.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Model deleted.'),
            onError: () => toast.error('Could not delete model.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Makes & Models" />
            <div className="space-y-6 p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Makes & Models</h1>
                    <div className="flex gap-2">
                        <Dialog open={isMakeOpen} onOpenChange={setIsMakeOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Make
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Make</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submitMake} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="make-name">Name *</Label>
                                        <Input id="make-name" value={makeForm.data.name} onChange={(e) => makeForm.setData('name', e.target.value)} placeholder="Toyota" />
                                        <InputError message={makeForm.errors.name} />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm">
                                        <Checkbox checked={makeForm.data.is_active} onClick={() => makeForm.setData('is_active', !makeForm.data.is_active)} />
                                        Active
                                    </label>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={makeForm.processing}>
                                            Add Make
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={isModelOpen} onOpenChange={setIsModelOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Model
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Model</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submitModel} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Make *</Label>
                                        <Select value={modelForm.data.make_id || undefined} onValueChange={(v) => modelForm.setData('make_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select make" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {makes.map((m) => (
                                                    <SelectItem key={m.id} value={String(m.id)}>
                                                        {m.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={modelForm.errors.make_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="model-name">Name *</Label>
                                        <Input id="model-name" value={modelForm.data.name} onChange={(e) => modelForm.setData('name', e.target.value)} placeholder="Hilux" />
                                        <InputError message={modelForm.errors.name} />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm">
                                        <Checkbox checked={modelForm.data.is_active} onClick={() => modelForm.setData('is_active', !modelForm.data.is_active)} />
                                        Active
                                    </label>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={modelForm.processing}>
                                            Add Model
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Category
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Category</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submitCategory} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="category-name">Name *</Label>
                                        <Input id="category-name" value={categoryForm.data.name} onChange={(e) => categoryForm.setData('name', e.target.value)} placeholder="Sedan" />
                                        <InputError message={categoryForm.errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category-description">Description</Label>
                                        <Input id="category-description" value={categoryForm.data.description} onChange={(e) => categoryForm.setData('description', e.target.value)} />
                                        <InputError message={categoryForm.errors.description} />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm">
                                        <Checkbox checked={categoryForm.data.is_active} onClick={() => categoryForm.setData('is_active', !categoryForm.data.is_active)} />
                                        Active
                                    </label>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={categoryForm.processing}>
                                            Add Category
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {makes.map((make) => (
                    <Card key={make.id}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                {make.name}
                                {!make.is_active && <Badge variant="outline">Inactive</Badge>}
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => openEditMake(make)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => deleteMake(make)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {make.car_models.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {make.car_models.map((model) => (
                                        <div key={model.id} className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm">
                                            <span className={model.is_active ? '' : 'text-muted-foreground line-through'}>{model.name}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditModel(make.id, model)}>
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteModel(model)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No models yet.</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {makes.length === 0 && (
                    <Card>
                        <CardContent>
                            <p className="text-muted-foreground py-6 text-center text-sm">No makes yet. Add your first make to get started.</p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categories.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <div key={category.id} className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm">
                                        <span className={category.is_active ? 'font-medium' : 'text-muted-foreground line-through'}>{category.name}</span>
                                        <span className="text-muted-foreground text-xs">({category.slug})</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditCategory(category)}>
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteCategory(category)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No categories yet.</p>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={editingMake !== null} onOpenChange={(open) => !open && setEditingMake(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Make</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitEditMake} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-make-name">Name *</Label>
                                <Input id="edit-make-name" value={editMakeForm.data.name} onChange={(e) => editMakeForm.setData('name', e.target.value)} />
                                <InputError message={editMakeForm.errors.name} />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox checked={editMakeForm.data.is_active} onClick={() => editMakeForm.setData('is_active', !editMakeForm.data.is_active)} />
                                Active
                            </label>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={editMakeForm.processing}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={editingModel !== null} onOpenChange={(open) => !open && setEditingModel(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Model</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitEditModel} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-model-name">Name *</Label>
                                <Input id="edit-model-name" value={editModelForm.data.name} onChange={(e) => editModelForm.setData('name', e.target.value)} />
                                <InputError message={editModelForm.errors.name} />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox checked={editModelForm.data.is_active} onClick={() => editModelForm.setData('is_active', !editModelForm.data.is_active)} />
                                Active
                            </label>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={editModelForm.processing}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={editingCategory !== null} onOpenChange={(open) => !open && setEditingCategory(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitEditCategory} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-category-name">Name *</Label>
                                <Input id="edit-category-name" value={editCategoryForm.data.name} onChange={(e) => editCategoryForm.setData('name', e.target.value)} />
                                <InputError message={editCategoryForm.errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-category-description">Description</Label>
                                <Input id="edit-category-description" value={editCategoryForm.data.description} onChange={(e) => editCategoryForm.setData('description', e.target.value)} />
                                <InputError message={editCategoryForm.errors.description} />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox checked={editCategoryForm.data.is_active} onClick={() => editCategoryForm.setData('is_active', !editCategoryForm.data.is_active)} />
                                Active
                            </label>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={editCategoryForm.processing}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
