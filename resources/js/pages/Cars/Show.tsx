import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Flag, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Image {
    id: number;
    storage_key: string;
    public_url: string | null;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
}

interface HistoryEntry {
    id: number;
    from_status: string | null;
    to_status: string;
    reason: string | null;
    created_at: string;
    changer?: { id: number; name: string } | null;
}

interface Car {
    id: number;
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
    status: string;
    is_featured: boolean;
    views_count: number;
    published_at: string | null;
    sold_at: string | null;
    review_reason: string | null;
    make?: { id: number; name: string } | null;
    model?: { id: number; name: string } | null;
    category?: { id: number; name: string } | null;
    showroom?: { id: number; business_name: string } | null;
    seller?: { id: number; name: string } | null;
    reviewer?: { id: number; name: string } | null;
    images: Image[];
    status_history: HistoryEntry[];
}

interface Props {
    car: Car;
    canManage: boolean;
    canReview: boolean;
    statuses: string[];
    reportReasons: string[];
}

function formatPrice(amount: number, currency: string): string {
    return `${Number(amount).toLocaleString()} ${currency}`;
}

export default function CarsShow({ car, canManage, canReview, statuses, reportReasons }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Cars', href: '/cars' },
        { title: car.title, href: `/cars/${car.id}` },
    ];

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);

    const statusForm = useForm({ status: '', reason: '' });
    const uploadForm = useForm({ image: null as File | null, alt_text: '' });
    const reportForm = useForm({ target_type: 'car', target_id: car.id, reason: '', description: '' });

    const submitStatus = (e: React.FormEvent) => {
        e.preventDefault();
        statusForm.post(route('cars.status', car.id), {
            preserveScroll: true,
            onSuccess: () => {
                statusForm.reset();
                toast.success('Status updated.');
            },
            onError: () => toast.error('Could not update status.'),
        });
    };

    const submitUpload = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post(route('cars.images.store', car.id), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setIsUploadOpen(false);
                uploadForm.reset();
                toast.success('Image uploaded.');
            },
            onError: () => toast.error('Upload failed.'),
        });
    };

    const deleteImage = (imageId: number) => {
        router.delete(route('cars.images.destroy', [car.id, imageId]), {
            preserveScroll: true,
            onSuccess: () => toast.success('Image deleted.'),
            onError: () => toast.error('Could not delete image.'),
        });
    };

    const setPrimary = (imageId: number) => {
        router.post(
            route('cars.images.primary', [car.id, imageId]),
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Primary image updated.'),
                onError: () => toast.error('Could not update primary image.'),
            },
        );
    };

    const deleteCar = () => {
        if (!confirm(`Delete "${car.title}"? This cannot be undone.`)) return;
        router.delete(route('cars.destroy', car.id), {
            onSuccess: () => toast.success('Car deleted.'),
            onError: () => toast.error('Could not delete car.'),
        });
    };

    const submitReport = (e: React.FormEvent) => {
        e.preventDefault();
        reportForm.post(route('reports.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsReportOpen(false);
                reportForm.reset();
                toast.success('Report submitted. Thank you.');
            },
            onError: () => toast.error('Could not submit report.'),
        });
    };

    const ownerLabel = car.showroom ? `Showroom: ${car.showroom.business_name}` : car.seller ? `Seller: ${car.seller.name}` : '-';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={car.title} />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold">
                            {car.title}
                            {car.is_featured && <Badge variant="secondary">Featured</Badge>}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {car.year} · {formatPrice(car.price_amount, car.currency)} · {car.location}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {canManage && (
                            <Link href={route('cars.edit', car.id)}>
                                <Button variant="outline" className="gap-2">
                                    <Pencil className="h-4 w-4" /> Edit
                                </Button>
                            </Link>
                        )}
                        {canManage && (
                            <Button variant="destructive" className="gap-2" onClick={deleteCar}>
                                <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                        )}
                        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Flag className="h-4 w-4" /> Report
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Report this listing</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submitReport} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Reason *</Label>
                                        <Select value={reportForm.data.reason || undefined} onValueChange={(v) => reportForm.setData('reason', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select reason" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {reportReasons.map((r) => (
                                                    <SelectItem key={r} value={r}>
                                                        {capitalizeFirst(r.replace(/_/g, ' '))}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={reportForm.errors.reason} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="report-description">Details</Label>
                                        <Textarea
                                            id="report-description"
                                            value={reportForm.data.description}
                                            onChange={(e) => reportForm.setData('description', e.target.value)}
                                            rows={3}
                                        />
                                        <InputError message={reportForm.errors.description} />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={reportForm.processing}>
                                            Submit Report
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Button variant="secondary" onClick={() => router.visit(route('cars.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                        <div>
                            <p className="text-muted-foreground">Status</p>
                            <Badge variant="outline">{capitalizeFirst(car.status.replace(/_/g, ' '))}</Badge>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Condition</p>
                            <p className="font-medium">{capitalizeFirst(car.condition)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Listed by</p>
                            <p className="font-medium">{ownerLabel}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Make / Model</p>
                            <p className="font-medium">{[car.make?.name, car.model?.name].filter(Boolean).join(' ') || '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Category</p>
                            <p className="font-medium">{car.category?.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Transmission / Fuel</p>
                            <p className="font-medium">
                                {[car.transmission, car.fuel_type].filter(Boolean).join(' · ') || '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Mileage</p>
                            <p className="font-medium">{car.mileage != null ? `${Number(car.mileage).toLocaleString()} km` : '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Body / Color</p>
                            <p className="font-medium">{[car.body_type, car.color].filter(Boolean).join(' · ') || '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Views</p>
                            <p className="font-medium">{Number(car.views_count).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Published</p>
                            <p className="font-medium">{car.published_at ? new Date(car.published_at).toLocaleDateString() : '-'}</p>
                        </div>
                        {car.description && (
                            <div className="md:col-span-3">
                                <p className="text-muted-foreground">Description</p>
                                <p className="font-medium whitespace-pre-line">{car.description}</p>
                            </div>
                        )}
                        {car.review_reason && (
                            <div className="md:col-span-3">
                                <p className="text-muted-foreground">Review note</p>
                                <p className="font-medium">{car.review_reason}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {(canManage || canReview) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitStatus} className="space-y-4">
                                <div className="flex flex-wrap items-end gap-4">
                                    <div className="grid gap-2">
                                        <Label>New status</Label>
                                        <Select value={statusForm.data.status || undefined} onValueChange={(v) => statusForm.setData('status', v)}>
                                            <SelectTrigger className="w-[220px]">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statuses.map((s) => (
                                                    <SelectItem key={s} value={s}>
                                                        {capitalizeFirst(s.replace(/_/g, ' '))}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={statusForm.errors.status} />
                                    </div>
                                    <Button type="submit" disabled={statusForm.processing}>
                                        Update
                                    </Button>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Reason (optional)</Label>
                                    <Input
                                        value={statusForm.data.reason}
                                        onChange={(e) => statusForm.setData('reason', e.target.value)}
                                        placeholder="Reason for this change"
                                    />
                                    <InputError message={statusForm.errors.reason} />
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Images ({car.images.length})</CardTitle>
                        {canManage && (
                            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" /> Upload
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Upload Image</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={submitUpload} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="car-image">Image (JPG/PNG/WebP, max 10MB)</Label>
                                            <Input id="car-image" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => uploadForm.setData('image', e.target.files?.[0] || null)} />
                                            <InputError message={uploadForm.errors.image} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="alt-text">Alt text</Label>
                                            <Input id="alt-text" value={uploadForm.data.alt_text} onChange={(e) => uploadForm.setData('alt_text', e.target.value)} />
                                            <InputError message={uploadForm.errors.alt_text} />
                                        </div>
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={uploadForm.processing}>
                                                Upload
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </CardHeader>
                    <CardContent>
                        {car.images.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                {car.images.map((image) => (
                                    <div key={image.id} className="relative overflow-hidden rounded-lg border">
                                        <div className="bg-muted flex aspect-[4/3] items-center justify-center text-xs">
                                            {image.alt_text || image.storage_key.split('/').pop()}
                                        </div>
                                        {image.is_primary && (
                                            <Badge variant="secondary" className="absolute top-2 left-2">
                                                Primary
                                            </Badge>
                                        )}
                                        {canManage && (
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                {!image.is_primary && (
                                                    <Button variant="secondary" size="icon" onClick={() => setPrimary(image.id)} title="Set primary">
                                                        <Star className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button variant="secondary" size="icon" onClick={() => deleteImage(image.id)} title="Delete image">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground py-4 text-center text-sm">No images yet.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>By</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {car.status_history.map((h) => (
                                    <TableRow key={h.id}>
                                        <TableCell>{h.from_status ? capitalizeFirst(h.from_status.replace(/_/g, ' ')) : '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{capitalizeFirst(h.to_status.replace(/_/g, ' '))}</Badge>
                                        </TableCell>
                                        <TableCell>{h.changer?.name || '-'}</TableCell>
                                        <TableCell>{h.reason || '-'}</TableCell>
                                        <TableCell>{new Date(h.created_at).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                {car.status_history.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-muted-foreground py-4 text-center text-sm">
                                            No history yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
