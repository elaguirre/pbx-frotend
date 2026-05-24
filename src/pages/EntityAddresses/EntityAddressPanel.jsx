import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Button, Table, TableActionsDropdown } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { getEntityAddressTypeLabel } from '@resources/constants/catalog';
import { useDatatable } from '@resources/hooks';
import { entityAddressService } from '@resources/services';
import { FormModal } from './FormModal';

function formatAddressLine(row) {
    const city = row.city?.name ?? '';
    const state = row.city?.state?.name ?? row.city?.state_name ?? '';
    const parts = [
        row.street,
        row.external_number,
        row.internal_number,
        row.suburb,
        city,
        state,
    ].filter(Boolean);

    return parts.join(', ') || '—';
}

export function EntityAddressPanel({ entityId }) {
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const { data, controls, loading, updateList } = useDatatable({
        service: entityAddressService,
        serviceParams: {
            entity_id: entityId,
            include: 'city.state',
        },
    });

    function openModal(formValues = {}) {
        showModal(<FormModal />, {
            formValues,
            entityId,
            onSave: updateList,
        });
    }

    async function handleDelete(row) {
        if (!(await confirm('¿Eliminar esta dirección?', { danger: true }))) {
            return;
        }

        await entityAddressService.destroy(row.id);
        updateList();
    }

    const hasRowActions = userCan('entity_addresses.edit') || userCan('entity_addresses.delete');

    const columns = [
        { title: 'ID', column: 'id', isSortable: true },
        { title: 'Tipo', column: (row) => getEntityAddressTypeLabel(row.type) },
        { title: 'Dirección', column: (row) => formatAddressLine(row) },
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
                                      show: userCan('entity_addresses.edit'),
                                      onClick: () => openModal(row),
                                  },
                                  {
                                      label: 'Eliminar',
                                      icon: IconTrash,
                                      show: userCan('entity_addresses.delete'),
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

    if (!userCan('entity_addresses.view')) {
        return (
            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                No tiene permiso para ver direcciones.
            </p>
        );
    }

    return (
        <Table
            name="entity-addresses"
            controls={controls}
            columns={columns}
            data={data}
            loading={loading}
            headerRight={
                userCan('entity_addresses.add') && (
                    <Button type="button" onClick={() => openModal()}>
                        + Nueva dirección
                    </Button>
                )
            }
        />
    );
}
