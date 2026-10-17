import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Setting {
    id: number;
    key: string;
    value: string | null;
    group: string;
    type: string;
}

interface Props {
    settings: Setting[];
    groups: string[];
    types: string[];
}

function ValueEditor({ setting }: { setting: Setting }) {
    const { data, setData, put, processing, errors } = useForm({
        value: setting.type === 'bool' ? setting.value === '1' : (setting.value ?? ''),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.settings.update', setting.id), {
            preserveScroll: true,
            onSuccess: () => toast.success(`Saved ${setting.key}.`),
            onError: () => toast.error('Could not save setting.'),
        });
    };

    return (
        <form onSubmit={submit} className="flex items-center gap-2">
            {setting.type === 'bool' ? (
                <Checkbox checked={data.value === true} onClick={() => setData('value', !(data.value === true))} />
            ) : setting.type === 'json' ? (
                <Textarea
                    value={String(data.value ?? '')}
                    onChange={(e) => setData('value', e.target.value)}
                    rows={2}
                    className="min-w-[220px] font-mono text-xs"
                />
            ) : (
                <Input
                    type={setting.type === 'int' ? 'number' : 'text'}
                    value={data.value === true ? '1' : data.value === false ? '0' : String(data.value ?? '')}
                    onChange={(e) => setData('value', e.target.value)}
                    className="min-w-[200px]"
                />
            )}
            <Button type="submit" size="sm" disabled={processing}>
                Save
            </Button>
            <InputError message={errors.value} />
        </form>
    );
}

export default function SystemSettingsIndex({ settings, groups, types }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'System Settings', href: '/admin/settings' }];

    const [isAddOpen, setIsAddOpen] = useState(false);
    const addForm = useForm({ key: '', value: '', group: 'general', type: 'string' });

    const grouped = groups
        .map((group) => ({ group, items: settings.filter((s) => s.group === group) }))
        .filter((g) => g.items.length > 0);

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('admin.settings.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddOpen(false);
                addForm.reset();
                toast.success('Setting created.');
            },
            onError: () => toast.error('Could not create setting.'),
        });
    };

    const deleteSetting = (setting: Setting) => {
        if (!confirm(`Delete setting "${setting.key}"?`)) return;
        router.delete(route('admin.settings.destroy', setting.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Setting deleted.'),
            onError: () => toast.error('Could not delete setting.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />
            <div className="space-y-6 p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">System Settings</h1>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> Add Setting
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Setting</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submitAdd} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="key">Key * (lowercase, dots allowed)</Label>
                                    <Input id="key" value={addForm.data.key} onChange={(e) => addForm.setData('key', e.target.value)} placeholder="general.site_name" />
                                    <InputError message={addForm.errors.key} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Group</Label>
                                        <Select value={addForm.data.group} onValueChange={(v) => addForm.setData('group', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {groups.map((g) => (
                                                    <SelectItem key={g} value={g}>
                                                        {g}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={addForm.errors.group} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Type</Label>
                                        <Select value={addForm.data.type} onValueChange={(v) => addForm.setData('type', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {types.map((t) => (
                                                    <SelectItem key={t} value={t}>
                                                        {t}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={addForm.errors.type} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="value">Value</Label>
                                    <Input id="value" value={addForm.data.value} onChange={(e) => addForm.setData('value', e.target.value)} />
                                    <InputError message={addForm.errors.value} />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={addForm.processing}>
                                        Create Setting
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {grouped.map(({ group, items }) => (
                    <Card key={group}>
                        <CardHeader>
                            <CardTitle className="capitalize">{group}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Key</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((setting) => (
                                        <TableRow key={setting.id}>
                                            <TableCell className="font-mono text-sm font-medium">{setting.key}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{setting.type}</TableCell>
                                            <TableCell>
                                                <ValueEditor setting={setting} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="icon" onClick={() => deleteSetting(setting)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}
                {grouped.length === 0 && (
                    <Card>
                        <CardContent>
                            <p className="text-muted-foreground py-6 text-center text-sm">No settings yet.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
