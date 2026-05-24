import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppModule, Badge, Button, Table, Tabs } from '@features/ui';
import { getManufacturerOrderPieceStatusBadgeProps } from '@resources/constants/manufacturerOrderPieceStatus';
import { getOrderStatusBadgeProps } from '@resources/constants/orders';
import { formatDate, formatMoney, formatQuantity, getConceptLineTotal, getOrderTotal } from '@resources/helpers';
import { useDatatable, useSectionIcon } from '@resources/hooks';
import { useAuth } from '@resources/contexts';
import { manufacturerOrderPieceService, orderService } from '@resources/services';

const ORDER_INCLUDES = 'client.entity,user,concepts.product';

function DetailField({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{children}</dd>
        </div>
    );
}

const PRODUCTION_INCLUDES =
    'orderPiece.piece,orderPiece.orderConcept.product,productionOrder.manufacturer.entity,availableStatus,statusOfCompletedPieces';

export function OrderDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('concepts');
    const canViewProduction = userCan('manufacturer_order_pieces.view');

    const {
        data: productionData,
        controls: productionControls,
        loading: productionLoading,
    } = useDatatable({
        service: canViewProduction ? manufacturerOrderPieceService : null,
        serviceParams: {
            include: PRODUCTION_INCLUDES,
            order_id: id,
        },
    });

    useEffect(() => {
        setLoading(true);

        orderService
            .get(id, { include: ORDER_INCLUDES })
            .then(setOrder)
            .catch(() => setOrder(null))
            .finally(() => setLoading(false));
    }, [id]);

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

    const productionRows = productionData?.data ?? [];
    const productionColumns = [
        {
            title: 'Maquilador',
            column: (row) => {
                const po = row.production_order ?? row.productionOrder;
                const name = po?.manufacturer?.entity?.name;

                if (!name) {
                    return po?.manufacturer_id ? `Maquilador #${po.manufacturer_id}` : '—';
                }

                if (userCan('manufacturers.view') && po?.manufacturer_id) {
                    return (
                        <Link
                            to={`/manufacturers/${po.manufacturer_id}`}
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
                const productionOrderId =
                    row.production_order_id ?? row.production_order?.id ?? row.productionOrder?.id;

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
        { title: 'Cantidad asignada', column: 'quantity', isSortable: true },
        {
            title: 'Piezas terminadas',
            column: (row) => formatQuantity(row.finished_quantity ?? 0),
        },
        {
            title: 'Estado de manufactura',
            column: (row) => <Badge {...getManufacturerOrderPieceStatusBadgeProps(row.status)} />,
        },
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

    const productionTabContent =
        productionLoading || productionRows.length > 0 ? (
            <Table
                name="order-detail-production"
                controls={productionControls}
                columns={productionColumns}
                data={productionData}
                loading={productionLoading}
            />
        ) : (
            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                Este pedido no tiene piezas asignadas a producción.
            </p>
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
