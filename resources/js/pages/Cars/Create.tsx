import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { capitalizeFirst } from '@/lib/utils';

interface Make {
    id: number;
    name: string;
}

interface Model {
    id: number;
    make_id: number;
    name: string;
}

interface ShowroomOption {
    id: number;
    business_name: string;
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    makes: Make[];
    models: Model[];
    categories: Category[];
    showrooms: ShowroomOption[];
    conditions: string[];
    transmissions: string[];
    fuels: string[];
}

export function CarFormFields({ data, setData, errors, makes, models, categories, showrooms, conditions, transmissions, fuels, showListingAs }: {
    data: Record<string, string>;
    setData: (key: string, value: string) => void;
    errors: Record<string, string>;
    makes: Make[];
    models: Model[];
    categories: Category[];
    showrooms: ShowroomOption[];
    conditions: string[];
    transmissions: string[];
    fuels: string[];
    showListingAs: boolean;
}) {
    const filteredModels = models.filter((m) => !data.make_id || m.make_id === Number(data.make_id));

    return (
        <>
            {showListingAs && (
                <div className="grid gap-2">
                    <Label>List as *</Label>
                    <Select
                        value={data.showroom_id ? `showroom:${data.showroom_id}` : 'self'}
                        onValueChange={(v) => {
                            if (v === 'self') {
                                setData('showroom_id', '');
                            } else {
                                setData('showroom_id', v.replace('showroom:', ''));
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="self">Myself (individual seller)</SelectItem>
                            {showrooms.map((s) => (
                                <SelectItem key={s.id} value={`showroom:${s.id}`}>
                                    {s.business_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.showroom_id} />
                </div>
            )}
            <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={data.category_id ? String(data.category_id) : undefined} onValueChange={(v) => setData('category_id', v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.category_id} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={String(data.title || '')} onChange={(e) => setData('title', e.target.value)} placeholder="Toyota Hilux 2020" />
                <InputError message={errors.title} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label>Make</Label>
                    <Select value={data.make_id ? String(data.make_id) : undefined} onValueChange={(v) => { setData('make_id', v); setData('model_id', ''); }}>
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
                    <InputError message={errors.make_id} />
                </div>
                <div className="grid gap-2">
                    <Label>Model</Label>
                    <Select value={data.model_id ? String(data.model_id) : undefined} onValueChange={(v) => setData('model_id', v)} disabled={!data.make_id}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredModels.map((m) => (
                                <SelectItem key={m.id} value={String(m.id)}>
                                    {m.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.model_id} />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="make_text">Make (free text)</Label>
                    <Input id="make_text" value={String(data.make_text || '')} onChange={(e) => setData('make_text', e.target.value)} placeholder="Used when make is not listed" />
                    <InputError message={errors.make_text} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="model_text">Model (free text)</Label>
                    <Input id="model_text" value={String(data.model_text || '')} onChange={(e) => setData('model_text', e.target.value)} />
                    <InputError message={errors.model_text} />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input id="year" type="number" value={String(data.year || '')} onChange={(e) => setData('year', e.target.value)} />
                    <InputError message={errors.year} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="price_amount">Price *</Label>
                    <Input id="price_amount" type="number" min="0" value={String(data.price_amount || '')} onChange={(e) => setData('price_amount', e.target.value)} />
                    <InputError message={errors.price_amount} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Input id="currency" value={String(data.currency || '')} onChange={(e) => setData('currency', e.target.value.toUpperCase())} placeholder="USD" maxLength={3} />
                    <InputError message={errors.currency} />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="mileage">Mileage</Label>
                    <Input id="mileage" type="number" min="0" value={String(data.mileage || '')} onChange={(e) => setData('mileage', e.target.value)} />
                    <InputError message={errors.mileage} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" value={String(data.location || '')} onChange={(e) => setData('location', e.target.value)} placeholder="Yangon" />
                    <InputError message={errors.location} />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                    <Label>Transmission</Label>
                    <Select value={data.transmission ? String(data.transmission) : undefined} onValueChange={(v) => setData('transmission', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {transmissions.map((t) => (
                                <SelectItem key={t} value={t}>
                                    {capitalizeFirst(t)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.transmission} />
                </div>
                <div className="grid gap-2">
                    <Label>Fuel type</Label>
                    <Select value={data.fuel_type ? String(data.fuel_type) : undefined} onValueChange={(v) => setData('fuel_type', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {fuels.map((f) => (
                                <SelectItem key={f} value={f}>
                                    {capitalizeFirst(f)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.fuel_type} />
                </div>
                <div className="grid gap-2">
                    <Label>Condition *</Label>
                    <Select value={String(data.condition || 'used')} onValueChange={(v) => setData('condition', v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {conditions.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {capitalizeFirst(c)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.condition} />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="body_type">Body type</Label>
                    <Input id="body_type" value={String(data.body_type || '')} onChange={(e) => setData('body_type', e.target.value)} placeholder="SUV" />
                    <InputError message={errors.body_type} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" value={String(data.color || '')} onChange={(e) => setData('color', e.target.value)} />
                    <InputError message={errors.color} />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={String(data.description || '')} onChange={(e) => setData('description', e.target.value)} rows={4} />
                <InputError message={errors.description} />
            </div>
        </>
    );
}

export default function CarsCreate({ makes, models, categories, showrooms, conditions, transmissions, fuels }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Cars', href: '/cars' },
        { title: 'Create', href: '/cars/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        showroom_id: '',
        category_id: '',
        make_id: '',
        model_id: '',
        make_text: '',
        model_text: '',
        title: '',
        year: '',
        price_amount: '',
        currency: 'USD',
        mileage: '',
        transmission: '',
        fuel_type: '',
        body_type: '',
        color: '',
        location: '',
        description: '',
        condition: 'used',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('cars.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Car" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="my-4 text-2xl font-bold">List a Car</h1>
                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Car Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <CarFormFields
                                data={data}
                                setData={setData}
                                errors={errors}
                                makes={makes}
                                models={models}
                                categories={categories}
                                showrooms={showrooms}
                                conditions={conditions}
                                transmissions={transmissions}
                                fuels={fuels}
                                showListingAs
                            />
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            List Car
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
