import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Bell, CheckCircle, Phone, Plus, User, UserX, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Patient {
    id: number;
    patient_id: number;
    name: string;
    phone: string | null;
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

interface PatientQueue {
    id: number;
    patient_id: number;
    department_id: number;
    queue_number: string;
    position: number;
    status: string;
    priority: string;
    notes: string | null;
    called_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    patient: Patient;
    department: Department | null;
    employee: Employee | null;
}

interface Props {
    queues: {
        data: PatientQueue[];
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
        status?: string;
        department_id?: number;
    };
}

const STATUS_COLORS: Record<string, string> = {
    waiting: 'bg-yellow-100 text-yellow-800',
    called: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    no_show: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
};

const PRIORITY_COLORS: Record<string, string> = {
    normal: 'bg-gray-100 text-gray-600',
    urgent: 'bg-orange-100 text-orange-700',
    emergency: 'bg-red-100 text-red-700',
};

export default function PatientQueuesIndex({ queues, departments, patients, employees, filters }: Props) {
    const { hasPermission } = usePermission();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        patient_id: '',
        department_id: '',
        employee_id: '',
        priority: 'normal',
        notes: '',
    });

    const waitingCount = queues.data.filter((q) => q.status === 'waiting').length;
    const calledCount = queues.data.filter((q) => q.status === 'called').length;
    const inProgressCount = queues.data.filter((q) => q.status === 'in_progress').length;

    const openCreate = () => {
        setFormData({
            patient_id: '',
            department_id: '',
            employee_id: '',
            priority: 'normal',
            notes: '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        router.post(route('patient-queues.store'), formData);
        setIsModalOpen(false);
    };

    const handleCall = (queue: PatientQueue) => {
        router.post(route('patient-queues.call', queue.id));
    };

    const handleStart = (queue: PatientQueue) => {
        router.post(route('patient-queues.start', queue.id));
    };

    const handleComplete = (queue: PatientQueue) => {
        router.post(route('patient-queues.complete', queue.id));
    };

    const handleNoShow = (queue: PatientQueue) => {
        router.post(route('patient-queues.no-show', queue.id));
    };

    const handleCancel = (queue: PatientQueue) => {
        router.post(route('patient-queues.cancel', queue.id));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Patient Queue', href: '/patient-queues' }]}>
            <Head title="Patient Queue" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Patient Queue</h1>
                        <p className="text-muted-foreground text-sm">Manage patient consultation queue</p>
                    </div>
                    {hasPermission('create_patient_queues') && (
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add to Queue
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                                <Bell className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{waitingCount}</p>
                                <p className="text-muted-foreground text-sm">Waiting</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <Phone className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{calledCount}</p>
                                <p className="text-muted-foreground text-sm">Called</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-purple-200 bg-purple-50">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                                <User className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{inProgressCount}</p>
                                <p className="text-muted-foreground text-sm">In Progress</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{queues.total}</p>
                                <p className="text-muted-foreground text-sm">Total Today</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex gap-4">
                            <div className="w-48">
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(v) =>
                                        router.get(route('patient-queues.index'), { ...filters, status: v === 'all' ? undefined : v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Active</SelectItem>
                                        <SelectItem value="waiting">Waiting</SelectItem>
                                        <SelectItem value="called">Called</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="no_show">No Show</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-48">
                                <Select
                                    value={filters.department_id?.toString() || 'all'}
                                    onValueChange={(v) =>
                                        router.get(route('patient-queues.index'), { ...filters, department_id: v === 'all' ? undefined : v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by Dept" />
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
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Queue #</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {queues.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                                            No patients in queue
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    queues.data.map((queue) => (
                                        <TableRow
                                            key={queue.id}
                                            className={
                                                queue.priority === 'emergency' ? 'bg-red-50' : queue.priority === 'urgent' ? 'bg-orange-50' : ''
                                            }
                                        >
                                            <TableCell>
                                                <span className="text-lg font-bold">{queue.queue_number}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{queue.patient?.name || 'N/A'}</p>
                                                    <p className="text-muted-foreground text-xs">{queue.patient?.phone || 'No phone'}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{queue.department?.name || '-'}</TableCell>
                                            <TableCell>
                                                <Badge className={PRIORITY_COLORS[queue.priority]}>{queue.priority.toUpperCase()}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={STATUS_COLORS[queue.status]}>{queue.status.replace('_', ' ').toUpperCase()}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs">
                                                    {queue.called_at && <p>Called: {new Date(queue.called_at).toLocaleTimeString()}</p>}
                                                    {queue.started_at && <p>Started: {new Date(queue.started_at).toLocaleTimeString()}</p>}
                                                    {queue.completed_at && <p>Done: {new Date(queue.completed_at).toLocaleTimeString()}</p>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    {queue.status === 'waiting' && (
                                                        <Button size="sm" onClick={() => handleCall(queue)} className="bg-blue-600 hover:bg-blue-700">
                                                            <Phone className="mr-1 h-4 w-4" /> Call
                                                        </Button>
                                                    )}
                                                    {queue.status === 'called' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStart(queue)}
                                                            className="bg-purple-600 hover:bg-purple-700"
                                                        >
                                                            <User className="mr-1 h-4 w-4" /> Start
                                                        </Button>
                                                    )}
                                                    {queue.status === 'in_progress' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleComplete(queue)}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <CheckCircle className="mr-1 h-4 w-4" /> Complete
                                                        </Button>
                                                    )}
                                                    {queue.status === 'waiting' && (
                                                        <Button size="icon" variant="outline" onClick={() => handleNoShow(queue)} title="No Show">
                                                            <UserX className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {(queue.status === 'waiting' || queue.status === 'called') && (
                                                        <Button size="icon" variant="outline" onClick={() => handleCancel(queue)} title="Cancel">
                                                            <XCircle className="h-4 w-4 text-red-500" />
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
                        <DialogTitle>Add Patient to Queue</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Patient</Label>
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
                            <Label>Department</Label>
                            <Select value={formData.department_id} onValueChange={(v) => setFormData({ ...formData, department_id: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Department (Optional)" />
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
                            <Label>Doctor (Optional)</Label>
                            <Select value={formData.employee_id} onValueChange={(v) => setFormData({ ...formData, employee_id: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Doctor (Optional)" />
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
                        <div className="grid gap-2">
                            <Label>Priority</Label>
                            <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Notes</Label>
                            <Textarea
                                placeholder="Additional notes..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>Add to Queue</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
