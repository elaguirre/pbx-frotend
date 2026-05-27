import { IconLogout } from '@tabler/icons-react';
import { AppModule, Button, DetailField } from '@features/ui';
import { useAuth } from '@resources/contexts';
import { getMenuIconForPath } from '@resources/menu';

export function Profile() {
    const { user, logout } = useAuth();

    return (
        <AppModule
            title="Mi perfil"
            description="Datos de tu cuenta en el tenant."
            icon={getMenuIconForPath('/profile')}
        >
            <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
                <DetailField label="Nombre">{user?.full_name ?? '—'}</DetailField>
                <DetailField label="Correo">{user?.email ?? '—'}</DetailField>
                <DetailField label="Rol">{user?.role?.title ?? user?.role?.name ?? '—'}</DetailField>
            </dl>

            <div className="mt-6">
                <Button type="button" variant="danger" icon={IconLogout} onClick={logout}>
                    Cerrar sesión
                </Button>
            </div>
        </AppModule>
    );
}
