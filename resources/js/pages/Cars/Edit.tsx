import { CarFormFields } from './Create';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface Car {
    id: number;
    category_id: number | null;
    make_id: number | null;
    model_id: number | null;
    make_text: string | null;
    model_text: string | null;
    title: string;
    year: number;
    price_amount: number;
    currency: string;
    mileage: number | null;
    transmission: string | null;
    fuel_type: string | null;
    body_type: string | null;
    color: string | null;
    location: string;
    description: string | null;
    condition: string;
}

interface Props {
    car: Car;
    makes: Array<{ id: number; name: string }>;
    models: Array<{ id: number; make_id: number; name: string }>;
    categories: Array<{ id: number; name: string }>;
    conditions: string[];
    transmissions: string[];
    fuels: string[];
}

export default function CarsEdit({ car, makes, models, categories, conditions, transmissions, fuels }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Cars', href: '/cars' },
        { title: 'Edit', href: `/cars/${car.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        category_id: car.category_id ? String(car.category_id) : '',
        make_id: car.make_id ? String(car.make_id) : '',
        model_id: car.model_id ? String(car.model_id) : '',
        make_text: car.make_text || '',
        model_text: car.model_text || '',
        title: car.title || '',
        year: String(car.year || ''),
        price_amount: String(car.price_amount || ''),
        currency: car.currency || 'USD',
        mileage: car.mileage != null ? String(car.mileage) : '',
        transmission: car.transmission || '',
        fuel_type: car.fuel_type || '',
        body_type: car.body_type || '',
        color: car.color || '',
        location: car.location || '',
        description: car.description || '',
        condition: car.condition || 'used',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('cars.update', car.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Car" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="my-4 text-2xl font-bold">Edit Car</h1>
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
                                showrooms={[]}
                                conditions={conditions}
                                transmissions={transmissions}
                                fuels={fuels}
                                showListingAs={false}
                            />
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Car
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
