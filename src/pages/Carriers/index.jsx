import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppModule, Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { useDatatable } from '@resources/hooks';
import { getMenuIconByLink } from '@resources/menu';
import { carrierService } from '@resources/services';
import { FormModal } from './FormModal';

export function Carriers() {
    const { userCan } = useAuth();
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const { data, controls, loading, updateList } = useDatatable({
        service: carrierService,
        serviceParams: { include: 'entity' },
    });

    function openModal(formValues = {}) {
        showModal(<FormModal />, {
            formValues,
            onSave: updateList,
        });
    }

    async function handleDelete(row) {
        const name = row.entity?.name ?? `transportista #${row.id}`;

        if (!(await confirm(`¿Eliminar al transportista "${name}"?`, { danger: true }))) {
            return;
        }

        await carrierService.destroy(row.id);
        updateList();
    }

    const hasDropdownActions = userCan('carriers.edit') || userCan('carriers.delete');

    const columns = [
        { title: 'ID', column: 'id', isSortable: true },
        { title: 'Entidad', column: (row) => row.entity?.name ?? '—' },
        { title: 'RFC', column: (row) => row.entity?.rfc ?? '—' },
        ...(hasDropdownActions
            ? [
                  tableActionsColumn({
                      actions: [
                          {
                              label: 'Editar',
                              icon: IconPencil,
                              show: userCan('carriers.edit'),
                              onClick: (row) => openModal(row),
                          },
                          {
                              label: 'Eliminar',
                              icon: IconTrash,
                              show: userCan('carriers.delete'),
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
            title="Transportistas"
            description="Personas o compañías contratadas para el embarque de piezas."
            icon={getMenuIconByLink('/carriers')}
        >
            <Table
                name="carriers-table"
                controls={controls}
                columns={columns}
                data={data}
                loading={loading}
                onRowView={(row) => navigate(`/carriers/${row.id}`)}
                showRowView={userCan('carriers.view')}
                headerRight={
                    userCan('carriers.add') && (
                        <Button type="button" onClick={() => openModal()}>
                            + Nuevo transportista
                        </Button>
                    )
                }
            />
        </AppModule>
    );
}
