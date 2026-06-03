import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface Project {
    id: number;
    title: string;
}

interface Task {
    id: number;
    title: string;
    description: string | null;
    status: 'todo' | 'in_progress' | 'review' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date: string | null;
    estimated_hours: number | null;
    actual_hours: number | null;
    project_id: number;
    progress: number;
}

interface Props {
    task: Task;
    projects: Project[];
}

export default function TasksEdit({ task, projects }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tasks',
            href: '/tasks',
        },
        {
            title: 'Edit',
            href: `/tasks/${task.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        title: task.title || '',
        description: task.description || '',
        project_id: task.project_id?.toString() || '',
        status: (task.status || 'todo') as 'todo' | 'in_progress' | 'review' | 'completed',
        priority: (task.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
        due_date: task.due_date || '',
        estimated_hours: task.estimated_hours?.toString() || '',
        actual_hours: task.actual_hours?.toString() || '',
        progress: task.progress || 0,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('tasks.update', task.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Task updated successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error updating task', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Task" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Edit Task</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Task Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Task Title *</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    disabled={processing}
                                    placeholder="Enter task title"
                                />
                                <InputError message={errors.title} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    disabled={processing}
                                    placeholder="Enter task description"
                                    rows={4}
                                />
                                <InputError message={errors.description} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="project_id">Project *</Label>
                                <Select value={data.project_id} onValueChange={(value) => setData('project_id', value)} disabled={processing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map((project) => (
                                            <SelectItem key={project.id} value={String(project.id)}>
                                                {project.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.project_id} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value as 'todo' | 'in_progress' | 'review' | 'completed')}
                                        disabled={processing}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todo">To Do</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="review">Review</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={data.priority}
                                        onValueChange={(value) => setData('priority', value as 'low' | 'medium' | 'high' | 'urgent')}
                                        disabled={processing}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.priority} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="due_date">Due Date</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.due_date} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="estimated_hours">Estimated Hours</Label>
                                    <Input
                                        id="estimated_hours"
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={data.estimated_hours}
                                        onChange={(e) => setData('estimated_hours', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 8"
                                    />
                                    <InputError message={errors.estimated_hours} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="actual_hours">Actual Hours</Label>
                                    <Input
                                        id="actual_hours"
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={data.actual_hours}
                                        onChange={(e) => setData('actual_hours', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 6"
                                    />
                                    <InputError message={errors.actual_hours} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="progress">Progress (%)</Label>
                                    <Input
                                        id="progress"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.progress}
                                        onChange={(e) => setData('progress', parseInt(e.target.value) || 0)}
                                        disabled={processing}
                                        placeholder="0-100"
                                    />
                                    <InputError message={errors.progress} className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <Label htmlFor="progress_slider">Progress</Label>
                                    <span className="font-medium">{data.progress}%</span>
                                </div>
                                <Progress value={data.progress} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('tasks.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Task
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
