import { IconLogout } from '@tabler/icons-react';
import { AppModule, Button } from '@features/ui';
import { useAuth } from '@resources/contexts';
import { getMenuIconForPath } from '@resources/menu';

function DetailField({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{children}</dd>
        </div>
    );
}

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
