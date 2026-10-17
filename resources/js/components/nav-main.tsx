import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

function NavGroupCollapsible({ group, currentUrl }: { group: NavGroup; currentUrl: string }) {
    const [open, setOpen] = useState(true);
    const isActive = group.items.some((item) => item.href === currentUrl);

    return (
        <SidebarGroup key={group.title} className="px-2 py-1">
            <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger asChild>
                    <div
                        className={`group hover:bg-sidebar-accent flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-xs font-semibold tracking-wide uppercase transition-all ${
                            isActive ? 'text-primary' : 'text-muted-foreground'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {group.icon && <group.icon className="h-4 w-4" />}
                            <span>{group.title}</span>
                        </div>
                        {open ? (
                            <ChevronDown className="h-4 w-4 transition-transform" />
                        ) : (
                            <ChevronRight className="h-4 w-4 transition-transform" />
                        )}
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenu className="mt-1">
                        {group.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={item.href === currentUrl}
                                    tooltip={{ children: item.title }}
                                    className="h-9 w-full justify-start text-sm"
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon className="h-4 w-4" />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </CollapsibleContent>
            </Collapsible>
        </SidebarGroup>
    );
}

export function NavMain({ items = [], groups = [] }: { items?: NavItem[]; groups?: NavGroup[] }) {
    const page = usePage();    return (
        <>
            {items.length > 0 && (
                <SidebarGroup className="px-2 py-1">
                    <SidebarGroupLabel className="text-muted-foreground text-xs font-semibold uppercase">Navigation</SidebarGroupLabel>
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={item.href === page.url}
                                    tooltip={{ children: item.title }}
                                    className="hover:bg-sidebar-accent"
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon className="h-4 w-4" />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            )}

            {groups.map((group) => (
                <NavGroupCollapsible key={group.title} group={group} currentUrl={page.url} />
            ))}
        </>
    );
}
