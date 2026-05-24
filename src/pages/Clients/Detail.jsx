import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppModule, Badge, Button, Table, Tabs } from '@features/ui';
import { ContactDataPanel } from '@pages/ContactData/ContactDataPanel';
import { EntityAddressPanel } from '@pages/EntityAddresses/EntityAddressPanel';
import { getEntityTypeLabel } from '@resources/constants/catalog';
import { getOrderStatusBadgeProps } from '@resources/constants/orders';
import { formatDate } from '@resources/helpers';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { useDatatable, useSectionIcon } from '@resources/hooks';
import { clientService, orderService } from '@resources/services';
import { FormModal } from './FormModal';

function DetailField({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{children}</dd>
        </div>
    );
}

export function ClientDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { showModal } = useGlobalModals();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(() =>
        userCan('orders.view') ? 'orders' : 'contact',
    );

    const entityId = client?.entity_id ?? client?.entity?.id;

    const canViewOrders = userCan('orders.view');

    const {
        data: ordersData,
        controls: ordersControls,
        loading: ordersLoading,
    } = useDatatable({
        service: canViewOrders ? orderService : null,
        serviceParams: {
            include: 'user',
            client_id: id,
        },
    });

    useEffect(() => {
        setLoading(true);

        clientService
            .get(id, { include: 'entity' })
            .then(setClient)
            .catch(() => setClient(null))
            .finally(() => setLoading(false));
    }, [id]);

    function refreshClient() {
        return clientService.get(id, { include: 'entity' }).then(setClient);
    }

    function openEditModal() {
        showModal(<FormModal />, {
            formValues: client,
            onSave: refreshClient,
        });
    }

    if (loading) {
        return (
            <AppModule icon={sectionIcon}
                title="Cargando cliente…"
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate('/clients')}>
                        Volver a clientes
                    </Button>
                }
            />
        );
    }

    if (!client) {
        return (
            <AppModule icon={sectionIcon}
                title="Cliente no encontrado"
                description="El cliente solicitado no existe o no tiene permiso para verlo."
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate('/clients')}>
                        Volver a clientes
                    </Button>
                }
            />
        );
    }

    const entity = client.entity;

    const orderColumns = [
        { title: 'ID', column: 'id', isSortable: true },
        { title: 'Usuario', column: (row) => row.user?.full_name ?? row.user?.email ?? '—' },
        {
            title: 'Estado',
            column: (row) => <Badge {...getOrderStatusBadgeProps(row.status)} />,
        },
        {
            title: 'Creado',
            column: (row) => formatDate(row.created_at),
            isSortable: true,
        },
    ];

    const ordersTabContent = canViewOrders ? (
        <Table
            name="client-orders"
            controls={ordersControls}
            columns={orderColumns}
            data={ordersData}
            loading={ordersLoading}
            onRowView={(row) => navigate(`/orders/${row.id}`)}
            showRowView={userCan('orders.view')}
        />
    ) : (
        <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            No tiene permiso para ver pedidos.
        </p>
    );

    const contactTabContent = (
        <div className="space-y-3">
            <p className="text-sm text-slate-500">
                Correos, teléfonos y WhatsApp asociados a esta entidad.
            </p>
            <ContactDataPanel entityId={entityId} />
        </div>
    );

    const addressesTabContent = (
        <div className="space-y-3">
            <p className="text-sm text-slate-500">
                Domicilios, facturación, envío y otras direcciones de la entidad.
            </p>
            <EntityAddressPanel entityId={entityId} />
        </div>
    );

    const tabs = [
        ...(canViewOrders
            ? [
                  {
                      id: 'orders',
                      label: 'Pedidos',
                      content: ordersTabContent,
                  },
              ]
            : []),
        {
            id: 'contact',
            label: 'Contacto',
            content: contactTabContent,
        },
        ...(userCan('entity_addresses.view')
            ? [
                  {
                      id: 'addresses',
                      label: 'Direcciones',
                      content: addressesTabContent,
                  },
              ]
            : []),
    ];

    return (
        <AppModule icon={sectionIcon}
            title={entity?.name ?? `Cliente #${client.id}`}
            description="Pedidos, contacto y direcciones del cliente."
            onEdit={userCan('clients.edit') && client ? openEditModal : undefined}
            toolbar={
                <Button type="button" variant="secondary" onClick={() => navigate('/clients')}>
                    Volver a clientes
                </Button>
            }
        >
            <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
                <DetailField label="ID cliente">{client.id}</DetailField>
                <DetailField label="Plazo (días)">{client.term_in_days}</DetailField>
                <DetailField label="RFC">{entity?.rfc || '—'}</DetailField>
                <DetailField label="Tipo">{getEntityTypeLabel(entity?.type)}</DetailField>
                <DetailField label="Registrado">{formatDate(client.created_at)}</DetailField>
            </dl>

            {entity?.image && (
                <div className="mt-4">
                    <img
                        src={entity.image}
                        alt={entity.name}
                        className="h-24 w-24 rounded-lg object-cover"
                    />
                </div>
            )}

            <div className="mt-6">
                {tabs.length > 1 ? (
                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                ) : (
                    tabs[0]?.content
                )}
            </div>
        </AppModule>
    );
}
