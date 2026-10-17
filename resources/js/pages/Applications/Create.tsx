import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface ShowroomOption {
    id: number;
    business_name: string;
    slug: string;
}

interface Props {
    showrooms: ShowroomOption[];
    preselectedShowroomId: number | null;
}

export default function ApplicationsCreate({ showrooms, preselectedShowroomId }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Applications', href: '/applications' },
        { title: 'Create', href: '/applications/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        showroom_id: preselectedShowroomId ? String(preselectedShowroomId) : '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('applications.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Application" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="my-4 text-2xl font-bold">New Verification Application</h1>
                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Showroom</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Showroom *</Label>
                                <Select value={data.showroom_id} onValueChange={(v) => setData('showroom_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a showroom" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {showrooms.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.business_name} ({s.slug})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.showroom_id} />
                            </div>
                            <p className="text-muted-foreground text-sm">
                                A draft application is created. Upload the required documents on the next screen, then submit it for review.
                            </p>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create Draft
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
