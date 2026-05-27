import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { getEntityTypeLabel } from '@resources/constants/catalog';
import { getMainImageUrl } from '@resources/helpers';
import { useDatatable } from '@resources/hooks';
import { entityService } from '@resources/services';
import { FormModal } from './FormModal';

export function EntitiesPanel() {
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const { data, controls, loading, updateList } = useDatatable({
        service: entityService,
    });

    function openModal(formValues = {}) {
        showModal(<FormModal />, {
            formValues,
            onSave: updateList,
        });
    }

    async function handleDelete(row) {
        if (!(await confirm(`¿Eliminar la entidad "${row.name}"?`, { danger: true }))) {
            return;
        }

        await entityService.destroy(row.id);
        updateList();
    }

    const hasRowActions = userCan('entities.edit') || userCan('entities.delete');

    const columns = [
        { title: 'ID', column: 'id', isSortable: true },
        {
            title: 'Imagen',
            column: (row) => {
                const mainImageUrl = getMainImageUrl(row.images);

                return mainImageUrl ? (
                    <img src={mainImageUrl} alt={row.name} className="h-10 w-10 rounded object-cover" />
                ) : (
                    <span className="text-slate-400">—</span>
                );
            },
        },
        { title: 'Nombre', column: 'name', isSortable: true },
        { title: 'RFC', column: (row) => row.rfc || '—' },
        { title: 'Tipo', column: (row) => getEntityTypeLabel(row.type) },
        ...(userCan('entities.view') || hasRowActions
            ? [
                  tableActionsColumn({
                      actions: [
                          {
                              label: 'Editar',
                              icon: IconPencil,
                              show: userCan('entities.edit'),
                              onClick: (row) => openModal(row),
                          },
                          {
                              label: 'Eliminar',
                              icon: IconTrash,
                              show: userCan('entities.delete'),
                              danger: true,
                              onClick: (row) => handleDelete(row),
                          },
                      ],
                  }),
              ]
            : []),
    ];

    return (
        <Table
            name="entities-table"
            controls={controls}
            columns={columns}
            data={data}
            loading={loading}
            onRowView={(row) => navigate(`/entities/${row.id}`)}
            showRowView={userCan('entities.view')}
            headerRight={
                userCan('entities.add') && (
                    <Button type="button" onClick={() => openModal()}>
                        + Nueva entidad
                    </Button>
                )
            }
        />
    );
}
