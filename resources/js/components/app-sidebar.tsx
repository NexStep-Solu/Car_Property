import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { NavMain } from '@/components/nav-main';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import { usePermission } from '@/hooks/usePermission';
import { type NavGroup, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, BookOpen, Car, CreditCard, FileText, Flag, Key, LayoutDashboard, Package, Radio, ScrollText, Settings, Shield, Store, UserCheck, Users } from 'lucide-react';
import AppLogo from './app-logo';

interface SidebarAuth {
    user?: { roles?: string[] } | null;
}

export function AppSidebar() {
    const { hasPermission, hasAny } = usePermission();
    const { auth } = usePage().props as unknown as { auth?: SidebarAuth };
    const isSuperAdmin = auth?.user?.roles?.includes('super_admin') ?? false;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'Showrooms',
            href: '/showrooms',
            icon: Store,
        },
        {
            title: 'Applications',
            href: '/applications',
            icon: FileText,
        },
        {
            title: 'Cars',
            href: '/cars',
            icon: Car,
        },
        {
            title: 'Catalogue',
            href: '/catalogue',
            icon: BookOpen,
        },
        {
            title: 'Sellers',
            href: '/seller-applications',
            icon: UserCheck,
        },
        {
            title: 'Reports',
            href: '/reports',
            icon: Flag,
        },
        {
            title: 'Notifications',
            href: '/notifications',
            icon: Bell,
        },
        {
            title: 'Packages',
            href: '/packages',
            icon: Package,
        },
        {
            title: 'Subscriptions',
            href: '/subscriptions',
            icon: CreditCard,
        },
        ...(isSuperAdmin
            ? [
                  {
                      title: 'Webhooks',
                      href: '/webhooks',
                      icon: Radio,
                  },
              ]
            : []),
    ];

    const adminNavItems: NavItem[] = [
        { title: 'Users', href: '/users', icon: Users, permission: 'view_users' },
        { title: 'Roles', href: '/roles', icon: Shield, permission: 'view_roles' },
        { title: 'Permissions', href: '/permissions', icon: Key, permission: 'view_permissions' },
        { title: 'System Settings', href: '/admin/settings', icon: Settings, permission: 'manage settings' },
        { title: 'Audit Logs', href: '/audit-logs', icon: ScrollText, permission: 'view audit logs' },
    ].filter((item) => hasPermission((item as NavItem & { permission: string }).permission)) as NavItem[];

    const footerNavItems: NavItem[] = [];

    const navGroups: NavGroup[] = [];

    const hasAdminPermission = hasAny(['view_users', 'view_roles', 'view_permissions', 'manage settings', 'view audit logs']);

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
                            <Link href="/dashboard" prefetch>
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
