import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Owner {
    id: number;
    name: string;
    email: string;
}

interface Showroom {
    id: number;
    business_name: string;
    slug: string;
    registration_number: string | null;
    phone: string;
    email: string | null;
    address: string;
    region: string | null;
    description: string | null;
    verification_status: string;
    approved_at: string | null;
    owner?: Owner | null;
}

interface Member {
    id: number;
    name: string;
    email: string;
    member_role: string;
    is_active: boolean;
    joined_at: string | null;
}

interface AvailableUser {
    id: number;
    name: string;
    email: string;
}

interface ShowroomApplication {
    id: number;
    uuid: string;
    status: string;
    submitted_at: string | null;
}

interface Props {
    showroom: Showroom;
    members: Member[];
    availableUsers: AvailableUser[];
    applications: ShowroomApplication[];
    canApply: boolean;
    canManage: boolean;
    canDelete: boolean;
    canManageStaff: boolean;
    canReview: boolean;
    isOwner: boolean;
    statuses: string[];
    memberRoles: string[];
}

export default function ShowroomsShow({ showroom, members, availableUsers, applications, canApply, canDelete, canManageStaff, canReview, statuses, memberRoles }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Showrooms', href: '/showrooms' },
        { title: showroom.business_name, href: `/showrooms/${showroom.id}` },
    ];

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    const addForm = useForm({ email: '', member_role: 'staff' });
    const editForm = useForm({ member_role: '', is_active: true as boolean });
    const statusForm = useForm({ verification_status: showroom.verification_status });

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('showrooms.members.store', showroom.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddOpen(false);
                addForm.reset();
                toast.success('Member added successfully.');
            },
            onError: () => toast.error('Could not add member.'),
        });
    };

    const openEdit = (member: Member) => {
        setEditingMember(member);
        editForm.setData({ member_role: member.member_role, is_active: member.is_active });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember) return;
        editForm.put(route('showrooms.members.update', [showroom.id, editingMember.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingMember(null);
                toast.success('Member updated successfully.');
            },
            onError: () => toast.error('Could not update member.'),
        });
    };

    const removeMember = (member: Member) => {
        router.delete(route('showrooms.members.destroy', [showroom.id, member.id]), {
            preserveScroll: true,
            onSuccess: () => toast.success('Member removed.'),
            onError: () => toast.error('Could not remove member.'),
        });
    };

    const submitStatus = (e: React.FormEvent) => {
        e.preventDefault();
        statusForm.post(route('showrooms.status', showroom.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Verification status updated.'),
            onError: () => toast.error('Could not update status.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Showroom: ${showroom.business_name}`} />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{showroom.business_name}</h1>
                        <p className="text-muted-foreground text-sm">
                            {showroom.slug} · {showroom.phone}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('showrooms.edit', showroom.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        {canDelete && (
                            <Button
                                variant="destructive"
                                className="gap-2"
                                onClick={() => {
                                    if (!confirm(`Delete "${showroom.business_name}"? This cannot be undone.`)) return;
                                    router.delete(route('showrooms.destroy', showroom.id), {
                                        onSuccess: () => toast.success('Showroom deleted.'),
                                        onError: () => toast.error('Could not delete showroom.'),
                                    });
                                }}
                            >
                                <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => router.visit(route('showrooms.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Showroom Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                            <p className="text-muted-foreground">Business name</p>
                            <p className="font-medium">{showroom.business_name}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p className="font-medium">{showroom.phone}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Email</p>
                            <p className="font-medium">{showroom.email || '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Region</p>
                            <p className="font-medium">{showroom.region || '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Owner</p>
                            <p className="font-medium">
                                {showroom.owner?.name} ({showroom.owner?.email})
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Status</p>
                            <Badge variant="outline">{capitalizeFirst(showroom.verification_status.replace(/_/g, ' '))}</Badge>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground">Address</p>
                            <p className="font-medium">{showroom.address}</p>
                        </div>
                        {showroom.description && (
                            <div className="md:col-span-2">
                                <p className="text-muted-foreground">Description</p>
                                <p className="font-medium">{showroom.description}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {canReview && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Verification Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitStatus} className="flex flex-wrap items-end gap-4">
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <Select value={statusForm.data.verification_status} onValueChange={(v) => statusForm.setData('verification_status', v)}>
                                        <SelectTrigger className="w-[220px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {capitalizeFirst(s.replace(/_/g, ' '))}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={statusForm.errors.verification_status} />
                                </div>
                                <Button type="submit" disabled={statusForm.processing}>
                                    Update Status
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Staff Members</CardTitle>
                        {canManageStaff && (
                            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" /> Add Member
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Staff Member</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={submitAdd} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="member-email">User (must already be registered)</Label>
                                            {availableUsers.length > 0 ? (
                                                <Select value={addForm.data.email} onValueChange={(v) => addForm.setData('email', v)}>
                                                    <SelectTrigger id="member-email">
                                                        <SelectValue placeholder="Select a user" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableUsers.map((u) => (
                                                            <SelectItem key={u.id} value={u.email}>
                                                                {u.name} ({u.email})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <p className="text-muted-foreground text-sm">
                                                    No other registered users to add. Create the user under Users first.
                                                </p>
                                            )}
                                            <InputError message={addForm.errors.email} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Role</Label>
                                            <Select value={addForm.data.member_role} onValueChange={(v) => addForm.setData('member_role', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {memberRoles.map((r) => (
                                                        <SelectItem key={r} value={r}>
                                                            {capitalizeFirst(r)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={addForm.errors.member_role} />
                                        </div>
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={addForm.processing}>
                                                Add Member
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Active</TableHead>
                                    {canManageStaff && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member: Member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium">{member.name}</TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>{capitalizeFirst(member.member_role)}</TableCell>
                                        <TableCell>{member.is_active ? 'Yes' : 'No'}</TableCell>
                                        {canManageStaff && (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {member.id !== showroom.owner?.id && (
                                                        <>
                                                            <Button variant="outline" size="icon" onClick={() => openEdit(member)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="outline" size="icon" onClick={() => removeMember(member)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Verification Applications</CardTitle>
                        {canApply && (
                            <Link href={`${route('applications.create')}?showroom_id=${showroom.id}`}>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" /> New Application
                                </Button>
                            </Link>
                        )}
                    </CardHeader>
                    <CardContent>
                        {applications.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applications.map((app: ShowroomApplication) => (
                                        <TableRow key={app.id}>
                                            <TableCell className="font-medium">#{app.id}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{capitalizeFirst(app.status.replace(/_/g, ' '))}</Badge>
                                            </TableCell>
                                            <TableCell>{app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={route('applications.show', app.id)}>
                                                    <Button variant="outline" size="sm">
                                                        Open
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground py-4 text-center text-sm">No applications yet.</p>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={editingMember !== null} onOpenChange={(open) => !open && setEditingMember(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Member</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Role</Label>
                                <Select value={editForm.data.member_role} onValueChange={(v) => editForm.setData('member_role', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {memberRoles.map((r) => (
                                            <SelectItem key={r} value={r}>
                                                {capitalizeFirst(r)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={editForm.errors.member_role} />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox checked={editForm.data.is_active} onClick={() => editForm.setData('is_active', !editForm.data.is_active)} />
                                Active member
                            </label>
                            <InputError message={editForm.errors.is_active} />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={editForm.processing}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
