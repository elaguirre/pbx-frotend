import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Button, Table, TableActionsDropdown } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { getContactDataTypeLabel } from '@resources/constants/catalog';
import { useDatatable } from '@resources/hooks';
import { contactDataService } from '@resources/services';
import { FormModal } from './FormModal';

export function ContactDataPanel({ entityId }) {
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const { data, controls, loading, updateList } = useDatatable({
        service: contactDataService,
        serviceParams: entityId ? { entity_id: entityId } : { include: 'entity' },
    });

    function openModal(formValues = {}) {
        showModal(<FormModal />, {
            formValues,
            entityId,
            onSave: updateList,
        });
    }

    async function handleDelete(row) {
        if (!(await confirm('¿Eliminar este dato de contacto?', { danger: true }))) {
            return;
        }

        await contactDataService.destroy(row.id);
        updateList();
    }

    const hasRowActions = userCan('contact_data.edit') || userCan('contact_data.delete');

    const columns = [
        { title: 'ID', column: 'id', isSortable: true },
        ...(!entityId
            ? [{ title: 'Entidad', column: (row) => row.entity?.name ?? '—' }]
            : []),
        { title: 'Tipo', column: (row) => getContactDataTypeLabel(row.type) },
        { title: 'Valor', column: 'value', isSortable: true },
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
                                      show: userCan('contact_data.edit'),
                                      onClick: () => openModal(row),
                                  },
                                  {
                                      label: 'Eliminar',
                                      icon: IconTrash,
                                      show: userCan('contact_data.delete'),
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

    if (!userCan('contact_data.view')) {
        return (
            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                No tiene permiso para ver datos de contacto.
            </p>
        );
    }

    return (
        <Table
            name={entityId ? `entity-${entityId}-contact-data` : 'contact-data-table'}
            controls={controls}
            columns={columns}
            data={data}
            loading={loading}
            headerRight={
                userCan('contact_data.add') && (
                    <Button type="button" onClick={() => openModal(entityId ? { entity_id: entityId } : {})}>
                        + Nuevo contacto
                    </Button>
                )
            }
        />
    );
}
