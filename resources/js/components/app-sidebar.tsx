import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { usePermission } from '@/hooks/usePermission';
import { type NavGroup, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Banknote,
    Bed,
    Bell,
    Building2,
    CalendarCheck,
    Clock,
    FileText,
    FlaskConical,
    HeartPulse,
    Key,
    LayoutDashboard,
    MapPin,
    Microscope,
    Package,
    Pill,
    Receipt,
    ScanHeart,
    Settings,
    Shield,
    ShoppingCart,
    Stethoscope,
    Store,
    Truck,
    Users,
    Warehouse,

} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const page = usePage();
    const { hasPermission, hasAny } = usePermission();

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
        },
    ];

    const patientNavItems: NavItem[] = [{ title: 'Patients', href: '/patients', icon: HeartPulse, permission: 'view_patients' }].filter((item) =>
        hasPermission((item as NavItem & { permission: string }).permission),
    ) as NavItem[];

    const clinicalNavItems: NavItem[] = [
        { title: 'Appointments', href: '/appointments', icon: CalendarCheck, permission: 'appointments.view' },
        { title: 'Doctor Schedules', href: '/doctor-schedules', icon: Clock, permission: 'doctor_schedules.view' },
        { title: 'Patient Queue', href: '/patient-queues', icon: Bell, permission: 'patient_queues.view' },
        { title: 'Services', href: '/services', icon: Stethoscope, permission: 'services.view' },
        { title: 'Billings', href: '/billings', icon: Receipt, permission: 'billings.view' },
        { title: 'Insurances', href: '/insurances', icon: Shield, permission: 'insurances.view' },
        { title: 'Lab Tests', href: '/lab-tests', icon: FlaskConical, permission: 'lab_tests.view' },
        { title: 'Prescriptions', href: '/prescriptions', icon: Microscope, permission: 'prescriptions.view' },
        { title: 'Vitals', href: '/vitals', icon: Activity, permission: 'vitals.view' },
        { title: 'Medical Records', href: '/medical-records', icon: FileText, permission: 'medical_records.view' },
        { title: 'OPD Records', href: '/opd-records', icon: Stethoscope, permission: 'opd_records.view' },
    ].filter((item) => hasPermission((item as NavItem & { permission: string }).permission)) as NavItem[];

    const inpatientNavItems: NavItem[] = [
        { title: 'IPD Records', href: '/ipd-records', icon: Bed, permission: 'ipd_records.view' },
        { title: 'Operation Theater', href: '/operation-theaters', icon: Building2, permission: 'operation_theatres.view' },
        { title: 'Surgery Schedules', href: '/surgery-schedules', icon: ScanHeart, permission: 'surgery_schedules.view' },
    ].filter((item) => hasPermission((item as NavItem & { permission: string }).permission)) as NavItem[];

    const roomNavItems: NavItem[] = [
        { title: 'Room Types', href: '/room_types', icon: Building2, permission: 'view_room_types' },
        { title: 'Rooms', href: '/rooms', icon: Bed, permission: 'view_rooms' },
        { title: 'Beds', href: '/beds', icon: Activity, permission: 'view_beds' },
    ].filter((item) => hasPermission((item as NavItem & { permission: string }).permission)) as NavItem[];

    const pharmacyNavItems: NavItem[] = [
        { title: 'Suppliers', href: '/suppliers', icon: Truck, permission: 'view_suppliers' },
        { title: 'Medicine Categories', href: '/medicine-categories', icon: Package, permission: 'view_medicine_categories' },
        { title: 'Medicines', href: '/medicines', icon: Pill, permission: 'view_medicines' },
        { title: 'Inventory', href: '/inventory', icon: Warehouse, permission: 'view_inventory' },
        { title: 'Stock Movements', href: '/stock-movements', icon: ShoppingCart, permission: 'view_stock_movements' },
        { title: 'Purchase Orders', href: '/purchase-orders', icon: Store, permission: 'view_purchase_orders' },
    ].filter((item) => hasPermission((item as NavItem & { permission: string }).permission)) as NavItem[];

    const setupNavItems: NavItem[] = [
        { title: 'Currency', href: '/currencies', icon: Banknote, permission: 'view_currencies' },
        { title: 'Departments', href: '/departments', icon: Building2, permission: 'view_departments' },
        { title: 'Locations', href: '/locations', icon: MapPin, permission: 'view_locations' },
        { title: 'Branches', href: '/branches', icon: Building2, permission: 'view_branches' },
    ].filter((item) => hasPermission((item as NavItem & { permission: string }).permission)) as NavItem[];

    const adminNavItems: NavItem[] = [
        { title: 'Users', href: '/users', icon: Users, permission: 'view_users' },
        { title: 'Roles', href: '/roles', icon: Shield, permission: 'view_roles' },
        { title: 'Permissions', href: '/permissions', icon: Key, permission: 'view_permissions' },
    ].filter((item) => hasPermission((item as NavItem & { permission: string }).permission)) as NavItem[];

    const footerNavItems: NavItem[] = [];

    const navGroups: NavGroup[] = [];

    const hasPatientPermission = hasAny(['view_patients']);
    const hasClinicalPermission = hasAny([
        'appointments.view',
        'services.view',
        'billings.view',
        'insurances.view',
        'lab_tests.view',
        'prescriptions.view',
        'vitals.view',
        'medical_records.view',
    ]);
    const hasInpatientPermission = hasAny(['ipd_records.view']);
    const hasRoomPermission = hasAny(['view_room_types', 'view_rooms', 'view_beds']);
    const hasPharmacyPermission = hasAny([
        'view_suppliers',
        'view_medicine_categories',
        'view_medicines',
        'view_inventory',
        'view_stock_movements',
        'view_purchase_orders',
    ]);
    const hasSetupPermission = hasAny(['view_currencies', 'view_departments', 'view_locations', 'view_branches']);
    const hasAdminPermission = hasAny(['view_users', 'view_roles', 'view_permissions']);

    // if (hasPatientPermission && patientNavItems.length > 0) {
    //     navGroups.push({
    //         title: 'Patient Management',
    //         items: patientNavItems,
    //         icon: HeartPulse,
    //     });
    // }

    // if (hasClinicalPermission && clinicalNavItems.length > 0) {
    //     navGroups.push({
    //         title: 'Clinical Services',
    //         items: clinicalNavItems,
    //         icon: Stethoscope,
    //     });
    // }

    // if (hasInpatientPermission && inpatientNavItems.length > 0) {
    //     navGroups.push({
    //         title: 'Inpatient Management',
    //         items: inpatientNavItems,
    //         icon: Bed,
    //     });
    // }

    // if (hasRoomPermission && roomNavItems.length > 0) {
    //     navGroups.push({
    //         title: 'Room & Bed Management',
    //         items: roomNavItems,
    //         icon: Building2,
    //     });
    // }

    if (hasPharmacyPermission && pharmacyNavItems.length > 0) {
        navGroups.push({
            title: 'Pharmacy Management',
            items: pharmacyNavItems,
            icon: Pill,
        });
    }

    if (hasSetupPermission && setupNavItems.length > 0) {
        navGroups.push({
            title: 'Setup & Configuration',
            items: setupNavItems,
            icon: Settings,
        });
    }

    if (hasAdminPermission && adminNavItems.length > 0) {
        navGroups.push({
            title: 'Administration',
            items: adminNavItems,
            icon: Users,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
