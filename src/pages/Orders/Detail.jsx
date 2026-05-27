import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconUserPlus } from '@tabler/icons-react';
import { AppModule, Badge, Button, DetailField, Table, Tabs, tableActionsColumn } from '@features/ui';
import { getOrderStatusBadgeProps } from '@resources/constants/orders';
import { formatDate, formatMoney, formatQuantity, getConceptLineTotal, getOrderTotal, getOrderConcept, normalizeListResponse } from '@resources/helpers';
import { useSectionIcon } from '@resources/hooks';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { orderPieceService, orderService } from '@resources/services';
import { ManufacturerOrderPieceFormModal } from '@pages/ProductionOrders/ManufacturerOrderPieceFormModal';

const ORDER_INCLUDES = 'client.entity,user,concepts.product';

export function OrderDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { showModal } = useGlobalModals();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('concepts');
    const [orderPieces, setOrderPieces] = useState([]);
    const [loadingOrderPieces, setLoadingOrderPieces] = useState(false);
    const canViewProduction = userCan('manufacturer_order_pieces.view');
    const canAssignProduction = userCan('manufacturer_order_pieces.add');

    useEffect(() => {
        setLoading(true);

        orderService
            .get(id, { include: ORDER_INCLUDES })
            .then(setOrder)
            .catch(() => setOrder(null))
            .finally(() => setLoading(false));
    }, [id]);

    const loadOrderPieces = useCallback(() => {
        if (!canViewProduction || !id) {
            return Promise.resolve();
        }

        setLoadingOrderPieces(true);

        return orderPieceService
            .getAll({
                order_id: id,
                paginated: false,
                limit: 500,
                include: 'piece,orderConcept.product,orderPieceStatus',
            })
            .then((response) => {
                setOrderPieces(normalizeListResponse(response));
            })
            .catch(() => setOrderPieces([]))
            .finally(() => setLoadingOrderPieces(false));
    }, [canViewProduction, id]);

    useEffect(() => {
        loadOrderPieces();
    }, [loadOrderPieces]);

    function openAssignModal(orderPiece) {
        const product = getOrderConcept(orderPiece)?.product;
        const pieceName = orderPiece?.piece?.name ?? `Pieza #${orderPiece?.piece_id ?? '—'}`;

        showModal(<ManufacturerOrderPieceFormModal />, {
            orderId: id,
            parentRecord: order && orderPiece && {
                title: `Pedido #${order.id} · ${pieceName}`,
                data: {
                    Cliente: order.client?.entity?.name,
                    Producto: product?.name,
                    'Cantidad del pedido': formatQuantity(orderPiece.quantity),
                },
            },
            presetOrderPiece: orderPiece,
            onSave: loadOrderPieces,
        });
    }

    const concepts = order?.concepts ?? [];
    const orderTotal = getOrderTotal(concepts);

    const conceptColumns = [
        {
            title: 'Producto',
            column: (row) => (
                <div>
                    <p className="font-medium text-slate-900">
                        {row.product?.name ?? `Producto #${row.product_id}`}
                    </p>
                    {row.product?.sku && (
                        <p className="text-xs text-slate-500">SKU: {row.product.sku}</p>
                    )}
                </div>
            ),
        },
        { title: 'Cantidad', column: 'quantity' },
        {
            title: 'Detalles',
            column: (row) => row.details?.trim() || '—',
        },
        {
            title: 'Motivo precio',
            column: (row) => row.price_modification_reason?.trim() || '—',
        },
        {
            title: 'Precio unitario',
            align: 'right',
            column: (row) => formatMoney(row.price ?? row.product?.price),
        },
        {
            title: 'Subtotal',
            align: 'right',
            column: (row) => formatMoney(getConceptLineTotal(row)),
        },
    ];

    const canViewOrderPiece = userCan('order_pieces.view');

    const orderPiecesColumns = [
        {
            title: 'Producto',
            column: (row) => getOrderConcept(row)?.product?.name ?? '—',
        },
        {
            title: 'Pieza',
            column: (row) => row.piece?.name ?? `Pieza #${row.piece_id ?? '—'}`,
        },
        {
            title: 'Asignado (total)',
            column: (row) => {
                const assigned = Number(row.assigned_quantity ?? 0);
                const total = Number(row.quantity ?? 0);
                const label = `${formatQuantity(assigned)} / ${formatQuantity(total)}`;

                if (assigned < total) {
                    return <span className="font-medium text-danger-700">{label}</span>;
                }

                return label;
            },
        },
        tableActionsColumn({
            actions: [
                {
                    label: 'Asignar',
                    icon: IconUserPlus,
                    show: canAssignProduction,
                    onClick: (row) => openAssignModal(row),
                },
            ],
        }),
    ];

    const conceptsTabContent =
        concepts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                Este pedido no tiene conceptos.
            </p>
        ) : (
            <>
                <Table
                    name="order-detail-concepts"
                    columns={conceptColumns}
                    data={concepts}
                    isDatatable={false}
                    showHeader={false}
                    showFooter={false}
                />
                <div className="mt-4 text-right px-2">
                    <div className="text-xs font-medium uppercase text-slate-500">
                        Total del pedido
                    </div>
                    <div className="text-lg font-semibold text-slate-900">{formatMoney(orderTotal)}</div>
                </div>
            </>
        );

    const productionTabContent = (
        <div className="space-y-3">
            <p className="text-sm text-slate-500">
                La misma pieza puede asignarse a varios maquiladores (procesos distintos). El
                límite de cantidad es por orden de producción de cada maquilador.
            </p>
            {loadingOrderPieces || orderPieces.length > 0 ? (
                <Table
                    name="order-detail-order-pieces"
                    columns={orderPiecesColumns}
                    data={orderPieces}
                    loading={loadingOrderPieces}
                    isDatatable={false}
                    showHeader={false}
                    showFooter={false}
                    onRowView={(row) => navigate(`/order-pieces/${row.id}`)}
                    showRowView={canViewOrderPiece}
                />
            ) : (
                <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    Este pedido no tiene piezas registradas para producción.
                </p>
            )}
        </div>
    );

    const tabs = [
        { id: 'concepts', label: 'Conceptos', content: conceptsTabContent },
        ...(canViewProduction
            ? [{ id: 'production', label: 'Producción', content: productionTabContent }]
            : []),
    ];

    if (!loading && !order) {
        return (
            <AppModule icon={sectionIcon}
                title="Pedido no encontrado"
                description="El pedido solicitado no existe o no tiene permiso para verlo."
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate('/orders')}>
                        Volver a pedidos
                    </Button>
                }
            />
        );
    }

    return (
        <AppModule icon={sectionIcon}
            title={loading ? 'Cargando pedido…' : `Pedido #${order.id}`}
            description={loading ? '' : 'Detalle del pedido, conceptos y producción.'}
            toolbar={
                <Button type="button" variant="secondary" onClick={() => navigate('/orders')}>
                    Volver a pedidos
                </Button>
            }
        >
            <div className={loading ? 'pointer-events-none opacity-60' : undefined}>
                {!loading && (
                    <>
                        <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField label="Cliente">
                                {order.client?.entity?.name ?? '—'}
                            </DetailField>
                            <DetailField label="Estado">
                                <Badge {...getOrderStatusBadgeProps(order.status)} />
                            </DetailField>
                            <DetailField label="Creado por">
                                {order.user?.full_name ?? '—'}
                            </DetailField>
                            <DetailField label="Correo del usuario">
                                {order.user?.email ?? '—'}
                            </DetailField>
                            <DetailField label="Creado">{formatDate(order.created_at)}</DetailField>
                            <DetailField label="Actualizado">{formatDate(order.updated_at)}</DetailField>
                        </dl>

                        <div className="mt-6">
                            {tabs.length > 1 ? (
                                <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                            ) : (
                                conceptsTabContent
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppModule>
    );
}
