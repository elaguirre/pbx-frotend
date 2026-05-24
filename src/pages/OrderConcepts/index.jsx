import { IconPencil, IconTrash } from '@tabler/icons-react';
import { AppModule, Button, Table, TableActionsDropdown } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { formatMoney } from '@resources/helpers';
import { useDatatable } from '@resources/hooks';
import { getMenuIconForPath } from '@resources/menu';
import { orderConceptService } from '@resources/services';
import { FormModal } from './FormModal';

export function OrderConcepts() {
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const { data, controls, loading, updateList } = useDatatable({
        service: orderConceptService,
        serviceParams: { include: 'order,product' },
    });

    function openModal(formValues = {}) {
        showModal(<FormModal />, {
            formValues,
            onSave: updateList,
        });
    }

    async function handleDelete(row) {
        if (!(await confirm('¿Eliminar este concepto?', { danger: true }))) {
            return;
        }

        await orderConceptService.destroy(row.id);
        updateList();
    }

    const hasRowActions = userCan('order_concepts.edit') || userCan('order_concepts.delete');

    const columns = [
        { title: 'ID', column: 'id', isSortable: true },
        { title: 'Pedido', column: (row) => row.order_id },
        { title: 'Producto', column: (row) => row.product?.name ?? row.product_id },
        { title: 'Cantidad', column: 'quantity', isSortable: true },
        { title: 'Precio', column: (row) => formatMoney(row.price) },
        ...(hasRowActions
            ? [
                  {
                      title: 'Acciones',
                      align: 'right',
                      column: (row) => (
                          <TableActionsDropdown
                              actions={[
                                  {
                                      label: 'Editar',
                                      icon: IconPencil,
                                      show: userCan('order_concepts.edit'),
                                      onClick: () => openModal(row),
                                  },
                                  {
                                      label: 'Eliminar',
                                      icon: IconTrash,
                                      show: userCan('order_concepts.delete'),
                                      danger: true,
                                      onClick: () => handleDelete(row),
                                  },
                              ]}
                          />
                      ),
                  },
              ]
            : []),
    ];

    return (
        <AppModule
            title="Conceptos de pedido"
            description="Líneas de pedido (productos, cantidades y precios)."
            icon={getMenuIconForPath('/order-concepts')}
        >
            <Table
                name="order-concepts-table"
                controls={controls}
                columns={columns}
                data={data}
                loading={loading}
                headerRight={
                    userCan('order_concepts.add') && (
                        <Button type="button" onClick={() => openModal()}>
                            + Nuevo concepto
                        </Button>
                    )
                }
            />
        </AppModule>
    );
}
