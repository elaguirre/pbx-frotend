import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppModule, Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { useDatatable } from '@resources/hooks';
import { getMenuIconByLink } from '@resources/menu';
import { manufacturerService } from '@resources/services';
import { FormModal } from './FormModal';

export function Manufacturers() {
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const { data, controls, loading, updateList } = useDatatable({
        service: manufacturerService,
        serviceParams: { include: 'entity' },
    });

    function openModal(formValues = {}) {
        showModal(<FormModal />, {
            formValues,
            onSave: updateList,
        });
    }

    async function handleDelete(row) {
        const name = row.entity?.name ?? `maquilador #${row.id}`;

        if (!(await confirm(`¿Eliminar al maquilador "${name}"?`, { danger: true }))) {
            return;
        }

        await manufacturerService.destroy(row.id);
        updateList();
    }

    const hasDropdownActions = userCan('manufacturers.edit') || userCan('manufacturers.delete');

    const columns = [
        { title: 'ID', column: 'id', isSortable: true },
        { title: 'Entidad', column: (row) => row.entity?.name ?? '—' },
        { title: 'RFC', column: (row) => row.entity?.rfc ?? '—' },
        ...(userCan('manufacturers.view') || hasDropdownActions
            ? [
                  tableActionsColumn({
                      actions: [
                          {
                              label: 'Editar',
                              icon: IconPencil,
                              show: userCan('manufacturers.edit'),
                              onClick: (row) => openModal(row),
                          },
                          {
                              label: 'Eliminar',
                              icon: IconTrash,
                              show: userCan('manufacturers.delete'),
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
            title="Maquiladores"
            description="Maquiladores vinculados a entidades del tenant."
            icon={getMenuIconByLink('/manufacturers')}
        >
            <Table
                name="manufacturers-table"
                controls={controls}
                columns={columns}
                data={data}
                loading={loading}
                onRowView={(row) => navigate(`/manufacturers/${row.id}`)}
                showRowView={userCan('manufacturers.view')}
                headerRight={
                    userCan('manufacturers.add') && (
                        <Button type="button" onClick={() => openModal()}>
                            + Nuevo maquilador
                        </Button>
                    )
                }
            />
        </AppModule>
    );
}
