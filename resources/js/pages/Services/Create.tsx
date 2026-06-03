import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface Department {
    id: number;
    name: string;
}

interface Props {
    departments: Department[];
}

export default function ServicesCreate({ departments }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Services', href: '/services' },
        { title: 'Create', href: '/services/create' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        description: '',
        category: '',
        price: '',
        duration_minutes: '',
        department_id: '',
        status: 'active',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('services.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Service created successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
                reset();
            },
            onError: () => {
                toast.error('Error creating service', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Service" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Create New Service</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Service Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., Consultation, X-Ray"
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="code">Service Code *</Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        required
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., SVC001"
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
                                    placeholder="Service description..."
                                    rows={3}
                                />
                                <InputError message={errors.description} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        type="text"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., Radiology, Laboratory"
                                    />
                                    <InputError message={errors.category} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        disabled={processing}
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.price} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                                    <Input
                                        id="duration_minutes"
                                        type="number"
                                        min="0"
                                        value={data.duration_minutes}
                                        onChange={(e) => setData('duration_minutes', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 30"
                                    />
                                    <InputError message={errors.duration_minutes} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="department_id">Department *</Label>
                                    <Select
                                        value={data.department_id}
                                        onValueChange={(value) => setData('department_id', value)}
                                        disabled={processing}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={String(dept.id)}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.department_id} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)} disabled={processing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} className="mt-1" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('services.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create Service
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
