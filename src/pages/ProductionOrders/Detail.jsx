import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { AppModule, Badge, Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { getManufacturerOrderPieceStatusBadgeProps } from '@resources/constants/manufacturerOrderPieceStatus';
import { formatCatalogCost, formatDate, formatQuantity } from '@resources/helpers';
import { useDatatable, useSectionIcon } from '@resources/hooks';
import { manufacturerOrderPieceService, productionOrderService } from '@resources/services';
import { ManufacturerOrderPieceFormModal } from './ManufacturerOrderPieceFormModal';

function DetailField({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{children}</dd>
        </div>
    );
}

export function ProductionOrderDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const [productionOrder, setProductionOrder] = useState(null);
    const [loadingOrder, setLoadingOrder] = useState(true);

    const {
        data: piecesData,
        controls: piecesControls,
        loading: piecesLoading,
        updateList: updatePieces,
    } = useDatatable({
        service: manufacturerOrderPieceService,
        serviceParams: {
            include:
                'orderPiece.piece,orderPiece.orderConcept.product,orderPiece.order,availableStatus,statusOfCompletedPieces',
            production_order_id: id,
        },
    });

    useEffect(() => {
        setLoadingOrder(true);

        productionOrderService
            .get(id, { include: 'manufacturer.entity' })
            .then(setProductionOrder)
            .catch(() => setProductionOrder(null))
            .finally(() => setLoadingOrder(false));
    }, [id]);

    function openPieceModal(assignment = {}) {
        showModal(<ManufacturerOrderPieceFormModal />, {
            productionOrderId: id,
            assignment,
            onSave: refreshPiecesAndOrder,
        });
    }

    async function refreshProductionOrder() {
        const order = await productionOrderService.get(id, { include: 'manufacturer.entity' });

        setProductionOrder(order);
    }

    async function refreshPiecesAndOrder() {
        await updatePieces();
        await refreshProductionOrder();
    }

    async function handleDeletePiece(row) {
        const pieceName =
            row.order_piece?.piece?.name ?? row.orderPiece?.piece?.name ?? `pieza #${row.order_piece_id}`;

        if (!(await confirm(`¿Quitar "${pieceName}" de esta orden?`, { danger: true }))) {
            return;
        }

        await manufacturerOrderPieceService.destroy(row.id);
        await refreshPiecesAndOrder();
    }

    const manufacturerId = productionOrder?.manufacturer_id;
    const backPath = manufacturerId ? `/manufacturers/${manufacturerId}` : '/manufacturers';

    const pieceColumns = [
        { title: 'ID', column: 'id', isSortable: true },
        {
            title: 'Pedido',
            column: (row) => {
                const op = row.order_piece ?? row.orderPiece;

                return op?.order_id ?? op?.order?.id ?? '—';
            },
        },
        {
            title: 'Producto',
            column: (row) => {
                const op = row.order_piece ?? row.orderPiece;

                return op?.order_concept?.product?.name ?? op?.orderConcept?.product?.name ?? '—';
            },
        },
        {
            title: 'Pieza',
            column: (row) => {
                const op = row.order_piece ?? row.orderPiece;

                return op?.piece?.name ?? `Pieza #${op?.piece_id ?? '—'}`;
            },
        },
        { title: 'Asignadas', column: 'quantity', isSortable: true },
        {
            title: 'Terminadas',
            column: (row) => formatQuantity(row.finished_quantity ?? 0),
        },
        {
            title: 'Estado de manufactura',
            column: (row) => <Badge {...getManufacturerOrderPieceStatusBadgeProps(row.status)} />,
        },
        {
            title: 'Precio unitario',
            column: (row) => formatCatalogCost(row.labor_unit_price),
        },
        {
            title: 'Total',
            column: (row) => formatCatalogCost(row.labor_cost),
        },
        tableActionsColumn({
            actions: [
                {
                    label: 'Editar',
                    icon: IconPencil,
                    show: userCan('manufacturer_order_pieces.edit'),
                    onClick: (row) => openPieceModal(row),
                },
                {
                    label: 'Eliminar',
                    icon: IconTrash,
                    show: userCan('manufacturer_order_pieces.delete'),
                    danger: true,
                    onClick: (row) => handleDeletePiece(row),
                },
            ],
        }),
    ];

    if (!loadingOrder && !productionOrder) {
        return (
            <AppModule icon={sectionIcon}
                title="Orden no encontrada"
                description="La orden de producción solicitada no existe o no tiene permiso para verla."
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate(backPath)}>
                        Volver al maquilador
                    </Button>
                }
            />
        );
    }

    return (
        <AppModule icon={sectionIcon}
            title={loadingOrder ? 'Cargando orden…' : `Orden de producción #${productionOrder.id}`}
            description={
                loadingOrder
                    ? ''
                    : `Maquilador: ${productionOrder.manufacturer?.entity?.name ?? `Maquilador #${productionOrder.manufacturer_id}`}`
            }
            toolbar={
                <Button type="button" variant="secondary" onClick={() => navigate(backPath)}>
                    Volver al maquilador
                </Button>
            }
        >
            <div className={loadingOrder ? 'pointer-events-none opacity-60' : undefined}>
                {!loadingOrder && (
                    <>
                        <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField label="Maquilador">
                                {productionOrder.manufacturer?.entity?.name ??
                                    `Maquilador #${productionOrder.manufacturer_id}`}
                            </DetailField>
                            <DetailField label="Total mano de obra">
                                {formatCatalogCost(productionOrder.labor_cost)}
                            </DetailField>
                            <DetailField label="Creada">{formatDate(productionOrder.created_at)}</DetailField>
                        </dl>

                        <div className="mt-6 space-y-3">
                            <h2 className="text-sm font-semibold text-slate-900">Piezas asignadas</h2>
                            <Table
                                name="production-order-detail-pieces"
                                controls={piecesControls}
                                columns={pieceColumns}
                                data={piecesData}
                                loading={piecesLoading}
                                onRowView={(row) => navigate(`/manufacturer-order-pieces/${row.id}`)}
                                showRowView={userCan('manufacturer_order_pieces.view')}
                                headerRight={
                                    userCan('manufacturer_order_pieces.add') && (
                                        <Button type="button" onClick={() => openPieceModal()}>
                                            + Asignar pieza
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
