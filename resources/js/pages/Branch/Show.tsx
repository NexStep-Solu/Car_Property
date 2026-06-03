import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface Location {
    id: number;
    name: string;
}

interface Branch {
    id: number;
    name: string;
    location_id: number;
    location: Location;
}

interface Props {
    branch: Branch;
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function BranchesShow({ branch }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Branches', href: '/branches' },
        { title: branch.name, href: `/branches/${branch.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Branch: ${branch.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{branch.name}</h1>
                        <p className="text-muted-foreground text-sm">Branch Details</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('branches.edit', branch.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('branches.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Branch Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="ID" value={branch.id} />
                        <Info label="Name" value={branch.name} />
                        <Info label="Location" value={branch.location?.name} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
