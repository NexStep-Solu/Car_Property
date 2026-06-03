import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface Service {
    id: number;
    name: string;
    code: string;
    description: string | null;
    category: string | null;
    price: number;
    duration_minutes: number | null;
    department: { name: string };
    status: string;
}

interface Props {
    service: Service;
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function ServicesShow({ service }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Services', href: '/services' },
        { title: service.name, href: `/services/${service.id}` },
    ];

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Service: ${service.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{service.name}</h1>
                        <p className="text-muted-foreground text-sm">Code: {service.code}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('services.edit', service.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('services.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Badge className={getStatusColor(service.status)}>{service.status}</Badge>

                <Card>
                    <CardHeader>
                        <CardTitle>Service Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="Service Code" value={service.code} />
                        <Info label="Department" value={service.department?.name} />
                        <Info label="Category" value={service.category} />
                        <Info label="Price" value={formatCurrency(service.price)} />
                        <Info label="Duration" value={service.duration_minutes ? `${service.duration_minutes} minutes` : null} />
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground text-sm">Description</p>
                            <p className="font-medium">{service.description || '-'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
