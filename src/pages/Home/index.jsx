import React from 'react';
import { useAuth, useConfig } from '@resources/contexts';

export function Home() {
    const { user } = useAuth();
    const { getConfig } = useConfig();

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold">Bienvenido a PBX</h1>
            <p className="mt-2 text-slate-600">
                Hola {user?.full_name}. Este es el esqueleto del nuevo SaaS multi-tenant.
            </p>
            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                    <dt className="text-slate-500">Aplicación</dt>
                    <dd className="font-medium">{getConfig('app.title', import.meta.env.VITE_APP_TITLE)}</dd>
                </div>
                <div>
                    <dt className="text-slate-500">Rol</dt>
                    <dd className="font-medium">{user?.role?.title || user?.role?.name}</dd>
                </div>
            </dl>
        </div>
    );
}
