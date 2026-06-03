import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface Currency {
    id: number;
    name: string;
    code: string;
    symbol: string;
    rate: number;
}

interface Props {
    currency: Currency;
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function CurrenciesShow({ currency }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Currencies', href: '/currencies' },
        { title: currency.name, href: `/currencies/${currency.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Currency: ${currency.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{currency.name}</h1>
                        <p className="text-muted-foreground text-sm">
                            {currency.code} ({currency.symbol})
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('currencies.edit', currency.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('currencies.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Currency Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="ID" value={currency.id} />
                        <Info label="Name" value={currency.name} />
                        <Info label="Code" value={currency.code} />
                        <Info label="Symbol" value={currency.symbol} />
                        <div>
                            <p className="text-muted-foreground text-sm">Exchange Rate</p>
                            <Badge variant="secondary">{currency.rate}</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
