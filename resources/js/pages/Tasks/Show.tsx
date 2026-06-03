import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Pencil, User } from 'lucide-react';

interface Project {
    id: number;
    title: string;
}

interface UserInfo {
    id: number;
    name: string;
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
    project: Project;
    assignee: UserInfo | null;
    creator: UserInfo;
    is_overdue: boolean;
    progress: number;
}

interface Props {
    task: Task;
}

function Info({ label, value, icon: Icon }: { label: string; value?: string | number | null; icon?: React.ElementType }) {
    return (
        <div className="flex items-start gap-2">
            {Icon && <Icon className="text-muted-foreground mt-0.5 h-4 w-4" />}
            <div>
                <p className="text-muted-foreground text-sm">{label}</p>
                <p className="font-medium">{value || '-'}</p>
            </div>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'in_progress':
            return 'bg-blue-100 text-blue-800';
        case 'review':
            return 'bg-purple-100 text-purple-800';
        case 'todo':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getPriorityColor(priority: string) {
    switch (priority) {
        case 'urgent':
            return 'bg-red-100 text-red-800';
        case 'high':
            return 'bg-orange-100 text-orange-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'low':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function formatDate(dateString: string | null) {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
}

export default function TasksShow({ task }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tasks', href: '/tasks' },
        { title: task.title, href: `/tasks/${task.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Task: ${task.title}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{task.title}</h1>
                        <p className="text-muted-foreground text-sm">Project: {task.project.title}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('tasks.edit', task.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('tasks.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Badge className={getStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    {task.is_overdue && <Badge variant="destructive">Overdue</Badge>}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Task Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <Info label="Estimated Hours" value={task.estimated_hours ? `${task.estimated_hours}h` : null} />
                            <Info label="Actual Hours" value={task.actual_hours ? `${task.actual_hours}h` : null} />
                            <Info label="Due Date" value={formatDate(task.due_date)} icon={Calendar} />
                            <Info label="Created By" value={task.creator.name} icon={User} />
                            {task.assignee && <Info label="Assigned To" value={task.assignee.name} icon={User} />}
                        </div>

                        {task.description && (
                            <div>
                                <p className="text-muted-foreground text-sm">Description</p>
                                <p className="mt-1">{task.description}</p>
                            </div>
                        )}

                        <div>
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{task.progress}%</span>
                            </div>
                            <Progress value={task.progress} className="h-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
