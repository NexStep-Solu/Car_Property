import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';

interface Appointment {
    id: number;
    patient_id: number;
    patient: { name: string; patient_id: number };
    doctor_id: number;
    doctor: { name: string };
    department_id: number;
    department: { name: string };
    appointment_date: string;
    appointment_time: string;
    status: string;
    type: string;
    reason?: string;
    notes?: string;
}

interface Props {
    appointment: Appointment;
}

export default function AppointmentsShow({ appointment }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Appointments', href: '/appointments' },
        { title: `Appointment #${appointment.id}`, href: `/appointments/${appointment.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Appointment #${appointment.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href="/appointments">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Appointment Details</h1>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2">
                                <User className="text-muted-foreground h-4 w-4" />
                                <span className="font-medium">{appointment.patient?.name}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Doctor Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2">
                                <User className="text-muted-foreground h-4 w-4" />
                                <span className="font-medium">{appointment.doctor?.name || 'N/A'}</span>
                            </div>
                            <p className="text-muted-foreground text-sm">Department: {appointment.department?.name || 'N/A'}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="text-muted-foreground h-4 w-4" />
                                <span>{appointment.appointment_date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="text-muted-foreground h-4 w-4" />
                                <span>{appointment.appointment_time}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span
                                className={`rounded-full px-3 py-1 text-sm font-medium ${
                                    appointment.status === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : appointment.status === 'cancelled'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-blue-100 text-blue-800'
                                }`}
                            >
                                {appointment.status}
                            </span>
                            <p className="mt-2 text-sm">Type: {appointment.type}</p>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <p className="text-sm font-medium">Reason:</p>
                                <p className="text-muted-foreground text-sm">{appointment.reason || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Notes:</p>
                                <p className="text-muted-foreground text-sm">{appointment.notes || 'N/A'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-2">
                    <Link href={route('appointments.edit', appointment.id)}>
                        <Button>Edit</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
