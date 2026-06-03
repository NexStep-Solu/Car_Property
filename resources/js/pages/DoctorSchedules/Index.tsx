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
import { Pencil, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Employee {
    id: number;
    employee_id: string;
    user: {
        id: number;
        name: string;
    };
}

interface Department {
    id: number;
    name: string;
}

interface DoctorSchedule {
    id: number;
    employee_id: number;
    department_id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    slot_duration: number;
    max_patients: number | null;
    is_available: boolean;
    is_emergency_available: boolean;
    location: string | null;
    notes: string | null;
    employee: Employee;
    department: Department;
}

interface Props {
    schedules: {
        data: DoctorSchedule[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    employees: Employee[];
    departments: Department[];
    filters: {
        employee_id?: number;
        department_id?: number;
        day_of_week?: string;
    };
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorSchedulesIndex({ schedules, employees, departments, filters }: Props) {
    const { hasPermission } = usePermission();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<DoctorSchedule | null>(null);
    const [formData, setFormData] = useState({
        employee_id: '',
        department_id: '',
        day_of_week: '',
        start_time: '09:00',
        end_time: '17:00',
        slot_duration: '15',
        max_patients: '',
        is_available: true,
        is_emergency_available: false,
        location: '',
        notes: '',
    });

    const openCreate = () => {
        setEditing(null);
        setFormData({
            employee_id: '',
            department_id: '',
            day_of_week: '',
            start_time: '09:00',
            end_time: '17:00',
            slot_duration: '15',
            max_patients: '',
            is_available: true,
            is_emergency_available: false,
            location: '',
            notes: '',
        });
        setIsModalOpen(true);
    };

    const openEdit = (schedule: DoctorSchedule) => {
        setEditing(schedule);
        setFormData({
            employee_id: schedule.employee_id.toString(),
            department_id: schedule.department_id.toString(),
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time.substring(0, 5),
            end_time: schedule.end_time.substring(0, 5),
            slot_duration: schedule.slot_duration.toString(),
            max_patients: schedule.max_patients?.toString() || '',
            is_available: schedule.is_available,
            is_emergency_available: schedule.is_emergency_available,
            location: schedule.location || '',
            notes: schedule.notes || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (editing) {
            router.put(route('doctor-schedules.update', editing.id), formData);
        } else {
            router.post(route('doctor-schedules.store'), formData);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this schedule?')) {
            router.delete(route('doctor-schedules.destroy', id));
        }
    };

    const handleToggle = (schedule: DoctorSchedule) => {
        router.post(route('doctor-schedules.toggle', schedule.id));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Doctor Schedules', href: '/doctor-schedules' }]}>
            <Head title="Doctor Schedules" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Doctor Schedules</h1>
                        <p className="text-muted-foreground text-sm">Manage doctor availability and timing</p>
                    </div>
                    {hasPermission('create_doctor_schedules') && (
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Schedule
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex flex-wrap gap-4">
                            <div className="w-48">
                                <Select
                                    value={filters.employee_id?.toString() || 'all'}
                                    onValueChange={(v) =>
                                        router.get(route('doctor-schedules.index'), { ...filters, employee_id: v === 'all' ? undefined : v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by Doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Doctors</SelectItem>
                                        {employees.map((emp) => (
                                            <SelectItem key={emp.id} value={emp.id.toString()}>
                                                {emp.user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-48">
                                <Select
                                    value={filters.department_id?.toString() || 'all'}
                                    onValueChange={(v) =>
                                        router.get(route('doctor-schedules.index'), { ...filters, department_id: v === 'all' ? undefined : v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by Department" />
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
                                    value={filters.day_of_week || 'all'}
                                    onValueChange={(v) =>
                                        router.get(route('doctor-schedules.index'), { ...filters, day_of_week: v === 'all' ? undefined : v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Days</SelectItem>
                                        {DAYS.map((day) => (
                                            <SelectItem key={day} value={day}>
                                                {day}
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
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Day</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Slots</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                                            No schedules found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    schedules.data.map((schedule) => (
                                        <TableRow key={schedule.id}>
                                            <TableCell className="font-medium">{schedule.employee?.user?.name || 'N/A'}</TableCell>
                                            <TableCell>{schedule.department?.name || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{schedule.day_of_week}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {schedule.start_time?.substring(0, 5)} - {schedule.end_time?.substring(0, 5)}
                                            </TableCell>
                                            <TableCell>
                                                {schedule.slot_duration} min
                                                {schedule.max_patients && ` / ${schedule.max_patients} max`}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Badge variant={schedule.is_available ? 'default' : 'secondary'}>
                                                        {schedule.is_available ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    {schedule.is_emergency_available && <Badge variant="destructive">Emergency</Badge>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="icon" variant="outline" onClick={() => handleToggle(schedule)}>
                                                        {schedule.is_available ? (
                                                            <ToggleRight className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <ToggleLeft className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    {hasPermission('update_doctor_schedules') && (
                                                        <Button size="icon" variant="outline" onClick={() => openEdit(schedule)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('delete_doctor_schedules') && (
                                                        <Button size="icon" variant="outline" onClick={() => handleDelete(schedule.id)}>
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

                        {schedules.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between border-t p-4">
                                <p className="text-muted-foreground text-sm">
                                    Showing {schedules.current_page} of {schedules.last_page} pages
                                </p>
                                <div className="flex gap-1">
                                    {schedules.links.map((link, index) => (
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Schedule' : 'Add Doctor Schedule'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Doctor</Label>
                            <Select value={formData.employee_id} onValueChange={(v) => setFormData({ ...formData, employee_id: v })}>
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
                            <Label>Day of Week</Label>
                            <Select value={formData.day_of_week} onValueChange={(v) => setFormData({ ...formData, day_of_week: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS.map((day) => (
                                        <SelectItem key={day} value={day}>
                                            {day}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Start Time</Label>
                                <Input
                                    type="time"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>End Time</Label>
                                <Input
                                    type="time"
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Slot Duration (min)</Label>
                                <Input
                                    type="number"
                                    value={formData.slot_duration}
                                    onChange={(e) => setFormData({ ...formData, slot_duration: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Max Patients</Label>
                                <Input
                                    type="number"
                                    placeholder="Optional"
                                    value={formData.max_patients}
                                    onChange={(e) => setFormData({ ...formData, max_patients: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Location</Label>
                            <Input
                                placeholder="e.g., Room 101"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
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
                        <Button onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
