import { IconPencil, IconShoppingCart, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppModule, Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { useDatatable } from '@resources/hooks';
import { useAppStore } from '@resources/store';
import { getMenuIconByLink } from '@resources/menu';
import { clientService } from '@resources/services';
import { FormModal } from './FormModal';

export function Clients() {
    const { userCan } = useAuth();
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const startOrder = useAppStore((state) => state.startOrder);
    const fetchCurrentOrder = useAppStore((state) => state.fetchCurrentOrder);
    const { data, controls, loading, updateList } = useDatatable({
        service: clientService,
        serviceParams: { include: 'entity' },
    });

    function openModal(formValues = {}) {
        showModal(<FormModal />, {
            formValues,
            onSave: updateList,
        });
    }

    async function handleDelete(row) {
        const name = row.entity?.name ?? `cliente #${row.id}`;

        if (!(await confirm(`¿Eliminar al cliente "${name}"?`, { danger: true }))) {
            return;
        }

        await clientService.destroy(row.id);
        updateList();
    }

    async function handleStartOrder(row) {
        if (!(await confirm(`¿Iniciar pedido para "${row.entity?.name}"?`))) {
            return;
        }

        await startOrder(row.id);
        await fetchCurrentOrder();
        navigate('/products');
    }

    const hasDropdownActions =
        userCan('clients.edit') ||
        userCan('clients.delete') ||
        userCan('orders.add');

    const columns = [
        { title: 'ID', column: 'id', isSortable: true },
        { title: 'Entidad', column: (row) => row.entity?.name ?? '—' },
        { title: 'RFC', column: (row) => row.entity?.rfc ?? '—' },
        { title: 'Plazo (días)', column: 'term_in_days', isSortable: true },
        ...(hasDropdownActions
            ? [
                  tableActionsColumn({
                      actions: [
                          {
                              label: 'Iniciar pedido',
                              icon: IconShoppingCart,
                              show: userCan('orders.add'),
                              onClick: (row) => handleStartOrder(row),
                          },
                          {
                              label: 'Editar',
                              icon: IconPencil,
                              show: userCan('clients.edit'),
                              onClick: (row) => openModal(row),
                          },
                          {
                              label: 'Eliminar',
                              icon: IconTrash,
                              show: userCan('clients.delete'),
                              danger: true,
                              onClick: (row) => handleDelete(row),
                          },
                      ],
                  }),
              ]
            : []),
    ];

    return (
        <AppModule
            title="Clientes"
            description="Clientes del tenant con plazo de crédito en días."
            icon={getMenuIconByLink('/clients')}
        >
            <Table
                name="clients-table"
                controls={controls}
                columns={columns}
                data={data}
                loading={loading}
                onRowView={(row) => navigate(`/clients/${row.id}`)}
                showRowView={userCan('clients.view')}
                headerRight={
                    userCan('clients.add') && (
                        <Button type="button" onClick={() => openModal()}>
                            + Nuevo cliente
                        </Button>
                    )
                }
            />
        </AppModule>
    );
}
