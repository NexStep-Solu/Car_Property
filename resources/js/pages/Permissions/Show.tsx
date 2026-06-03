import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface Permission {
    id: number;
    name: string;
}

interface Props {
    permission: Permission;
}

function Info({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function PermissionsShow({ permission }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Permissions', href: '/permissions' },
        { title: permission.name, href: `/permissions/${permission.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Permission: ${permission.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{permission.name}</h1>
                        <p className="text-muted-foreground text-sm">Permission Details</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('permissions.edit', permission.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('permissions.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Permission Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="ID" value={permission.id.toString()} />
                        <Info label="Name" value={permission.name} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
