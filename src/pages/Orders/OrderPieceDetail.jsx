import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppModule, Badge, Button, DetailField, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { getManufacturerOrderPieceStatusBadgeProps } from '@resources/constants/manufacturerOrderPieceStatus';
import { getOrderPieceStatusBadgeProps } from '@resources/constants/orderPieceStatusBadge';
import { formatQuantity, getOrderConcept, getProductionOrder } from '@resources/helpers';
import { useDatatable, useSectionIcon } from '@resources/hooks';
import { manufacturerOrderPieceService, orderPieceService } from '@resources/services';
import { ManufacturerOrderPieceFormModal } from '@pages/ProductionOrders/ManufacturerOrderPieceFormModal';

const ORDER_PIECE_INCLUDES = 'piece,orderConcept.product,order.client.entity,orderPieceStatus';

const ASSIGNMENTS_INCLUDES =
    'productionOrder.manufacturer.entity,availableStatus,statusOfCompletedPieces';

export function OrderPieceDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { showModal } = useGlobalModals();
    const [orderPiece, setOrderPiece] = useState(null);
    const [loadingOrderPiece, setLoadingOrderPiece] = useState(true);

    const canViewAssignments = userCan('manufacturer_order_pieces.view');
    const canAssignProduction = userCan('manufacturer_order_pieces.add');

    const {
        data: assignmentsData,
        controls: assignmentsControls,
        loading: assignmentsLoading,
        updateList: updateAssignments,
    } = useDatatable({
        service: canViewAssignments ? manufacturerOrderPieceService : null,
        serviceParams: {
            include: ASSIGNMENTS_INCLUDES,
            order_piece_id: id,
        },
    });

    function refreshOrderPiece() {
        return orderPieceService
            .get(id, { include: ORDER_PIECE_INCLUDES })
            .then(setOrderPiece);
    }

    useEffect(() => {
        setLoadingOrderPiece(true);

        orderPieceService
            .get(id, { include: ORDER_PIECE_INCLUDES })
            .then(setOrderPiece)
            .catch(() => setOrderPiece(null))
            .finally(() => setLoadingOrderPiece(false));
    }, [id]);

    function refreshAll() {
        updateAssignments();
        refreshOrderPiece();
    }

    function openAssignModal() {
        const product = getOrderConcept(orderPiece)?.product;
        const pieceName = orderPiece?.piece?.name ?? `Pieza #${orderPiece?.piece_id ?? '—'}`;
        const orderId = orderPiece?.order_id ?? orderPiece?.order?.id;

        showModal(<ManufacturerOrderPieceFormModal />, {
            orderId,
            parentRecord: orderPiece && {
                title: `Pedido #${orderId ?? '—'} · ${pieceName}`,
                data: {
                    Cliente: orderPiece.order?.client?.entity?.name,
                    Producto: product?.name,
                    'Cantidad del pedido': formatQuantity(orderPiece.quantity),
                },
            },
            presetOrderPiece: orderPiece,
            onSave: refreshAll,
        });
    }

    const orderId = orderPiece?.order_id ?? orderPiece?.order?.id;
    const backPath = orderId ? `/orders/${orderId}` : '/orders';
    const pieceName = orderPiece?.piece?.name ?? `Pieza #${orderPiece?.piece_id ?? '—'}`;
    const product = getOrderConcept(orderPiece)?.product;
    const status = orderPiece?.order_piece_status ?? orderPiece?.orderPieceStatus;
    const assigned = Number(orderPiece?.assigned_quantity ?? 0);
    const total = Number(orderPiece?.quantity ?? 0);

    const assignmentColumns = [
        { title: 'ID', column: 'id', isSortable: true },
        {
            title: 'Maquilador',
            column: (row) => {
                const productionOrder = getProductionOrder(row);
                const name = productionOrder?.manufacturer?.entity?.name;

                if (!name) {
                    return productionOrder?.manufacturer_id
                        ? `Maquilador #${productionOrder.manufacturer_id}`
                        : '—';
                }

                if (userCan('manufacturers.view') && productionOrder?.manufacturer_id) {
                    return (
                        <Link
                            to={`/manufacturers/${productionOrder.manufacturer_id}`}
                            className="font-medium text-primary-600 hover:text-primary-700"
                        >
                            {name}
                        </Link>
                    );
                }

                return name;
            },
        },
        {
            title: 'ODP',
            column: (row) => {
                const productionOrder = getProductionOrder(row);
                const productionOrderId =
                    row.production_order_id ?? productionOrder?.id;

                if (!productionOrderId) {
                    return '—';
                }

                if (userCan('production_orders.view')) {
                    return (
                        <Link
                            to={`/production-orders/${productionOrderId}`}
                            className="font-medium text-primary-600 hover:text-primary-700"
                        >
                            #{productionOrderId}
                        </Link>
                    );
                }

                return `#${productionOrderId}`;
            },
        },
        { title: 'Cantidad asignada', column: 'quantity', isSortable: true },
        {
            title: 'Piezas terminadas',
            column: (row) => formatQuantity(row.finished_quantity ?? 0),
        },
        {
            title: 'Estado de manufactura',
            column: (row) => <Badge {...getManufacturerOrderPieceStatusBadgeProps(row.status)} />,
        },
        tableActionsColumn({}),
    ];

    if (!loadingOrderPiece && !orderPiece) {
        return (
            <AppModule
                icon={sectionIcon}
                title="Pieza no encontrada"
                description="La pieza solicitada no existe o no tiene permiso para verla."
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate(backPath)}>
                        Volver al pedido
                    </Button>
                }
            />
        );
    }

    return (
        <AppModule
            icon={sectionIcon}
            title={loadingOrderPiece ? 'Cargando pieza…' : pieceName}
            description={
                loadingOrderPiece
                    ? ''
                    : `Pieza del pedido #${orderId ?? '—'} · Asignaciones a maquiladores y estado de manufactura.`
            }
            toolbar={
                <Button type="button" variant="secondary" onClick={() => navigate(backPath)}>
                    Volver al pedido
                </Button>
            }
        >
            <div className={loadingOrderPiece ? 'pointer-events-none opacity-60' : undefined}>
                {!loadingOrderPiece && (
                    <>
                        <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
                            
                            <DetailField label="Pedido">
                                {userCan('orders.view') && orderId ? (
                                    <Link
                                        to={`/orders/${orderId}`}
                                        className="font-medium text-primary-600 hover:text-primary-700"
                                    >
                                        #{orderId}
                                    </Link>
                                ) : (
                                    `#${orderId ?? '—'}`
                                )}
                            </DetailField>
                            <DetailField label="Cliente">
                                {orderPiece.order?.client?.entity?.name ?? '—'}
                            </DetailField>
                            <DetailField label="Producto">{product?.name ?? '—'}</DetailField>
                            <DetailField label="Pieza">{pieceName}</DetailField>
                            <DetailField label="Cantidad del pedido">
                                {formatQuantity(total)}
                            </DetailField>
                            <DetailField label="Asignado (total)">
                                <span
                                    className={
                                        assigned < total
                                            ? 'font-medium text-danger-700'
                                            : undefined
                                    }
                                >
                                    {formatQuantity(assigned)} / {formatQuantity(total)}
                                </span>
                            </DetailField>
                            <DetailField label="Estado de la pieza">
                                {status ? (
                                    <Badge {...getOrderPieceStatusBadgeProps(status)} />
                                ) : (
                                    '—'
                                )}
                            </DetailField>
                        </dl>

                        <div className="mt-6 space-y-3">
                            <h2 className="text-sm font-semibold text-slate-900">
                                Asignaciones a maquiladores
                            </h2>
                            <p className="text-sm text-slate-500">
                                Maquiladores que tienen esta pieza asignada con su cantidad y
                                estado de manufactura.
                            </p>

                            {canViewAssignments ? (
                                <Table
                                    name="order-piece-assignments"
                                    controls={assignmentsControls}
                                    columns={assignmentColumns}
                                    data={assignmentsData}
                                    loading={assignmentsLoading}
                                    onRowView={(row) =>
                                        navigate(`/manufacturer-order-pieces/${row.id}`)
                                    }
                                    showRowView={userCan('manufacturer_order_pieces.view')}
                                    headerRight={
                                        canAssignProduction && (
                                            <Button type="button" onClick={openAssignModal}>
                                                + Asignar maquilador
                                            </Button>
                                        )
                                    }
                                />
                            ) : (
                                <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                    No tiene permiso para consultar las asignaciones de manufactura.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppModule>
    );
}
