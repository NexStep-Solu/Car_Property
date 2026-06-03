import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface Insurance {
    id: number;
    patient: { name: string };
    insurance_provider: string;
    policy_number: string;
    group_number: string | null;
    plan_name: string | null;
    coverage_start_date: string;
    coverage_end_date: string;
    coverage_percentage: number;
    max_coverage_amount: number;
    status: string;
}

interface Props {
    insurance: Insurance;
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

export default function InsurancesShow({ insurance }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Insurances', href: '/insurances' },
        { title: insurance.policy_number, href: `/insurances/${insurance.id}` },
    ];

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            expired: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Insurance: ${insurance.policy_number}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{insurance.insurance_provider}</h1>
                        <p className="text-muted-foreground text-sm">Policy: {insurance.policy_number}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('insurances.edit', insurance.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('insurances.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Badge className={getStatusColor(insurance.status)}>{insurance.status}</Badge>

                <Card>
                    <CardHeader>
                        <CardTitle>Insurance Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="Patient" value={insurance.patient?.name} />
                        <Info label="Insurance Provider" value={insurance.insurance_provider} />
                        <Info label="Policy Number" value={insurance.policy_number} />
                        <Info label="Group Number" value={insurance.group_number} />
                        <Info label="Plan Name" value={insurance.plan_name} />
                        <Info label="Coverage Percentage" value={`${insurance.coverage_percentage}%`} />
                        <Info label="Max Coverage Amount" value={formatCurrency(insurance.max_coverage_amount)} />
                        <Info label="Coverage Start Date" value={insurance.coverage_start_date} />
                        <Info label="Coverage End Date" value={insurance.coverage_end_date} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
