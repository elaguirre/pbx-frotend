import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconTrash } from '@tabler/icons-react';
import {
    AppModule,
    Button,
    CompletionProgressBar,
    DetailField,
    Table,
    tableActionsColumn,
} from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { formatCatalogCost, formatDate } from '@resources/helpers';
import { useDatatable, useSectionIcon } from '@resources/hooks';
import { productionBatchService, productionOrderService } from '@resources/services';
import { CreateProductionOrderModal } from './CreateProductionOrderModal';

export function ProductionBatchDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const [productionBatch, setProductionBatch] = useState(null);
    const [loadingBatch, setLoadingBatch] = useState(true);

    const canViewProductionOrder =
        userCan('production_orders.view') || userCan('manufacturer_order_pieces.view');

    const {
        data: ordersData,
        controls: ordersControls,
        loading: ordersLoading,
        updateList: updateOrders,
    } = useDatatable({
        service: productionOrderService,
        serviceParams: {
            include: 'manufacturer.entity',
            production_batch_id: id,
        },
    });

    useEffect(() => {
        setLoadingBatch(true);

        productionBatchService
            .get(id)
            .then(setProductionBatch)
            .catch(() => setProductionBatch(null))
            .finally(() => setLoadingBatch(false));
    }, [id]);

    function openCreateOrderModal() {
        showModal(<CreateProductionOrderModal />, {
            productionBatchId: id,
            onSave: () => {
                updateOrders();
                productionBatchService.get(id).then(setProductionBatch);
            },
        });
    }

    async function handleDeleteOrder(row) {
        if (!(await confirm(`¿Eliminar la orden de producción #${row.id}?`, { danger: true }))) {
            return;
        }

        await productionOrderService.destroy(row.id);
        updateOrders();
        productionBatchService.get(id).then(setProductionBatch);
    }

    const orderColumns = [
        { title: 'ID', column: 'id', isSortable: true },
        {
            title: 'Maquilador',
            column: (row) =>
                row.manufacturer?.entity?.name ?? `Maquilador #${row.manufacturer_id ?? '—'}`,
        },
        {
            title: 'Creada',
            column: (row) => formatDate(row.created_at),
            isSortable: true,
        },
        {
            title: 'Total mano de obra',
            column: (row) => formatCatalogCost(row.labor_cost),
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
                    show: userCan('production_orders.delete'),
                    danger: true,
                    onClick: (row) => handleDeleteOrder(row),
                },
            ],
        }),
    ];

    if (!loadingBatch && !productionBatch) {
        return (
            <AppModule
                icon={sectionIcon}
                title="Lote no encontrado"
                description="El lote solicitado no existe o no tiene permiso para verlo."
                toolbar={
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/production-batches')}
                    >
                        Volver a producción
                    </Button>
                }
            />
        );
    }

    return (
        <AppModule
            icon={sectionIcon}
            title={loadingBatch ? 'Cargando lote…' : `Lote de producción #${productionBatch.id}`}
            description={
                loadingBatch ? '' : 'Órdenes de producción de todos los maquiladores en este lote.'
            }
            toolbar={
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/production-batches')}
                >
                    Volver a producción
                </Button>
            }
        >
            <div className={loadingBatch ? 'pointer-events-none opacity-60' : undefined}>
                {!loadingBatch && (
                    <>
                        <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
                            <DetailField label="ID">{productionBatch.id}</DetailField>
                            <DetailField label="Creado">
                                {formatDate(productionBatch.created_at)}
                            </DetailField>
                        </dl>

                        <div className="mt-6 space-y-3">
                            <h2 className="text-sm font-semibold text-slate-900">
                                Órdenes de producción
                            </h2>
                            <Table
                                name="production-batch-detail-orders"
                                controls={ordersControls}
                                columns={orderColumns}
                                data={ordersData}
                                loading={ordersLoading}
                                onRowView={(row) => navigate(`/production-orders/${row.id}`)}
                                showRowView={canViewProductionOrder}
                                headerRight={
                                    userCan('production_orders.add') && (
                                        <Button type="button" onClick={openCreateOrderModal}>
                                            + Nueva orden de producción
                                        </Button>
                                    )
                                }
                            />
                        </div>
                    </>
                )}
            </div>
        </AppModule>
    );
}
