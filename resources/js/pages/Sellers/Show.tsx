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
import { Head, router, useForm } from '@inertiajs/react';
import { Download, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Person {
    id: number;
    name: string;
}

interface Document {
    id: number;
    document_type: string;
    original_filename: string;
    mime_type: string;
    file_size_bytes: number;
    document_status: string;
    review_note: string | null;
    reviewer?: Person | null;
}

interface Application {
    id: number;
    uuid: string;
    seller_type: string;
    full_name: string;
    phone: string;
    email: string | null;
    address: string | null;
    status: string;
    submitted_at: string | null;
    reviewed_at: string | null;
    review_reason: string | null;
    reviewer?: Person | null;
    documents: Document[];
}

interface Props {
    application: Application;
    canManage: boolean;
    canReview: boolean;
    canDelete: boolean;
    statuses: string[];
    documentTypes: string[];
    documentStatuses: string[];
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SellersShow({ application, canManage, canReview, canDelete, statuses, documentTypes }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sellers', href: '/seller-applications' },
        { title: `#${application.id}`, href: `/seller-applications/${application.id}` },
    ];

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [reviewingDoc, setReviewingDoc] = useState<Document | null>(null);

    const uploadForm = useForm({ document_type: '', document: null as File | null });
    const reviewForm = useForm({ status: '', review_reason: '' });
    const docReviewForm = useForm({ document_status: '', review_note: '' });

    const isDraft = application.status === 'draft' || application.status === 'changes_requested';
    const isDecided = application.status === 'approved' || application.status === 'rejected';

    const submitApp = () => {
        router.post(route('seller-applications.submit', application.id), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Application submitted for review.'),
            onError: () => toast.error('Could not submit application.'),
        });
    };

    const deleteApp = () => {
        if (!confirm(`Delete application #${application.id}? This cannot be undone.`)) return;
        router.delete(route('seller-applications.destroy', application.id), {
            onSuccess: () => toast.success('Application deleted.'),
            onError: () => toast.error('Could not delete application.'),
        });
    };

    const submitReview = (e: React.FormEvent) => {
        e.preventDefault();
        reviewForm.post(route('seller-applications.review', application.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Review recorded.'),
            onError: () => toast.error('Could not record review.'),
        });
    };

    const submitUpload = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post(route('seller-applications.documents.store', application.id), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setIsUploadOpen(false);
                uploadForm.reset();
                toast.success('Document uploaded.');
            },
            onError: () => toast.error('Upload failed.'),
        });
    };

    const deleteDoc = (doc: Document) => {
        router.delete(route('seller-applications.documents.destroy', [application.id, doc.id]), {
            preserveScroll: true,
            onSuccess: () => toast.success('Document deleted.'),
            onError: () => toast.error('Could not delete document.'),
        });
    };

    const openDocReview = (doc: Document) => {
        setReviewingDoc(doc);
        docReviewForm.setData({ document_status: '', review_note: doc.review_note || '' });
    };

    const submitDocReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewingDoc) return;
        docReviewForm.post(route('seller-applications.documents.review', [application.id, reviewingDoc.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setReviewingDoc(null);
                toast.success('Document review recorded.');
            },
            onError: () => toast.error('Could not record review.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Seller Application #${application.id}`} />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{application.full_name}</h1>
                        <p className="text-muted-foreground text-sm">
                            {capitalizeFirst(application.seller_type)} seller · {application.phone}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {canManage && isDraft && <Button onClick={submitApp}>Submit for Review</Button>}
                        {canDelete && (
                            <Button variant="destructive" className="gap-2" onClick={deleteApp}>
                                <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => router.visit(route('seller-applications.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Application Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                            <p className="text-muted-foreground">Status</p>
                            <Badge variant="outline">{capitalizeFirst(application.status.replace(/_/g, ' '))}</Badge>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Email</p>
                            <p className="font-medium">{application.email || '-'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground">Address</p>
                            <p className="font-medium">{application.address || '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Submitted at</p>
                            <p className="font-medium">{application.submitted_at ? new Date(application.submitted_at).toLocaleString() : '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Reviewer</p>
                            <p className="font-medium">{application.reviewer?.name || '-'}</p>
                        </div>
                        {application.review_reason && (
                            <div className="md:col-span-2">
                                <p className="text-muted-foreground">Review reason</p>
                                <p className="font-medium">{application.review_reason}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {canReview && !isDecided && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Reviewer Decision</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitReview} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Decision</Label>
                                    <Select value={reviewForm.data.status || undefined} onValueChange={(v) => reviewForm.setData('status', v)}>
                                        <SelectTrigger className="w-[240px]">
                                            <SelectValue placeholder="Select decision" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses
                                                .filter((s) => ['approved', 'rejected', 'changes_requested', 'suspended'].includes(s))
                                                .map((s) => (
                                                    <SelectItem key={s} value={s}>
                                                        {capitalizeFirst(s.replace(/_/g, ' '))}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={reviewForm.errors.status} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Reason (required unless approving)</Label>
                                    <Textarea value={reviewForm.data.review_reason} onChange={(e) => reviewForm.setData('review_reason', e.target.value)} rows={3} />
                                    <InputError message={reviewForm.errors.review_reason} />
                                </div>
                                <Button type="submit" disabled={reviewForm.processing}>
                                    Record Decision
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Identity Documents</CardTitle>
                        {canManage && !isDecided && (
                            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" /> Upload
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Upload ID Document</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={submitUpload} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label>Document type</Label>
                                            <Select value={uploadForm.data.document_type || undefined} onValueChange={(v) => uploadForm.setData('document_type', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {documentTypes.map((t) => (
                                                        <SelectItem key={t} value={t}>
                                                            {capitalizeFirst(t.replace(/_/g, ' '))}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={uploadForm.errors.document_type} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="id-file">File (PDF/JPG/PNG/WebP, max 10MB)</Label>
                                            <Input id="id-file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => uploadForm.setData('document', e.target.files?.[0] || null)} />
                                            <InputError message={uploadForm.errors.document} />
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>File</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {application.documents.map((doc: Document) => (
                                    <TableRow key={doc.id}>
                                        <TableCell>{capitalizeFirst(doc.document_type.replace(/_/g, ' '))}</TableCell>
                                        <TableCell className="font-medium">{doc.original_filename}</TableCell>
                                        <TableCell>{formatBytes(doc.file_size_bytes)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{capitalizeFirst(doc.document_status.replace(/_/g, ' '))}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <a href={route('seller-applications.documents.download', [application.id, doc.id])}>
                                                    <Button variant="outline" size="icon">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </a>
                                                {canReview && !isDecided && (
                                                    <Button variant="outline" size="sm" onClick={() => openDocReview(doc)}>
                                                        Review
                                                    </Button>
                                                )}
                                                {canManage && doc.document_status === 'uploaded' && (
                                                    <Button variant="outline" size="icon" onClick={() => deleteDoc(doc)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {application.documents.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-muted-foreground py-6 text-center text-sm">
                                            No documents uploaded yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={reviewingDoc !== null} onOpenChange={(open) => !open && setReviewingDoc(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Review Document</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitDocReview} className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Decision</Label>
                                <Select value={docReviewForm.data.document_status || undefined} onValueChange={(v) => docReviewForm.setData('document_status', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select decision" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="replacement_requested">Replacement requested</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={docReviewForm.errors.document_status} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Note</Label>
                                <Textarea value={docReviewForm.data.review_note} onChange={(e) => docReviewForm.setData('review_note', e.target.value)} rows={3} />
                                <InputError message={docReviewForm.errors.review_note} />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={docReviewForm.processing}>
                                    Save Review
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
