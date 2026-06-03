import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Pencil, User } from 'lucide-react';

interface Task {
    id: number;
    status: 'todo' | 'in_progress' | 'review' | 'completed';
}

interface UserInfo {
    id: number;
    name: string;
}

interface Project {
    id: number;
    title: string;
    description: string | null;
    status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    start_date: string | null;
    due_date: string | null;
    completed_date: string | null;
    creator: UserInfo;
    assignee: UserInfo | null;
    tasks: Task[];
    progress_percentage: number;
    is_overdue: boolean;
}

interface Props {
    project: Project;
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
        case 'planning':
            return 'bg-yellow-100 text-yellow-800';
        case 'on_hold':
            return 'bg-red-100 text-red-800';
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

export default function ProjectsShow({ project }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Projects', href: '/projects' },
        { title: project.title, href: `/projects/${project.id}` },
    ];

    const completedTasks = project.tasks.filter((t) => t.status === 'completed').length;
    const totalTasks = project.tasks.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Project: ${project.title}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{project.title}</h1>
                        <p className="text-muted-foreground text-sm">by {project.creator.name}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('projects.edit', project.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('projects.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
                    <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                    {project.is_overdue && <Badge variant="destructive">Overdue</Badge>}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <Info label="Start Date" value={formatDate(project.start_date)} icon={Calendar} />
                            <Info label="Due Date" value={formatDate(project.due_date)} icon={Calendar} />
                            <Info label="Completed Date" value={formatDate(project.completed_date)} icon={Calendar} />
                            <Info label="Created By" value={project.creator.name} icon={User} />
                            {project.assignee && <Info label="Assigned To" value={project.assignee.name} icon={User} />}
                        </div>

                        {project.description && (
                            <div>
                                <p className="text-muted-foreground text-sm">Description</p>
                                <p className="mt-1">{project.description}</p>
                            </div>
                        )}

                        <div>
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{project.progress_percentage}%</span>
                            </div>
                            <Progress value={project.progress_percentage} className="h-2" />
                        </div>

                        <div>
                            <p className="text-muted-foreground text-sm">Tasks</p>
                            <p className="font-medium">
                                {completedTasks} of {totalTasks} completed
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
