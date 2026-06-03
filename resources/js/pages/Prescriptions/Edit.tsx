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
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

interface Patient {
    patient_id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
}

interface Medicine {
    id: number;
    name: string;
    stock: number;
}

interface PrescriptionItem {
    id?: number;
    medicine_id: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: string;
    instructions: string;
}

interface Prescription {
    id: number;
    patient_id: number;
    doctor_id: number;
    prescription_date: string;
    diagnosis: string | null;
    notes: string | null;
    status: string;
    items: PrescriptionItem[];
}

interface Props {
    prescription: Prescription;
    patients: Patient[];
    doctors: User[];
    medicines: Medicine[];
}

export default function PrescriptionsEdit({ prescription, patients, doctors, medicines }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Prescriptions', href: '/prescriptions' },
        { title: 'Edit', href: `/prescriptions/${prescription.id}/edit` },
    ];

    const [items, setItems] = useState<PrescriptionItem[]>(
        prescription.items.length > 0
            ? prescription.items.map((item) => ({
                  id: item.id,
                  medicine_id: String(item.medicine_id),
                  dosage: item.dosage,
                  frequency: item.frequency,
                  duration: item.duration,
                  quantity: String(item.quantity),
                  instructions: item.instructions || '',
              }))
            : [{ medicine_id: '', dosage: '', frequency: '', duration: '', quantity: '1', instructions: '' }],
    );

    const { data, setData, put, processing, errors, transform } = useForm({
        patient_id: String(prescription.patient_id),
        doctor_id: String(prescription.doctor_id),
        prescription_date: prescription.prescription_date,
        diagnosis: prescription.diagnosis || '',
        notes: prescription.notes || '',
        status: prescription.status,
        items: [] as { medicine_id: number; dosage: string; frequency: string; duration: string; quantity: number; instructions: string }[],
    });

    transform((values) => ({
        ...values,
        items: items.map((item) => ({
            medicine_id: Number(item.medicine_id),
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: Number(item.quantity),
            instructions: item.instructions,
        })),
    }));

    const addItem = () => {
        setItems([...items, { medicine_id: '', dosage: '', frequency: '', duration: '', quantity: '1', instructions: '' }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, idx: number) => idx !== index));
    };

    const updateItem = (index: number, field: keyof PrescriptionItem, value: string) => {
        const newItems = [...items];
        (newItems[index] as unknown as Record<string, string>)[field] = value;
        setItems(newItems);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('prescriptions.update', prescription.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Prescription updated successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error updating prescription', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Prescription" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Edit Prescription</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Prescription Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="patient_id">Patient *</Label>
                                <Select value={data.patient_id} onValueChange={(value) => setData('patient_id', value)} disabled={processing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map((patient) => (
                                            <SelectItem key={patient.patient_id} value={String(patient.patient_id)}>
                                                {patient.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.patient_id} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="doctor_id">Doctor *</Label>
                                <Select value={data.doctor_id} onValueChange={(value) => setData('doctor_id', value)} disabled={processing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map((doctor) => (
                                            <SelectItem key={doctor.id} value={String(doctor.id)}>
                                                {doctor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.doctor_id} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="prescription_date">Prescription Date *</Label>
                                    <Input
                                        id="prescription_date"
                                        type="date"
                                        required
                                        value={data.prescription_date}
                                        onChange={(e) => setData('prescription_date', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.prescription_date} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)} disabled={processing}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="diagnosis">Diagnosis</Label>
                                <Input
                                    id="diagnosis"
                                    type="text"
                                    value={data.diagnosis}
                                    onChange={(e) => setData('diagnosis', e.target.value)}
                                    disabled={processing}
                                    placeholder="Enter diagnosis"
                                />
                                <InputError message={errors.diagnosis} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    disabled={processing}
                                    placeholder="Prescription notes..."
                                    rows={4}
                                />
                                <InputError message={errors.notes} className="mt-1" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Prescription Items</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={processing}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InputError message={errors.items} className="mt-1" />
                            {items.map((item, index) => (
                                <div key={index} className="grid gap-4 rounded-lg border p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Item {index + 1}</span>
                                        {items.length > 1 && (
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} disabled={processing}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Medicine *</Label>
                                        <Select
                                            value={item.medicine_id}
                                            onValueChange={(value) => updateItem(index, 'medicine_id', value)}
                                            disabled={processing}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select medicine" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {medicines.map((medicine) => (
                                                    <SelectItem key={medicine.id} value={String(medicine.id)}>
                                                        {medicine.name} ({medicine.stock} in stock)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={(errors as Record<string, string>)[`items.${index}.medicine_id`]} className="mt-1" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label>Dosage *</Label>
                                            <Input
                                                type="text"
                                                value={item.dosage}
                                                onChange={(e) => updateItem(index, 'dosage', e.target.value)}
                                                placeholder="e.g., 500mg"
                                                disabled={processing}
                                            />
                                            <InputError message={(errors as Record<string, string>)[`items.${index}.dosage`]} className="mt-1" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Frequency *</Label>
                                            <Input
                                                type="text"
                                                value={item.frequency}
                                                onChange={(e) => updateItem(index, 'frequency', e.target.value)}
                                                placeholder="e.g., 3 times daily"
                                                disabled={processing}
                                            />
                                            <InputError message={(errors as Record<string, string>)[`items.${index}.frequency`]} className="mt-1" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Duration *</Label>
                                            <Input
                                                type="text"
                                                value={item.duration}
                                                onChange={(e) => updateItem(index, 'duration', e.target.value)}
                                                placeholder="e.g., 7 days"
                                                disabled={processing}
                                            />
                                            <InputError message={(errors as Record<string, string>)[`items.${index}.duration`]} className="mt-1" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label>Quantity *</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                disabled={processing}
                                            />
                                            <InputError message={(errors as Record<string, string>)[`items.${index}.quantity`]} className="mt-1" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Instructions</Label>
                                            <Input
                                                type="text"
                                                value={item.instructions}
                                                onChange={(e) => updateItem(index, 'instructions', e.target.value)}
                                                placeholder="e.g., Take after meals"
                                                disabled={processing}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('prescriptions.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Prescription
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
