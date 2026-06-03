import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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

export default function SuppliersCreate() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Suppliers', href: '/suppliers' },
        { title: 'Create', href: '/suppliers/create' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('suppliers.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Supplier created successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
                reset();
            },
            onError: () => {
                toast.error('Error creating supplier', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Supplier" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Create New Supplier</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Supplier Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        placeholder="Enter supplier name"
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="contact_person">Contact Person</Label>
                                    <Input
                                        id="contact_person"
                                        type="text"
                                        value={data.contact_person}
                                        onChange={(e) => setData('contact_person', e.target.value)}
                                        disabled={processing}
                                        placeholder="Contact person name"
                                    />
                                    <InputError message={errors.contact_person} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        disabled={processing}
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={errors.email} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        disabled={processing}
                                        placeholder="Phone number"
                                    />
                                    <InputError message={errors.phone} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="mobile">Mobile</Label>
                                    <Input
                                        id="mobile"
                                        type="text"
                                        value={data.mobile}
                                        onChange={(e) => setData('mobile', e.target.value)}
                                        disabled={processing}
                                        placeholder="Mobile number"
                                    />
                                    <InputError message={errors.mobile} className="mt-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Address Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    disabled={processing}
                                    placeholder="Street address"
                                    rows={2}
                                />
                                <InputError message={errors.address} className="mt-1" />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        disabled={processing}
                                        placeholder="City"
                                    />
                                    <InputError message={errors.city} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        type="text"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        disabled={processing}
                                        placeholder="State"
                                    />
                                    <InputError message={errors.state} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        type="text"
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        disabled={processing}
                                        placeholder="Country"
                                    />
                                    <InputError message={errors.country} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="postal_code">Postal Code</Label>
                                    <Input
                                        id="postal_code"
                                        type="text"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        disabled={processing}
                                        placeholder="Postal code"
                                    />
                                    <InputError message={errors.postal_code} className="mt-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tax & License Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="tax_id">Tax ID</Label>
                                    <Input
                                        id="tax_id"
                                        type="text"
                                        value={data.tax_id}
                                        onChange={(e) => setData('tax_id', e.target.value)}
                                        disabled={processing}
                                        placeholder="Tax identification number"
                                    />
                                    <InputError message={errors.tax_id} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="license_number">License Number</Label>
                                    <Input
                                        id="license_number"
                                        type="text"
                                        value={data.license_number}
                                        onChange={(e) => setData('license_number', e.target.value)}
                                        disabled={processing}
                                        placeholder="Business license number"
                                    />
                                    <InputError message={errors.license_number} className="mt-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Terms</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="credit_limit">Credit Limit</Label>
                                    <Input
                                        id="credit_limit"
                                        type="number"
                                        step="0.01"
                                        value={data.credit_limit ?? ''}
                                        onChange={(e) => setData('credit_limit', e.target.value === '' ? '' : e.target.value)}
                                        disabled={processing}
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.credit_limit} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="payment_terms_days">Payment Terms (Days)</Label>
                                    <Input
                                        id="payment_terms_days"
                                        type="number"
                                        value={data.payment_terms_days}
                                        onChange={(e) => setData('payment_terms_days', parseInt(e.target.value) || 30)}
                                        disabled={processing}
                                        placeholder="30"
                                    />
                                    <InputError message={errors.payment_terms_days} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="rating">Rating</Label>
                                    <Select value={data.rating} onValueChange={(v) => setData('rating', v)} disabled={processing}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select rating" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A">A - Excellent</SelectItem>
                                            <SelectItem value="B">B - Good</SelectItem>
                                            <SelectItem value="C">C - Average</SelectItem>
                                            <SelectItem value="D">D - Poor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.rating} className="mt-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <Label>Active</Label>
                                    <p className="text-muted-foreground text-sm">Supplier is available for orders</p>
                                </div>
                                <Checkbox checked={data.is_active === '1'} onCheckedChange={(checked) => setData('is_active', checked ? '1' : '0')} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    disabled={processing}
                                    placeholder="Additional notes about this supplier"
                                    rows={3}
                                />
                                <InputError message={errors.notes} className="mt-1" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('suppliers.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create Supplier
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
