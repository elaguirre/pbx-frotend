import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppModule, Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { formatCatalogCost, formatQuantity } from '@resources/helpers';
import { useDatatable } from '@resources/hooks';
import { getMenuIconByLink } from '@resources/menu';
import { pieceService } from '@resources/services';
import { FormModal } from './FormModal';

export function Pieces() {
    const { userCan } = useAuth();
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const { data, controls, loading, updateList } = useDatatable({
        service: pieceService,
    });

    function openModal(formValues = {}) {
        showModal(<FormModal />, {
            formValues,
            onSave: updateList,
        });
    }

    async function handleDelete(row) {
        if (!(await confirm(`¿Eliminar la pieza "${row.name}"?`, { danger: true }))) {
            return;
        }

        await pieceService.destroy(row.id);
        updateList();
    }

    const hasDropdownActions = userCan('pieces.edit') || userCan('pieces.delete');

    const columns = [
        { title: 'ID', column: 'id', isSortable: true },
        { title: 'Nombre', column: 'name', isSortable: true },
        {
            title: 'Volumen (m³)',
            column: (row) => (row.volume != null ? formatQuantity(row.volume) : '—'),
            isSortable: true,
        },
        {
            title: 'Peso (kg)',
            column: (row) => (row.weight != null ? formatQuantity(row.weight) : '—'),
            isSortable: true,
        },
        { title: 'Costo', column: (row) => formatCatalogCost(row.cost) },
        ...(userCan('pieces.view') || hasDropdownActions
            ? [
                  tableActionsColumn({
                      actions: [
                          {
                              label: 'Editar',
                              icon: IconPencil,
                              show: userCan('pieces.edit'),
                              onClick: (row) => openModal(row),
                          },
                          {
                              label: 'Eliminar',
                              icon: IconTrash,
                              show: userCan('pieces.delete'),
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
            title="Piezas"
            description="Componentes individuales asignables a productos."
            icon={getMenuIconByLink('/pieces')}
        >
            <Table
                name="pieces-table"
                controls={controls}
                columns={columns}
                data={data}
                loading={loading}
                onRowView={(row) => navigate(`/pieces/${row.id}`)}
                showRowView={userCan('pieces.view')}
                headerRight={
                    userCan('pieces.add') && (
                        <Button type="button" onClick={() => openModal()}>
                            + Nueva pieza
                        </Button>
                    )
                }
            />
        </AppModule>
    );
}
