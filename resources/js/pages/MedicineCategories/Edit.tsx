import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface MedicineCategory {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    medicines_count: number;
}

interface Props {
    category: MedicineCategory;
}

export default function MedicineCategoriesEdit({ category }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Medicine Categories', href: '/medicine-categories' },
        { title: category.name, href: `/medicine-categories/${category.id}` },
        { title: 'Edit', href: `/medicine-categories/${category.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: category.name ?? '',
        code: category.code ?? '',
        description: category.description ?? '',
        is_active: category.is_active ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('medicine-categories.update', category.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Category updated successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error updating category', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${category.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Edit Medicine Category</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Category Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., Antibiotics"
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="code">Code *</Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        required
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        disabled={processing}
                                        placeholder="e.g., ANTIBIOTIC"
                                    />
                                    <InputError message={errors.code} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    disabled={processing}
                                    placeholder="Enter category description"
                                    rows={3}
                                />
                                <InputError message={errors.description} className="mt-1" />
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <Label>Active</Label>
                                    <p className="text-muted-foreground text-sm">Category is available for use</p>
                                </div>
                                <Switch checked={data.is_active} onCheckedChange={(checked) => setData('is_active', !!checked)} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(route('medicine-categories.index'))}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Category
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
