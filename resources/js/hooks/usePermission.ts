import { usePage } from '@inertiajs/react';

interface AuthUser {
    permissions?: string[];
}

interface SharedProps {
    auth?: {
        user?: AuthUser | null;
    };
    [key: string]: unknown;
}

export function usePermission() {
    const { auth } = usePage<SharedProps>().props;

    const permissions: string[] =
        auth?.user?.permissions || [];

    const hasPermission = (permission: string) => {
        return permissions.includes(permission);
    };

    const hasAny = (list: string[]) => {
        return list.some(p => permissions.includes(p));
    };

    return {
        permissions,
        hasPermission,
        hasAny,
    };
}
