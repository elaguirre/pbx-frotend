import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { AppModule, Button, CompletionProgressBar, Table, TableActionsDropdown, Tabs, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { formatCatalogCost, formatDate, formatMoney } from '@resources/helpers';
import { useDatatable, useSectionIcon } from '@resources/hooks';
import {
    manufacturerPieceCostService,
    manufacturerService,
    productionOrderService,
} from '@resources/services';
import { ManufacturerPieceCostFormModal } from './ManufacturerPieceCostFormModal';
import { FormModal } from './FormModal';

function DetailField({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{children}</dd>
        </div>
    );
}

export function ManufacturerDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const [manufacturer, setManufacturer] = useState(null);
    const [loadingManufacturer, setLoadingManufacturer] = useState(true);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [activeTab, setActiveTab] = useState('production-orders');

    const {
        data: ordersData,
        controls: ordersControls,
        loading: ordersLoading,
        updateList: updateOrders,
    } = useDatatable({
        service: productionOrderService,
        serviceParams: { manufacturer_id: id },
    });

    const {
        data: costsData,
        controls: costsControls,
        loading: costsLoading,
        updateList: updateCosts,
    } = useDatatable({
        service: manufacturerPieceCostService,
        serviceParams: { include: 'piece', manufacturer_id: id },
    });

    useEffect(() => {
        setLoadingManufacturer(true);

        manufacturerService
            .get(id, { include: 'entity' })
            .then(setManufacturer)
            .catch(() => setManufacturer(null))
            .finally(() => setLoadingManufacturer(false));
    }, [id]);

    function refreshManufacturer() {
        return manufacturerService.get(id, { include: 'entity' }).then(setManufacturer);
    }

    function openEditModal() {
        showModal(<FormModal />, {
            formValues: manufacturer,
            onSave: refreshManufacturer,
        });
    }

    async function handleCreateOrder() {
        const manufacturerName =
            manufacturer?.entity?.name ?? `Maquilador #${manufacturer?.id ?? id}`;

        if (
            !(await confirm(
                `¿Crear una nueva orden de producción para "${manufacturerName}"?`,
            ))
        ) {
            return;
        }

        setCreatingOrder(true);

        try {
            await productionOrderService.store({ manufacturer_id: Number(id) });
            updateOrders();
        } finally {
            setCreatingOrder(false);
        }
    }

    async function handleDeleteOrder(row) {
        if (!(await confirm(`¿Eliminar la orden de producción #${row.id}?`, { danger: true }))) {
            return;
        }

        await productionOrderService.destroy(row.id);
        updateOrders();
    }

    function openCostModal(costRecord = null) {
        showModal(<ManufacturerPieceCostFormModal />, {
            manufacturerId: id,
            costRecord,
            onSave: updateCosts,
        });
    }

    async function handleDeleteCost(row) {
        const name = row.piece?.name ?? `pieza #${row.piece_id}`;

        if (!(await confirm(`¿Eliminar el costo de "${name}"?`, { danger: true }))) {
            return;
        }

        await manufacturerPieceCostService.destroy(row.id);
        updateCosts();
    }

    const canViewProductionOrder =
        userCan('production_orders.view') || userCan('manufacturer_order_pieces.view');

    const orderColumns = [
        { title: 'ID', column: 'id', isSortable: true },
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

    const costColumns = [
        { title: 'ID', column: 'id', isSortable: true },
        { title: 'Pieza', column: (row) => row.piece?.name ?? `Pieza #${row.piece_id}` },
        {
            title: 'Precio',
            column: (row) => formatMoney(row.price),
            isSortable: true,
        },
        {
            title: 'Acciones',
            align: 'right',
            column: (row) => (
                <TableActionsDropdown
                    actions={[
                        {
                            label: 'Editar',
                            icon: IconPencil,
                            show: userCan('manufacturer_pieces_cost.edit'),
                            onClick: () => openCostModal(row),
                        },
                        {
                            label: 'Eliminar',
                            icon: IconTrash,
                            show: userCan('manufacturer_pieces_cost.delete'),
                            danger: true,
                            onClick: () => handleDeleteCost(row),
                        },
                    ]}
                />
            ),
        },
    ];

    const tabs = [
        {
            id: 'production-orders',
            label: 'Á“rdenes de producción',
            content: (
                <Table
                    name="manufacturer-detail-production-orders"
                    controls={ordersControls}
                    columns={orderColumns}
                    data={ordersData}
                    loading={ordersLoading}
                    onRowView={(row) => navigate(`/production-orders/${row.id}`)}
                    showRowView={canViewProductionOrder}
                    headerRight={
                        userCan('production_orders.add') && (
                            <Button type="button" onClick={handleCreateOrder} loading={creatingOrder}>
                                + Nueva orden de producción
                            </Button>
                        )
                    }
                />
            ),
        },
        {
            id: 'piece-costs',
            label: 'Costo de piezas',
            content: (
                <Table
                    name="manufacturer-detail-piece-costs"
                    controls={costsControls}
                    columns={costColumns}
                    data={costsData}
                    loading={costsLoading}
                    headerRight={
                        userCan('manufacturer_pieces_cost.add') && (
                            <Button type="button" onClick={() => openCostModal()}>
                                + Registrar costo
                            </Button>
                        )
                    }
                />
            ),
        },
    ];

    if (!loadingManufacturer && !manufacturer) {
        return (
            <AppModule icon={sectionIcon}
                title="Maquilador no encontrado"
                description="El maquilador solicitado no existe o no tiene permiso para verlo."
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate('/manufacturers')}>
                        Volver a maquiladores
                    </Button>
                }
            />
        );
    }

    return (
        <AppModule icon={sectionIcon}
            title={
                loadingManufacturer
                    ? 'Cargando maquilador…'
                    : manufacturer.entity?.name ?? `Maquilador #${manufacturer.id}`
            }
            description={
                loadingManufacturer
                    ? ''
                    : 'Órdenes de producción y costos de mano de obra por pieza.'
            }
            onEdit={userCan('manufacturers.edit') && manufacturer ? openEditModal : undefined}
            toolbar={
                <Button type="button" variant="secondary" onClick={() => navigate('/manufacturers')}>
                    Volver a maquiladores
                </Button>
            }
        >
            <div className={loadingManufacturer ? 'pointer-events-none opacity-60' : undefined}>
                {!loadingManufacturer && (
                    <>
                        <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField label="ID">{manufacturer.id}</DetailField>
                            <DetailField label="RFC">{manufacturer.entity?.rfc ?? '—'}</DetailField>
                            <DetailField label="Creado">{formatDate(manufacturer.created_at)}</DetailField>
                        </dl>

                        <div className="mt-6">
                            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                        </div>
                    </>
                )}
            </div>
        </AppModule>
    );
}
