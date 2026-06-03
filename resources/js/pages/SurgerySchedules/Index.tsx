import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Pencil, Play, Plus, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Patient {
    id: number;
    patient_id: number;
    name: string;
}
interface OperationTheater {
    id: number;
    name: string;
    code: string;
}
interface Employee {
    id: number;
    user: { name: string };
}

interface SurgerySchedule {
    id: number;
    surgery_number: string;
    surgery_name: string;
    surgery_type: string;
    status: string;
    scheduled_date: string;
    scheduled_time: string;
    estimated_duration: number;
    patient: Patient;
    operation_theater: OperationTheater | null;
    surgeon: Employee | null;
}

interface Props {
    schedules: { data: SurgerySchedule[]; links: any[]; current_page: number; last_page: number; total: number };
    theaters: OperationTheater[];
    patients: Patient[];
    doctors: Employee[];
    filters: any;
}

const STATUS_COLORS: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    pre_op: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    postponed: 'bg-gray-100 text-gray-800',
};

const TYPE_COLORS: Record<string, string> = {
    major: 'bg-red-100 text-red-800',
    minor: 'bg-green-100 text-green-800',
    emergency: 'bg-orange-100 text-orange-800',
    elective: 'bg-blue-100 text-blue-800',
};

export default function SurgerySchedulesIndex({ schedules, theaters, patients, doctors, filters }: Props) {
    const { hasPermission } = usePermission();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<SurgerySchedule | null>(null);
    const [formData, setFormData] = useState({
        patient_id: '',
        operation_theater_id: '',
        surgeon_id: '',
        surgery_name: '',
        surgery_type: 'elective',
        scheduled_date: '',
        scheduled_time: '',
        estimated_duration: '60',
        pre_op_diagnosis: '',
        notes: '',
    });

    const openCreate = () => {
        setEditing(null);
        setFormData({
            patient_id: '',
            operation_theater_id: '',
            surgeon_id: '',
            surgery_name: '',
            surgery_type: 'elective',
            scheduled_date: new Date().toISOString().split('T')[0],
            scheduled_time: '09:00',
            estimated_duration: '60',
            pre_op_diagnosis: '',
            notes: '',
        });
        setIsModalOpen(true);
    };

    const openEdit = (schedule: SurgerySchedule) => {
        setEditing(schedule);
        setFormData({
            patient_id: schedule.patient?.patient_id?.toString() || '',
            operation_theater_id: schedule.operation_theater?.id?.toString() || '',
            surgeon_id: schedule.surgeon?.id?.toString() || '',
            surgery_name: schedule.surgery_name,
            surgery_type: schedule.surgery_type,
            scheduled_date: schedule.scheduled_date,
            scheduled_time: schedule.scheduled_time?.substring(0, 5) || '',
            estimated_duration: schedule.estimated_duration.toString(),
            pre_op_diagnosis: '',
            notes: '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (editing) {
            router.put(route('surgery-schedules.update', editing.id), formData);
        } else {
            router.post(route('surgery-schedules.store'), formData);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: number) => {
        if (confirm('Delete this surgery?')) router.delete(route('surgery-schedules.destroy', id));
    };
    const startSurgery = (s: SurgerySchedule) => router.post(route('surgery-schedules.start', s.id));
    const cancelSurgery = (s: SurgerySchedule) => router.post(route('surgery-schedules.cancel', s.id));

    return (
        <AppLayout breadcrumbs={[{ title: 'Surgery Schedules', href: '/surgery-schedules' }]}>
            <Head title="Surgery Schedules" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Surgery Schedules</h1>
                        <p className="text-muted-foreground text-sm">Manage surgery bookings</p>
                    </div>
                    {hasPermission('create_surgery_schedules') && (
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Schedule Surgery
                        </Button>
                    )}
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Surgery #</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Theater</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-8 text-center">
                                            No surgeries scheduled
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    schedules.data.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell className="font-medium">{s.surgery_number}</TableCell>
                                            <TableCell>{s.patient?.name || 'N/A'}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">{s.surgery_name}</TableCell>
                                            <TableCell>
                                                <Badge className={TYPE_COLORS[s.surgery_type]}>{s.surgery_type.toUpperCase()}</Badge>
                                            </TableCell>
                                            <TableCell>{s.operation_theater?.name || '-'}</TableCell>
                                            <TableCell>
                                                <p>{new Date(s.scheduled_date).toLocaleDateString()}</p>
                                                <p className="text-muted-foreground text-xs">{s.scheduled_time?.substring(0, 5)}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={STATUS_COLORS[s.status]}>{s.status.replace('_', ' ').toUpperCase()}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {s.status === 'scheduled' && (
                                                        <Button size="sm" onClick={() => startSurgery(s)} className="bg-purple-600">
                                                            <Play className="mr-1 h-4 w-4" />
                                                            Start
                                                        </Button>
                                                    )}
                                                    {['scheduled', 'pre_op'].includes(s.status) && (
                                                        <Button size="icon" variant="outline" onClick={() => cancelSurgery(s)}>
                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('update_surgery_schedules') && (
                                                        <Button size="icon" variant="outline" onClick={() => openEdit(s)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('delete_surgery_schedules') && (
                                                        <Button size="icon" variant="outline" onClick={() => handleDelete(s.id)}>
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit' : 'Schedule'} Surgery</DialogTitle>
                    </DialogHeader>
                    <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Patient *</Label>
                                <Select value={formData.patient_id} onValueChange={(v) => setFormData({ ...formData, patient_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map((p) => (
                                            <SelectItem key={p.patient_id} value={p.patient_id.toString()}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Surgery Name *</Label>
                                <Input value={formData.surgery_name} onChange={(e) => setFormData({ ...formData, surgery_name: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Type</Label>
                                <Select value={formData.surgery_type} onValueChange={(v) => setFormData({ ...formData, surgery_type: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="major">Major</SelectItem>
                                        <SelectItem value="minor">Minor</SelectItem>
                                        <SelectItem value="emergency">Emergency</SelectItem>
                                        <SelectItem value="elective">Elective</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Theater</Label>
                                <Select
                                    value={formData.operation_theater_id}
                                    onValueChange={(v) => setFormData({ ...formData, operation_theater_id: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Theater" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {theaters.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Date *</Label>
                                <Input
                                    type="date"
                                    value={formData.scheduled_date}
                                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Time *</Label>
                                <Input
                                    type="time"
                                    value={formData.scheduled_time}
                                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Pre-op Diagnosis</Label>
                            <Textarea
                                value={formData.pre_op_diagnosis}
                                onChange={(e) => setFormData({ ...formData, pre_op_diagnosis: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>{editing ? 'Update' : 'Schedule'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
