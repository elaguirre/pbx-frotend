import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppModule, Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { formatCatalogCost } from '@resources/helpers';
import { useDatatable } from '@resources/hooks';
import { getMenuIconByLink } from '@resources/menu';
import { materialService } from '@resources/services';
import { FormModal } from './FormModal';

export function Materials() {
    const { userCan } = useAuth();
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const { data, controls, loading, updateList } = useDatatable({
        service: materialService,
    });

    function openModal(formValues = {}) {
        showModal(<FormModal />, {
            formValues,
            onSave: updateList,
        });
    }

    async function handleDelete(row) {
        if (!(await confirm(`¿Eliminar el material "${row.name}"?`, { danger: true }))) {
            return;
        }

        await materialService.destroy(row.id);
        updateList();
    }

    const hasDropdownActions = userCan('materials.edit') || userCan('materials.delete');

    const columns = [
        { title: 'ID', column: 'id', isSortable: true },
        { title: 'Nombre', column: 'name', isSortable: true },
        { title: 'Unidad', column: 'uom', isSortable: true },
        {
            title: 'Costo unit.',
            column: (row) => formatCatalogCost(row.cost),
        },
        ...(userCan('materials.view') || hasDropdownActions
            ? [
                  tableActionsColumn({
                      actions: [
                          {
                              label: 'Editar',
                              icon: IconPencil,
                              show: userCan('materials.edit'),
                              onClick: (row) => openModal(row),
                          },
                          {
                              label: 'Eliminar',
                              icon: IconTrash,
                              show: userCan('materials.delete'),
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
            title="Materiales"
            description="Materias primas usadas en las piezas."
            icon={getMenuIconByLink('/materials')}
        >
            <Table
                name="materials-table"
                controls={controls}
                columns={columns}
                data={data}
                loading={loading}
                onRowView={(row) => navigate(`/materials/${row.id}`)}
                showRowView={userCan('materials.view')}
                headerRight={
                    userCan('materials.add') && (
                        <Button type="button" onClick={() => openModal()}>
                            + Nuevo material
                        </Button>
                    )
                }
            />
        </AppModule>
    );
}
