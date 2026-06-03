import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface OperationTheater {
    id: number;
    name: string;
    code: string;
    location: string | null;
    capacity: number;
    is_available: boolean;
    equipment: string | null;
}

interface Props {
    theaters: OperationTheater[];
}

export default function OperationTheatersIndex({ theaters }: Props) {
    const { hasPermission } = usePermission();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<OperationTheater | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        location: '',
        capacity: '1',
        equipment: '',
    });

    const openCreate = () => {
        setEditing(null);
        setFormData({ name: '', code: '', location: '', capacity: '1', equipment: '' });
        setIsModalOpen(true);
    };

    const openEdit = (theater: OperationTheater) => {
        setEditing(theater);
        setFormData({
            name: theater.name,
            code: theater.code,
            location: theater.location || '',
            capacity: theater.capacity.toString(),
            equipment: theater.equipment || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (editing) {
            router.put(route('operation-theaters.update', editing.id), formData);
        } else {
            router.post(route('operation-theaters.store'), formData);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure?')) {
            router.delete(route('operation-theaters.destroy', id));
        }
    };

    const toggleAvailability = (theater: OperationTheater) => {
        router.post(route('operation-theaters.toggle', theater.id));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Operation Theaters', href: '/operation-theaters' }]}>
            <Head title="Operation Theaters" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Operation Theaters</h1>
                        <p className="text-muted-foreground text-sm">Manage operation theaters</p>
                    </div>
                    {hasPermission('create_operation_theatres') && (
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Theater
                        </Button>
                    )}
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {theaters.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center">
                                            No theaters found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    theaters.map((theater) => (
                                        <TableRow key={theater.id}>
                                            <TableCell className="font-medium">{theater.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{theater.code}</Badge>
                                            </TableCell>
                                            <TableCell>{theater.location || '-'}</TableCell>
                                            <TableCell>{theater.capacity}</TableCell>
                                            <TableCell>
                                                <Badge variant={theater.is_available ? 'default' : 'secondary'}>
                                                    {theater.is_available ? 'Available' : 'Unavailable'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="icon" variant="outline" onClick={() => toggleAvailability(theater)}>
                                                        {theater.is_available ? (
                                                            <ToggleRight className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <ToggleLeft className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    {hasPermission('update_operation_theatres') && (
                                                        <Button size="icon" variant="outline" onClick={() => openEdit(theater)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('delete_operation_theatres') && (
                                                        <Button size="icon" variant="outline" onClick={() => handleDelete(theater.id)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit' : 'Add'} Operation Theater</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Name *</Label>
                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Code *</Label>
                            <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Location</Label>
                            <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Capacity</Label>
                            <Input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Equipment</Label>
                            <Textarea value={formData.equipment} onChange={(e) => setFormData({ ...formData, equipment: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
