import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconTrash } from '@tabler/icons-react';
import { AppModule, Button, CompletionProgressBar, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm } from '@resources/contexts';
import { formatDate } from '@resources/helpers';
import { useDatatable } from '@resources/hooks';
import { getMenuIconByLink } from '@resources/menu';
import { productionBatchService } from '@resources/services';

export function ProductionBatches() {
    const { userCan } = useAuth();
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const [creating, setCreating] = useState(false);
    const { data, controls, loading, updateList } = useDatatable({
        service: productionBatchService,
        serviceParams: { with_production_orders_count: true },
    });

    async function handleCreate() {
        if (!(await confirm('¿Crear un nuevo lote de producción?'))) {
            return;
        }

        setCreating(true);

        try {
            await productionBatchService.store();
            updateList();
        } finally {
            setCreating(false);
        }
    }

    async function handleDelete(row) {
        if (!(await confirm(`¿Eliminar el lote de producción #${row.id}?`, { danger: true }))) {
            return;
        }

        await productionBatchService.destroy(row.id);
        updateList();
    }

    const columns = [
        { title: 'ID', column: 'id', isSortable: true },
        {
            title: 'Creado',
            column: (row) => formatDate(row.created_at),
            isSortable: true,
        },
        {
            title: 'Órdenes de producción',
            column: (row) => row.production_orders_count ?? 0,
        },
        {
            title: 'Avance',
            column: (row) => (
                <CompletionProgressBar
                    percent={row.completion_progress?.percent}
                    progress={row.completion_progress}
                />
            ),
        },
        tableActionsColumn({
            actions: [
                {
                    label: 'Eliminar',
                    icon: IconTrash,
                    show: userCan('production_batches.delete'),
                    danger: true,
                    onClick: (row) => handleDelete(row),
                },
            ],
        }),
    ];

    return (
        <AppModule
            title="Producción"
            description="Lotes de producción que agrupan órdenes de todos los maquiladores."
            icon={getMenuIconByLink('/production-batches')}
        >
            <Table
                name="production-batches-table"
                controls={controls}
                columns={columns}
                data={data}
                loading={loading}
                onRowView={(row) => navigate(`/production-batches/${row.id}`)}
                showRowView={userCan('production_batches.view')}
                headerRight={
                    userCan('production_batches.add') && (
                        <Button type="button" onClick={handleCreate} loading={creating}>
                            + Nuevo lote
                        </Button>
                    )
                }
            />
        </AppModule>
    );
}
