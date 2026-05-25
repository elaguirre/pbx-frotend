import { useNavigate } from 'react-router-dom';
import { AppModule, Badge, Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { getOrderStatusBadgeProps } from '@resources/constants/orders';
import { formatDate } from '@resources/helpers';
import { useDatatable } from '@resources/hooks';
import { getMenuIconByLink } from '@resources/menu';
import { orderService } from '@resources/services';
import { StartOrderModal } from './StartOrderModal';

export function Orders() {
    const { userCan } = useAuth();
    const navigate = useNavigate();
    const { showModal } = useGlobalModals();
    const { data, controls, loading, updateList } = useDatatable({
        service: orderService,
        serviceParams: { include: 'client.entity,user' },
    });

    function openStartOrderModal() {
        showModal(<StartOrderModal />, {
            onSave: () => {
                updateList();
                navigate('/products');
            },
        });
    }

    const columns = [
        { title: 'ID', column: 'id', isSortable: true },
        { title: 'Cliente', column: (row) => row.client?.entity?.name ?? '—' },
        { title: 'Usuario', column: (row) => row.user?.full_name ?? '—' },
        {
            title: 'Estado',
            column: (row) => <Badge {...getOrderStatusBadgeProps(row.status)} />,
        },
        { title: 'Creado', column: (row) => formatDate(row.created_at), isSortable: true },
        ...(userCan('orders.view')
            ? [
                  tableActionsColumn({
                      title: '',
                      actions: [],
                  }),
              ]
            : []),
    ];

    return (
        <AppModule
            title="Pedidos"
            description="Historial de pedidos del tenant."
            icon={getMenuIconByLink('/orders')}
        >
            <Table
                name="orders-table"
                controls={controls}
                columns={columns}
                data={data}
                loading={loading}
                onRowView={(row) => navigate(`/orders/${row.id}`)}
                showRowView={userCan('orders.view')}
                headerRight={
                    userCan('orders.add') && (
                        <Button type="button" onClick={openStartOrderModal}>
                            + Nuevo pedido
                        </Button>
                    )
                }
            />
        </AppModule>
    );
}
