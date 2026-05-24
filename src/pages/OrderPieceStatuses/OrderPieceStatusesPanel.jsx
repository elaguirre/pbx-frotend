import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Button, Table, TableActionsDropdown } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { useDatatable } from '@resources/hooks';
import { getOrderPieceStatusRoleLabel } from '@resources/constants/orderPieceStatusRole';
import { orderPieceStatusService } from '@resources/services';
import { FormModal } from './FormModal';

export function OrderPieceStatusesPanel() {
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const { data, controls, loading, updateList } = useDatatable({
        service: orderPieceStatusService,
        serviceParams: { sort: 'order' },
    });

    function openModal(formValues = {}) {
        showModal(<FormModal />, {
            formValues,
            onSave: updateList,
        });
    }

    async function handleDelete(row) {
        if (!(await confirm(`¿Eliminar el estado "${row.name}"?`, { danger: true }))) {
            return;
        }

        await orderPieceStatusService.destroy(row.id);
        updateList();
    }

    const hasDropdownActions =
        userCan('order_piece_statuses.edit') || userCan('order_piece_statuses.delete');

    const columns = [
        { title: 'Orden', column: 'order' },
        { title: 'Nombre', column: 'name' },
        {
            title: 'Detalles',
            column: (row) => (
                <span className="line-clamp-2 max-w-md" title={row.details || ''}>
                    {row.details?.trim() || '—'}
                </span>
            ),
        },
        {
            title: 'Rol',
            column: (row) => getOrderPieceStatusRoleLabel(row.role),
        },
        ...(hasDropdownActions
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
                                      show: userCan('order_piece_statuses.edit'),
                                      onClick: () => openModal(row),
                                  },
                                  {
                                      label: 'Eliminar',
                                      icon: IconTrash,
                                      show: userCan('order_piece_statuses.delete'),
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
        <Table
            name="order-piece-statuses-table"
            controls={controls}
            columns={columns}
            data={data}
            loading={loading}
            headerRight={
                userCan('order_piece_statuses.add') && (
                    <Button type="button" onClick={() => openModal()}>
                        + Nuevo estado
                    </Button>
                )
            }
        />
    );
}
