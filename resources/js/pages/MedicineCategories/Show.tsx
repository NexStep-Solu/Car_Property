import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface Medicine {
    id: number;
    name: string;
    code: string;
    sku: string | null;
    batch_number: string | null;
    is_active: boolean;
    quantity: number;
    unit_price: number | null;
}

interface MedicineCategory {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    medicines_count: number;
    medicines?: Medicine[];
}

interface Props {
    category: MedicineCategory;
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function MedicineCategoriesShow({ category }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pharmacy', href: '/pharmacy' },
        { title: 'Medicine Categories', href: '/medicine-categories' },
        { title: category.name, href: `/medicine-categories/${category.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Category: ${category.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{category.name}</h1>
                        <p className="text-muted-foreground font-mono">{category.code}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('medicine-categories.edit', category.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('medicine-categories.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <Info label="ID" value={category.id} />
                            <Info label="Code" value={category.code} />
                            <Info label="Name" value={category.name} />
                            <div>
                                <p className="text-muted-foreground text-sm">Status</p>
                                {category.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                            </div>
                            <Info label="Total Medicines" value={category.medicines_count} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{category.description || 'No description provided'}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Medicines ({category.medicines?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {category.medicines && category.medicines.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {category.medicines.map((medicine) => (
                                        <TableRow key={medicine.id}>
                                            <TableCell>{medicine.id}</TableCell>
                                            <TableCell className="font-mono">{medicine.code}</TableCell>
                                            <TableCell className="font-medium">{medicine.name}</TableCell>
                                            <TableCell>{medicine.sku || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={medicine.quantity > 0 ? 'default' : 'secondary'}>{medicine.quantity}</Badge>
                                            </TableCell>
                                            <TableCell>{medicine.unit_price ? `$${medicine.unit_price.toFixed(2)}` : '-'}</TableCell>
                                            <TableCell>
                                                {medicine.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground py-4 text-center text-sm">No medicines in this category</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
