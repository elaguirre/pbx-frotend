import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppModule, Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { useDatatable } from '@resources/hooks';
import { getMenuIconByLink } from '@resources/menu';
import { supplierService } from '@resources/services';
import { FormModal } from './FormModal';

export function Suppliers() {
    const { userCan } = useAuth();
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const { data, controls, loading, updateList } = useDatatable({
        service: supplierService,
        serviceParams: { include: 'entity' },
    });

    function openModal(formValues = {}) {
        showModal(<FormModal />, {
            formValues,
            onSave: updateList,
        });
    }

    async function handleDelete(row) {
        const name = row.entity?.name ?? `proveedor #${row.id}`;

        if (!(await confirm(`¿Eliminar al proveedor "${name}"?`, { danger: true }))) {
            return;
        }

        await supplierService.destroy(row.id);
        updateList();
    }

    const hasDropdownActions = userCan('suppliers.edit') || userCan('suppliers.delete');

    const columns = [
        { title: 'ID', column: 'id', isSortable: true },
        { title: 'Entidad', column: (row) => row.entity?.name ?? '—' },
        { title: 'RFC', column: (row) => row.entity?.rfc ?? '—' },
        ...(userCan('suppliers.view') || hasDropdownActions
            ? [
                  tableActionsColumn({
                      actions: [
                          {
                              label: 'Editar',
                              icon: IconPencil,
                              show: userCan('suppliers.edit'),
                              onClick: (row) => openModal(row),
                          },
                          {
                              label: 'Eliminar',
                              icon: IconTrash,
                              show: userCan('suppliers.delete'),
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
            title="Proveedores"
            description="Proveedores vinculados a entidades del tenant."
            icon={getMenuIconByLink('/suppliers')}
        >
            <Table
                name="suppliers-table"
                controls={controls}
                columns={columns}
                data={data}
                loading={loading}
                onRowView={(row) => navigate(`/suppliers/${row.id}`)}
                showRowView={userCan('suppliers.view')}
                headerRight={
                    userCan('suppliers.add') && (
                        <Button type="button" onClick={() => openModal()}>
                            + Nuevo proveedor
                        </Button>
                    )
                }
            />
        </AppModule>
    );
}
