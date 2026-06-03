import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Patient {
    id: number;
    patient_id: number;
    name: string;
}

interface Department {
    id: number;
    name: string;
}

interface Employee {
    id: number;
    user: {
        name: string;
    };
}

interface OpdRecord {
    id: number;
    patient_id: number;
    opd_number: string;
    visit_date: string;
    visit_time: string;
    visit_type: string;
    chief_complaint: string | null;
    diagnosis: string | null;
    status: string;
    consultation_fee: number;
    patient: Patient;
    department: Department | null;
    doctor: Employee | null;
}

interface Props {
    records: {
        data: OpdRecord[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    departments: Department[];
    patients: Patient[];
    employees: Employee[];
    filters: {
        patient_id?: number;
        department_id?: number;
        status?: string;
        date?: string;
    };
}

const STATUS_COLORS: Record<string, string> = {
    registered: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const VISIT_TYPE_COLORS: Record<string, string> = {
    new: 'bg-primary/10 text-primary',
    follow_up: 'bg-purple-100 text-purple-800',
    emergency: 'bg-red-100 text-red-800',
    review: 'bg-orange-100 text-orange-800',
};

export default function OpdRecordsIndex({ records, departments, patients, employees, filters }: Props) {
    const { hasPermission } = usePermission();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<OpdRecord | null>(null);
    const [formData, setFormData] = useState({
        patient_id: '',
        department_id: '',
        doctor_id: '',
        visit_date: new Date().toISOString().split('T')[0],
        visit_time: new Date().toTimeString().slice(0, 5),
        visit_type: 'new',
        chief_complaint: '',
        diagnosis: '',
        treatment: '',
        advice: '',
        notes: '',
        consultation_fee: '',
    });

    const openCreate = () => {
        setEditing(null);
        setFormData({
            patient_id: '',
            department_id: '',
            doctor_id: '',
            visit_date: new Date().toISOString().split('T')[0],
            visit_time: new Date().toTimeString().slice(0, 5),
            visit_type: 'new',
            chief_complaint: '',
            diagnosis: '',
            treatment: '',
            advice: '',
            notes: '',
            consultation_fee: '',
        });
        setIsModalOpen(true);
    };

    const openEdit = (record: OpdRecord) => {
        setEditing(record);
        setFormData({
            patient_id: record.patient_id.toString(),
            department_id: record.department?.id?.toString() || '',
            doctor_id: record.doctor?.id?.toString() || '',
            visit_date: record.visit_date,
            visit_time: record.visit_time?.substring(0, 5) || '',
            visit_type: record.visit_type,
            chief_complaint: record.chief_complaint || '',
            diagnosis: record.diagnosis || '',
            treatment: '',
            advice: '',
            notes: '',
            consultation_fee: record.consultation_fee?.toString() || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (editing) {
            router.put(route('opd-records.update', editing.id), formData);
        } else {
            router.post(route('opd-records.store'), formData);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this OPD record?')) {
            router.delete(route('opd-records.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'OPD Records', href: '/opd-records' }]}>
            <Head title="OPD Records" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">OPD Records</h1>
                        <p className="text-muted-foreground text-sm">Outpatient Department visit records</p>
                    </div>
                    {hasPermission('create_opd_records') && (
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            New OPD Visit
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex flex-wrap gap-4">
                            <div className="w-48">
                                <Input
                                    type="date"
                                    value={filters.date || ''}
                                    onChange={(e) => router.get(route('opd-records.index'), { ...filters, date: e.target.value || undefined })}
                                    placeholder="Filter by Date"
                                />
                            </div>
                            <div className="w-48">
                                <Select
                                    value={filters.department_id?.toString() || 'all'}
                                    onValueChange={(v) =>
                                        router.get(route('opd-records.index'), { ...filters, department_id: v === 'all' ? undefined : v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-40">
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(v) => router.get(route('opd-records.index'), { ...filters, status: v === 'all' ? undefined : v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="registered">Registered</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>OPD #</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                                            No OPD records found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    records.data.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">{record.opd_number}</TableCell>
                                            <TableCell>
                                                <p className="font-medium">{record.patient?.name || 'N/A'}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p>{new Date(record.visit_date).toLocaleDateString()}</p>
                                                <p className="text-muted-foreground text-xs">{record.visit_time?.substring(0, 5)}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={VISIT_TYPE_COLORS[record.visit_type]}>{record.visit_type.toUpperCase()}</Badge>
                                            </TableCell>
                                            <TableCell>{record.department?.name || '-'}</TableCell>
                                            <TableCell>{record.doctor?.user?.name || '-'}</TableCell>
                                            <TableCell>
                                                <Badge className={STATUS_COLORS[record.status]}>
                                                    {record.status.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() => router.get(route('opd-records.show', record.id))}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {hasPermission('update_opd_records') && (
                                                        <Button size="icon" variant="outline" onClick={() => openEdit(record)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('delete_opd_records') && (
                                                        <Button size="icon" variant="outline" onClick={() => handleDelete(record.id)}>
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

                        {records.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between border-t p-4">
                                <p className="text-muted-foreground text-sm">
                                    Page {records.current_page} of {records.last_page}
                                </p>
                                <div className="flex gap-1">
                                    {records.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit OPD Record' : 'New OPD Visit'}</DialogTitle>
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
                                        {patients.map((patient) => (
                                            <SelectItem key={patient.patient_id} value={patient.patient_id.toString()}>
                                                {patient.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Visit Type</Label>
                                <Select value={formData.visit_type} onValueChange={(v) => setFormData({ ...formData, visit_type: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="follow_up">Follow Up</SelectItem>
                                        <SelectItem value="emergency">Emergency</SelectItem>
                                        <SelectItem value="review">Review</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Date *</Label>
                                <Input
                                    type="date"
                                    value={formData.visit_date}
                                    onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Time *</Label>
                                <Input
                                    type="time"
                                    value={formData.visit_time}
                                    onChange={(e) => setFormData({ ...formData, visit_time: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Department</Label>
                                <Select value={formData.department_id} onValueChange={(v) => setFormData({ ...formData, department_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Doctor</Label>
                                <Select value={formData.doctor_id} onValueChange={(v) => setFormData({ ...formData, doctor_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp) => (
                                            <SelectItem key={emp.id} value={emp.id.toString()}>
                                                {emp.user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Chief Complaint</Label>
                            <Textarea
                                placeholder="Main reason for visit..."
                                value={formData.chief_complaint}
                                onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Diagnosis</Label>
                            <Textarea
                                placeholder="Doctor's diagnosis..."
                                value={formData.diagnosis}
                                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Consultation Fee</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={formData.consultation_fee}
                                onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                            />
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
