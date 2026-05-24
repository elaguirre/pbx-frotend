import { useEffect, useMemo, useState } from 'react';
import { AppModule, Tabs } from '@features/ui';
import { useAuth } from '@resources/contexts';
import { EntitiesPanel } from '@pages/Entities/EntitiesPanel';
import { OrderPieceStatusesPanel } from '@pages/OrderPieceStatuses/OrderPieceStatusesPanel';
import { UsersPanel } from '@pages/Users/UsersPanel';
import { getMenuIconByLink } from '@resources/menu';

export function Settings() {
    const { userCan } = useAuth();
    const canEntities = userCan('entities.view');
    const canStatuses = userCan('order_piece_statuses.view');
    const canUsers = userCan('users.view');

    const tabs = useMemo(
        () =>
            [
                canEntities && { id: 'entities', label: 'Entidades', content: <EntitiesPanel /> },
                canStatuses && {
                    id: 'order-piece-statuses',
                    label: 'Estados de pieza',
                    content: <OrderPieceStatusesPanel />,
                },
                canUsers && { id: 'users', label: 'Usuarios', content: <UsersPanel /> },
            ].filter(Boolean),
        [canEntities, canStatuses, canUsers],
    );

    const [activeTab, setActiveTab] = useState(() => tabs[0]?.id ?? 'entities');

    useEffect(() => {
        if (tabs.length > 0 && !tabs.some((tab) => tab.id === activeTab)) {
            setActiveTab(tabs[0].id);
        }
    }, [tabs, activeTab]);

    const resolvedActiveTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : tabs[0]?.id;

    if (tabs.length === 0) {
        return (
            <AppModule
                title="Configuración"
                description="No tiene permiso para ver las secciones de configuración."
                icon={getMenuIconByLink('/settings')}
            />
        );
    }

    return (
        <AppModule
            title="Configuración"
            description="Entidades, estados de pieza de pedido y usuarios del tenant."
            icon={getMenuIconByLink('/settings')}
        >
            {tabs.length > 1 ? (
                <Tabs tabs={tabs} activeTab={resolvedActiveTab} onTabChange={setActiveTab} />
            ) : (
                tabs[0].content
            )}
        </AppModule>
    );
}
