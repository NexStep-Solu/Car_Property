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
    description: string | null;
    status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    start_date: string | null;
    due_date: string | null;
    completed_date: string | null;
    progress_percentage: number;
}

interface Props {
    project: Project;
}

export default function ProjectsEdit({ project }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Projects',
            href: '/projects',
        },
        {
            title: 'Edit',
            href: `/projects/${project.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        title: project.title || '',
        description: project.description || '',
        status: (project.status || 'planning') as 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold',
        priority: (project.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
        start_date: project.start_date || '',
        due_date: project.due_date || '',
        completed_date: project.completed_date || '',
        progress_percentage: project.progress_percentage || 0,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('projects.update', project.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Project updated successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error updating project', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Project" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Edit Project</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Project Title *</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    disabled={processing}
                                    placeholder="Enter project title"
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
                                    placeholder="Enter project description"
                                    rows={4}
                                />
                                <InputError message={errors.description} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) =>
                                            setData('status', value as 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold')
                                        }
                                        disabled={processing}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="planning">Planning</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="review">Review</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="on_hold">On Hold</SelectItem>
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
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.start_date} className="mt-1" />
                                </div>

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
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="completed_date">Completed Date</Label>
                                    <Input
                                        id="completed_date"
                                        type="date"
                                        value={data.completed_date}
                                        onChange={(e) => setData('completed_date', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.completed_date} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="progress_percentage">Progress (%)</Label>
                                    <Input
                                        id="progress_percentage"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.progress_percentage}
                                        onChange={(e) => setData('progress_percentage', parseInt(e.target.value) || 0)}
                                        disabled={processing}
                                        placeholder="0-100"
                                    />
                                    <InputError message={errors.progress_percentage} className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <Label htmlFor="progress_slider">Progress</Label>
                                    <span className="font-medium">{data.progress_percentage}%</span>
                                </div>
                                <Progress value={data.progress_percentage} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('projects.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Project
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
