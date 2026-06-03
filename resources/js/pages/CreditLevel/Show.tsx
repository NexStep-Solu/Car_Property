import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface CreditLevel {
    id: number;
    name: string;
    description: string | null;
    min_amount: number;
    max_amount: number;
    max_term: number | null;
    interest_rate: number | null;
    is_default: boolean;
}

interface Props {
    creditLevel: CreditLevel;
}

function Info({ label, value }: { label: string; value?: string | number | boolean | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value?.toString() || '-'}</p>
        </div>
    );
}

export default function CreditLevelsShow({ creditLevel }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Credit Levels', href: '/credit-level' },
        { title: creditLevel.name, href: `/credit-level/${creditLevel.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Credit Level: ${creditLevel.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{creditLevel.name}</h1>
                        <p className="text-muted-foreground text-sm">Credit Level Details</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('creditlevels.edit', creditLevel.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('creditlevel.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Credit Level Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="ID" value={creditLevel.id} />
                        <Info label="Name" value={creditLevel.name} />
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground text-sm">Description</p>
                            <p className="font-medium">{creditLevel.description || '-'}</p>
                        </div>
                        <Info label="Minimum Amount" value={`$${creditLevel.min_amount}`} />
                        <Info label="Maximum Amount" value={`$${creditLevel.max_amount}`} />
                        <Info label="Maximum Term" value={creditLevel.max_term ? `${creditLevel.max_term} months` : null} />
                        <Info label="Interest Rate" value={creditLevel.interest_rate ? `${creditLevel.interest_rate}%` : null} />
                        <div>
                            <p className="text-muted-foreground text-sm">Default Level</p>
                            <Badge variant={creditLevel.is_default ? 'default' : 'secondary'}>{creditLevel.is_default ? 'Yes' : 'No'}</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
