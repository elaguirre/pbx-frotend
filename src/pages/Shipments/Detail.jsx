import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowDown, IconArrowUp, IconPencil, IconTrash } from '@tabler/icons-react';
import { AppModule, Badge, Button, Table, Tabs, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import {
    getShipmentOrderPieceStatusBadgeProps,
} from '@resources/constants/shipmentOrderPieces';
import { getShipmentRouteStatusBadgeProps } from '@resources/constants/shipmentRoutes';
import { formatDate, formatEntityAddressLine, formatQuantity } from '@resources/helpers';
import { useDatatable, useSectionIcon } from '@resources/hooks';
import { shipmentOrderPieceService, shipmentRouteService, shipmentService } from '@resources/services';
import { FormModal } from './FormModal';
import { ShipmentOrderPieceFormModal } from './ShipmentOrderPieceFormModal';

function DetailField({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{children}</dd>
        </div>
    );
}

export function ShipmentDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const [shipment, setShipment] = useState(null);
    const [loadingShipment, setLoadingShipment] = useState(true);

    const canViewPieces = userCan('shipment_order_pieces.view');
    const canViewRoutes = userCan('shipment_routes.view');
    const defaultTab = canViewPieces ? 'pieces' : canViewRoutes ? 'routes' : 'pieces';
    const [activeTab, setActiveTab] = useState(defaultTab);

    const {
        data: piecesData,
        controls: piecesControls,
        loading: piecesLoading,
        updateList: updatePieces,
    } = useDatatable({
        service: canViewPieces ? shipmentOrderPieceService : null,
        serviceParams: {
            include: 'orderPiece.piece,orderPiece.orderConcept.product,orderPiece.order',
            shipment_id: id,
        },
    });

    const {
        data: routesData,
        controls: routesControls,
        loading: routesLoading,
        updateList: updateRoutes,
    } = useDatatable({
        service: canViewRoutes ? shipmentRouteService : null,
        paginated: false,
        serviceParams: {
            include: 'entityAddress.entity,entityAddress.city,entityAddress.city.state',
            shipment_id: id,
            sort: 'order',
        },
    });

    useEffect(() => {
        refreshShipment();
    }, [id]);

    async function refreshShipment() {
        setLoadingShipment(true);

        try {
            const data = await shipmentService.get(id, {
                include: 'carrier.entity,carrierUnit,driver.entity',
            });

            setShipment(data);
        } catch {
            setShipment(null);
        } finally {
            setLoadingShipment(false);
        }
    }

    function openEditModal() {
        showModal(<FormModal />, {
            formValues: shipment,
            onSave: refreshShipment,
        });
    }

    const shipmentParentRecord = shipment && {
        title: `Embarque #${shipment.id}`,
        data: {
            Transportista: shipment.carrier?.entity?.name,
            Unidad:
                shipment.carrier_unit?.description ?? shipment.carrierUnit?.description,
            Conductor: shipment.driver?.entity?.name,
        },
    };

    function openPieceModal(lineRecord = null) {
        showModal(<ShipmentOrderPieceFormModal />, {
            shipmentId: id,
            parentRecord: shipmentParentRecord,
            lineRecord,
            onSave: () => {
                updatePieces();
                updateRoutes();
            },
        });
    }

    async function handleDeletePiece(row) {
        if (!(await confirm('¿Quitar esta pieza del embarque?', { danger: true }))) {
            return;
        }

        await shipmentOrderPieceService.destroy(row.id);
        updatePieces();
        updateRoutes();
    }

    async function handleMoveRoute(row, direction) {
        if (!userCan('shipment_routes.edit')) {
            return;
        }

        if (direction === 'up') {
            await shipmentRouteService.moveUp(row.id, {
                include: 'entityAddress.entity,entityAddress.city,entityAddress.city.state',
            });
        } else {
            await shipmentRouteService.moveDown(row.id, {
                include: 'entityAddress.entity,entityAddress.city,entityAddress.city.state',
            });
        }

        updateRoutes();
    }

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
            title: 'Pieza',
            column: (row) => {
                const op = row.order_piece ?? row.orderPiece;

                return op?.piece?.name ?? `Pieza #${op?.piece_id ?? '—'}`;
            },
        },
        { title: 'Cantidad', column: (row) => formatQuantity(row.quantity) },
        {
            title: 'Estado',
            column: (row) => {
                return <Badge {...getShipmentOrderPieceStatusBadgeProps(row.status)} />;
            },
        },
        tableActionsColumn({
            actions: [
                {
                    label: 'Editar',
                    icon: IconPencil,
                    show: userCan('shipment_order_pieces.edit'),
                    onClick: (row) => openPieceModal(row),
                },
                {
                    label: 'Eliminar',
                    icon: IconTrash,
                    show: userCan('shipment_order_pieces.delete'),
                    danger: true,
                    onClick: (row) => handleDeletePiece(row),
                },
            ],
        }),
    ];

    function routeEntityAddress(row) {
        return row.entity_address ?? row.entityAddress;
    }

    const routeColumns = [
        {
            title: '#',
            column: (row) => row.order ?? '—',
        },
        {
            title: 'Cliente',
            column: (row) => routeEntityAddress(row)?.entity?.name ?? '—',
        },
        {
            title: 'Dirección de entrega',
            column: (row) => formatEntityAddressLine(routeEntityAddress(row)),
        },
        {
            title: 'Estado',
            column: (row) => {
                return <Badge {...getShipmentRouteStatusBadgeProps(row.status)} />;
            },
        },
        tableActionsColumn({
            actions: [
                {
                    label: 'Subir',
                    icon: IconArrowUp,
                    show: userCan('shipment_routes.edit'),
                    onClick: (row) => handleMoveRoute(row, 'up'),
                },
                {
                    label: 'Bajar',
                    icon: IconArrowDown,
                    show: userCan('shipment_routes.edit'),
                    onClick: (row) => handleMoveRoute(row, 'down'),
                },
            ],
        }),
    ];

    const piecesTabContent = canViewPieces ? (
        <Table
            name="shipment-order-pieces"
            controls={piecesControls}
            columns={pieceColumns}
            data={piecesData}
            loading={piecesLoading}
            headerRight={
                userCan('shipment_order_pieces.add') && (
                    <Button type="button" onClick={() => openPieceModal()}>
                        + Agregar pieza
                    </Button>
                )
            }
        />
    ) : (
        <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            No tiene permiso para ver las piezas del embarque.
        </p>
    );

    const routesTabContent = canViewRoutes ? (
        <Table
            name="shipment-routes"
            columns={routeColumns}
            data={routesData}
            loading={routesLoading}
            isDatatable={false}
            showHeader={false}
            showFooter={false}
        />
    ) : (
        <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            No tiene permiso para ver las rutas del embarque.
        </p>
    );

    const tabs = [
        canViewPieces && {
            id: 'pieces',
            label: 'Piezas',
            content: piecesTabContent,
        },
        canViewRoutes && {
            id: 'routes',
            label: 'Ruta de entrega',
            content: routesTabContent,
        },
    ].filter(Boolean);

    useEffect(() => {
        if (tabs.length > 0 && !tabs.some((tab) => tab.id === activeTab)) {
            setActiveTab(tabs[0].id);
        }
    }, [tabs, activeTab]);

    const resolvedActiveTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : tabs[0]?.id;

    if (!loadingShipment && !shipment) {
        return (
            <AppModule
                icon={sectionIcon}
                title="Embarque no encontrado"
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate('/shipments')}>
                        Volver a embarques
                    </Button>
                }
            />
        );
    }

    return (
        <AppModule
            icon={sectionIcon}
            title={loadingShipment ? 'Cargando embarque…' : `Embarque #${shipment.id}`}
            description="Transportista, unidad, conductor, piezas y ruta de entrega."
            onEdit={userCan('shipments.edit') && shipment ? openEditModal : undefined}
            toolbar={
                <Button type="button" variant="secondary" onClick={() => navigate('/shipments')}>
                    Volver a embarques
                </Button>
            }
        >
            <div className={loadingShipment ? 'pointer-events-none opacity-60' : undefined}>
                {!loadingShipment && (
                    <>
                        <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
                            <DetailField label="Transportista">
                                {shipment.carrier?.entity?.name ?? '—'}
                            </DetailField>
                            <DetailField label="Unidad">
                                {shipment.carrier_unit?.description ??
                                    shipment.carrierUnit?.description ??
                                    '—'}
                            </DetailField>
                            <DetailField label="Conductor">
                                {shipment.driver?.entity?.name ?? '—'}
                            </DetailField>
                            <DetailField label="Capacidad volumétrica (m³)">
                                {formatQuantity(
                                    shipment.carrier_unit?.load_volume_capacity ??
                                        shipment.carrierUnit?.load_volume_capacity,
                                )}
                            </DetailField>
                            <DetailField label="Capacidad de peso (kg)">
                                {formatQuantity(
                                    shipment.carrier_unit?.load_weight_capacity ??
                                        shipment.carrierUnit?.load_weight_capacity,
                                )}
                            </DetailField>
                            <DetailField label="Creado">{formatDate(shipment.created_at)}</DetailField>
                        </dl>

                        {tabs.length > 0 ? (
                            <div className="mt-6">
                                <Tabs
                                    tabs={tabs}
                                    activeTab={resolvedActiveTab}
                                    onTabChange={setActiveTab}
                                />
                            </div>
                        ) : (
                            <p className="mt-6 rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                No tiene permisos para ver el contenido de este embarque.
                            </p>
                        )}
                    </>
                )}
            </div>
        </AppModule>
    );
}
