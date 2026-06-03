import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Department {
    id: number;
    name: string;
}

interface Employee {
    id: number;
    employee_id: string;
    user_id: number;
    user: User;
    phone: string | null;
    address: string | null;
    date_of_birth: string | null;
    hire_date: string;
    position: string;
    department_id: number;
    department: Department;
    salary: string;
    status: string;
}

interface Props {
    employees: {
        data: Employee[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    departments: Department[];
    filters: {
        search?: string;
        department_id?: string;
        status?: string;
    };
}

export default function EmployeeIndex({ employees, departments, filters }: Props) {
    const { hasPermission } = usePermission();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'HR', href: '/hr' },
        { title: 'Employees', href: '/employees' },
    ];

    const {
        data: createData,
        setData: setCreateData,
        post,
        processing: creating,
        reset: resetCreate,
    } = useForm({
        user_id: '',
        employee_id: '',
        phone: '',
        address: '',
        date_of_birth: '',
        hire_date: new Date().toISOString().slice(0, 10),
        position: '',
        department_id: '',
        salary: '',
        status: 'active',
    });

    const {
        data: updateData,
        setData: setUpdateData,
        put,
        processing: updating,
        reset: resetUpdate,
    } = useForm({
        user_id: '',
        employee_id: '',
        phone: '',
        address: '',
        date_of_birth: '',
        hire_date: '',
        position: '',
        department_id: '',
        salary: '',
        status: 'active',
    });

    const handleSearch = () => {
        router.get(
            route('employees.index'),
            {
                search: searchQuery,
                department_id: selectedDepartment,
                status: selectedStatus,
            },
            { preserveState: true },
        );
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('employees.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
                toast.success('Employee created successfully', { position: 'top-center', duration: 3000 });
            },
            onError: () => {
                toast.error('Error creating employee', { position: 'top-center', duration: 3000 });
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEmployee) return;

        put(route('employees.update', editingEmployee.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingEmployee(null);
                resetUpdate();
                toast.success('Employee updated successfully', { position: 'top-center', duration: 3000 });
            },
            onError: () => {
                toast.error('Error updating employee', { position: 'top-center', duration: 3000 });
            },
        });
    };

    const handleDelete = (employeeId: number) => {
        if (confirm('Are you sure you want to delete this employee?')) {
            router.delete(route('employees.destroy', employeeId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Employee deleted successfully', { position: 'top-center', duration: 3000 });
                },
                onError: () => {
                    toast.error('Error deleting employee', { position: 'top-center', duration: 3000 });
                },
            });
        }
    };

    const openEditDialog = (employee: Employee) => {
        setEditingEmployee(employee);
        setUpdateData({
            user_id: employee.user_id.toString(),
            employee_id: employee.employee_id,
            phone: employee.phone || '',
            address: employee.address || '',
            date_of_birth: employee.date_of_birth || '',
            hire_date: employee.hire_date,
            position: employee.position,
            department_id: employee.department_id.toString(),
            salary: employee.salary,
            status: employee.status,
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            inactive: 'secondary',
            on_leave: 'outline',
            suspended: 'destructive',
        };
        return <Badge variant={variants[status] || 'secondary'}>{status.replace('_', ' ')}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Employee Management</h1>
                    {hasPermission('create_employees') && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add Employee
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Add New Employee</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>User *</Label>
                                            <Input
                                                type="text"
                                                placeholder="Search user by email..."
                                                onChange={(e) => setCreateData('user_id', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Employee ID</Label>
                                            <Input
                                                value={createData.employee_id}
                                                onChange={(e) => setCreateData('employee_id', e.target.value)}
                                                placeholder="Auto-generated if empty"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Position *</Label>
                                            <Input
                                                value={createData.position}
                                                onChange={(e) => setCreateData('position', e.target.value)}
                                                placeholder="e.g., Doctor, Nurse"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Department *</Label>
                                            <Select value={createData.department_id} onValueChange={(v) => setCreateData('department_id', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
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
                                        <div className="space-y-2">
                                            <Label>Hire Date *</Label>
                                            <Input
                                                type="date"
                                                value={createData.hire_date}
                                                onChange={(e) => setCreateData('hire_date', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Salary</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={createData.salary}
                                                onChange={(e) => setCreateData('salary', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input value={createData.phone} onChange={(e) => setCreateData('phone', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={createData.status} onValueChange={(v) => setCreateData('status', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                    <SelectItem value="on_leave">On Leave</SelectItem>
                                                    <SelectItem value="suspended">Suspended</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label>Address</Label>
                                            <Input value={createData.address} onChange={(e) => setCreateData('address', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsCreateOpen(false);
                                                resetCreate();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={creating}>
                                            {creating ? 'Creating...' : 'Create Employee'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Employees</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                        placeholder="Search employees..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-64 pl-8"
                                    />
                                </div>
                                <Select
                                    value={selectedDepartment}
                                    onValueChange={(v) => {
                                        setSelectedDepartment(v);
                                        handleSearch();
                                    }}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All Depts" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value=" ">All Departments</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={selectedStatus}
                                    onValueChange={(v) => {
                                        setSelectedStatus(v);
                                        handleSearch();
                                    }}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value=" ">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="on_leave">On Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Hire Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-muted-foreground text-center">
                                            No employees found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    employees.data.map((employee) => (
                                        <TableRow key={employee.id}>
                                            <TableCell className="font-mono text-sm">{employee.employee_id}</TableCell>
                                            <TableCell className="font-medium">{employee.user?.name || '-'}</TableCell>
                                            <TableCell>{employee.user?.email || '-'}</TableCell>
                                            <TableCell>{employee.position}</TableCell>
                                            <TableCell>{employee.department?.name || '-'}</TableCell>
                                            <TableCell>{new Date(employee.hire_date).toLocaleDateString()}</TableCell>
                                            <TableCell>{getStatusBadge(employee.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" asChild>
                                                        <a href={route('employees.show', employee.id)}>
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    {hasPermission('update_employees') && (
                                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(employee)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('delete_employees') && (
                                                        <Button variant="outline" size="icon" onClick={() => handleDelete(employee.id)}>
                                                            <Trash2 className="h-4 w-4" />
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

                {employees.links && employees.links.length > 1 && <Pagination links={employees.links} />}

                {editingEmployee && (
                    <Dialog open={!!editingEmployee} onOpenChange={(open) => !open && setEditingEmployee(null)}>
                        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Employee</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Position *</Label>
                                        <Input value={updateData.position} onChange={(e) => setUpdateData('position', e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Department *</Label>
                                        <Select value={updateData.department_id} onValueChange={(v) => setUpdateData('department_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
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
                                    <div className="space-y-2">
                                        <Label>Hire Date *</Label>
                                        <Input
                                            type="date"
                                            value={updateData.hire_date}
                                            onChange={(e) => setUpdateData('hire_date', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Salary</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={updateData.salary}
                                            onChange={(e) => setUpdateData('salary', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input value={updateData.phone} onChange={(e) => setUpdateData('phone', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={updateData.status} onValueChange={(v) => setUpdateData('status', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="on_leave">On Leave</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label>Address</Label>
                                        <Input value={updateData.address} onChange={(e) => setUpdateData('address', e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingEmployee(null);
                                            resetUpdate();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={updating}>
                                        {updating ? 'Updating...' : 'Update Employee'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}
