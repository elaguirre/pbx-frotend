import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { AppModule, Badge, Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import {
    followUpRequiresQuantity,
    getManufacturingFollowUpResultBadgeProps,
} from '@resources/constants/manufacturingFollowUpResult';
import { getManufacturerOrderPieceStatusBadgeProps } from '@resources/constants/manufacturerOrderPieceStatus';
import { getOrderPieceStatusBadgeProps } from '@resources/constants/orderPieceStatusBadge';
import { formatCatalogCost, formatDate, formatQuantity } from '@resources/helpers';
import { useDatatable, useSectionIcon } from '@resources/hooks';
import { manufacturingFollowUpService, manufacturerOrderPieceService } from '@resources/services';
import { ManufacturingFollowUpFormModal } from './ManufacturingFollowUpFormModal';

function DetailField({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{children}</dd>
        </div>
    );
}

function getOrderPiece(assignment) {
    return assignment?.order_piece ?? assignment?.orderPiece;
}

function getPieceLabel(assignment) {
    const op = getOrderPiece(assignment);
    const piece = op?.piece;

    return piece?.name ?? `Pieza #${op?.piece_id ?? '—'}`;
}

export function ManufacturerOrderPieceDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const [assignment, setAssignment] = useState(null);
    const [loadingAssignment, setLoadingAssignment] = useState(true);

    const canViewFollowUp =
        userCan('manufacturing_follow_up.view') || userCan('manufacturer_order_pieces.view');

    const {
        data: followUpData,
        controls: followUpControls,
        loading: followUpLoading,
        updateList: updateFollowUp,
    } = useDatatable({
        service: canViewFollowUp ? manufacturingFollowUpService : null,
        serviceParams: {
            include: 'user',
            manufacturer_order_piece_id: id,
        },
    });

    useEffect(() => {
        setLoadingAssignment(true);

        manufacturerOrderPieceService
            .get(id, {
                include:
                    'orderPiece.piece,orderPiece.orderConcept.product,orderPiece.order,availableStatus,statusOfCompletedPieces,productionOrder',
            })
            .then(setAssignment)
            .catch(() => setAssignment(null))
            .finally(() => setLoadingAssignment(false));
    }, [id]);

    function openFollowUpModal(followUpRecord = null) {
        const op = getOrderPiece(assignment);
        const product = op?.order_concept?.product ?? op?.orderConcept?.product;

        showModal(<ManufacturingFollowUpFormModal />, {
            manufacturerOrderPieceId: id,
            parentRecord: assignment && {
                title: getPieceLabel(assignment),
                data: {
                    Producto: product?.name,
                    Pedido: op?.order_id ?? op?.order?.id,
                    'Cantidad asignada': formatQuantity(assignment.quantity),
                    Terminadas: formatQuantity(assignment.finished_quantity ?? 0),
                },
            },
            followUpRecord,
            onSave: () => {
                updateFollowUp();
                refreshAssignment();
            },
        });
    }

    async function refreshAssignment() {
        const data = await manufacturerOrderPieceService.get(id, {
            include:
                'orderPiece.piece,orderPiece.orderConcept.product,orderPiece.order,availableStatus,statusOfCompletedPieces,productionOrder',
        });

        setAssignment(data);
    }

    async function handleDeleteFollowUp(row) {
        if (!(await confirm(`¿Eliminar el seguimiento #${row.id}?`, { danger: true }))) {
            return;
        }

        await manufacturingFollowUpService.destroy(row.id);
        updateFollowUp();
        await refreshAssignment();
    }

    const productionOrderId =
        assignment?.production_order_id ??
        assignment?.production_order?.id ??
        assignment?.productionOrder?.id;

    const backPath = productionOrderId
        ? `/production-orders/${productionOrderId}`
        : '/manufacturers';

    const followUpColumns = [
        { title: 'ID', column: 'id', isSortable: true },
        {
            title: 'Resultado',
            column: (row) => <Badge {...getManufacturingFollowUpResultBadgeProps(row.result)} />,
        },
        {
            title: 'Cantidad',
            column: (row) => {
                const result = row.result?.value ?? row.result;

                if (!followUpRequiresQuantity(result)) {
                    return '—';
                }

                return formatQuantity(row.quantity);
            },
        },
        {
            title: 'Detalles',
            column: (row) => (
                <span className="line-clamp-2 max-w-xs whitespace-pre-wrap" title={row.details || ''}>
                    {row.details?.trim() || '—'}
                </span>
            ),
        },
        {
            title: 'Registrado por',
            column: (row) => row.user?.full_name ?? row.user?.email ?? '—',
        },
        {
            title: 'Fecha',
            column: (row) => formatDate(row.created_at),
            isSortable: true,
        },
        ...(userCan('manufacturing_follow_up.edit') || userCan('manufacturing_follow_up.delete')
            ? [
                  tableActionsColumn({
                      actions: [
                          {
                              label: 'Editar',
                              icon: IconPencil,
                              show: userCan('manufacturing_follow_up.edit'),
                              onClick: (row) => openFollowUpModal(row),
                          },
                          {
                              label: 'Eliminar',
                              icon: IconTrash,
                              show: userCan('manufacturing_follow_up.delete'),
                              danger: true,
                              onClick: (row) => handleDeleteFollowUp(row),
                          },
                      ],
                  }),
              ]
            : []),
    ];

    if (!loadingAssignment && !assignment) {
        return (
            <AppModule icon={sectionIcon}
                title="Asignación no encontrada"
                description="La pieza asignada no existe o no tiene permiso para verla."
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate(backPath)}>
                        Volver a la orden de producción
                    </Button>
                }
            />
        );
    }

    const op = getOrderPiece(assignment);
    const completedPiecesStatusRaw =
        assignment?.status_of_completed_pieces ?? assignment?.statusOfCompletedPieces;
    const completedPiecesStatus =
        completedPiecesStatusRaw && typeof completedPiecesStatusRaw === 'object'
            ? completedPiecesStatusRaw
            : null;
    const finishedQuantity = assignment?.finished_quantity ?? 0;

    return (
        <AppModule icon={sectionIcon}
            title={loadingAssignment ? 'Cargando asignación…' : getPieceLabel(assignment)}
            description={
                loadingAssignment
                    ? ''
                    : `Asignación #${assignment.id} · Seguimiento de manufactura y datos de producción.`
            }
            toolbar={
                <Button type="button" variant="secondary" onClick={() => navigate(backPath)}>
                    Volver a la orden de producción
                </Button>
            }
        >
            <div className={loadingAssignment ? 'pointer-events-none opacity-60' : undefined}>
                {!loadingAssignment && (
                    <>
                        <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField label="ID asignación">{assignment.id}</DetailField>
                            <DetailField label="Pieza">{getPieceLabel(assignment)}</DetailField>
                            <DetailField label="Pedido">
                                {op?.order_id ?? op?.order?.id ?? '—'}
                            </DetailField>
                            <DetailField label="Producto">
                                {op?.order_concept?.product?.name ??
                                    op?.orderConcept?.product?.name ??
                                    '—'}
                            </DetailField>
                            <DetailField label="Cantidad asignada">
                                {formatQuantity(assignment.quantity)}
                            </DetailField>
                            <DetailField label="Piezas terminadas">
                                {formatQuantity(finishedQuantity)} de {formatQuantity(assignment.quantity)}
                            </DetailField>
                            <DetailField label="Estado de manufactura">
                                <Badge {...getManufacturerOrderPieceStatusBadgeProps(assignment.status)} />
                            </DetailField>
                            <DetailField label="Estado de la pieza al completar">
                                <Badge {...getOrderPieceStatusBadgeProps(completedPiecesStatus)} />
                            </DetailField>
                            <DetailField label="Precio unitario">
                                {formatCatalogCost(assignment.labor_unit_price)}
                            </DetailField>
                            <DetailField label="Total mano de obra">
                                {formatCatalogCost(assignment.labor_cost)}
                            </DetailField>
                        </dl>

                        <div className="mt-6 space-y-3">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Seguimiento de manufactura
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Avances y reportes del proceso: piezas completadas o canceladas,
                                    bloqueos, advertencias e información. Las piezas terminadas se
                                    calculan con los registros de piezas completadas.
                                </p>
                            </div>

                            {canViewFollowUp ? (
                                <Table
                                    name="manufacturing-follow-up"
                                    controls={followUpControls}
                                    columns={followUpColumns}
                                    data={followUpData}
                                    loading={followUpLoading}
                                    headerRight={
                                        userCan('manufacturing_follow_up.add') && (
                                            <Button type="button" onClick={() => openFollowUpModal()}>
                                                + Registrar seguimiento
                                            </Button>
                                        )
                                    }
                                />
                            ) : (
                                <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                    No tiene permiso para consultar el seguimiento de manufactura.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppModule>
    );
}
