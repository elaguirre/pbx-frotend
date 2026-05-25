import { useEffect, useState } from 'react';
import { Button, Input, Modal, SaveButton, Select } from '@features/ui';
import {
    formatQuantity,
    normalizeListResponse,
    parseApiErrors,
    quantityToInputValue,
    roundQuantity,
} from '@resources/helpers';
import {
    manufacturerOrderPieceService,
    manufacturerService,
    orderPieceService,
    orderPieceStatusService,
    productionOrderService,
} from '@resources/services';

function orderPieceLabel(row) {
    const orderId = row.order_id ?? row.order?.id ?? '—';
    const product = row.order_concept?.product?.name ?? row.orderConcept?.product?.name ?? '—';
    const piece = row.piece?.name ?? `Pieza #${row.piece_id}`;
    const status = row.order_piece_status?.name ?? row.orderPieceStatus?.name;
    const total = formatQuantity(row.quantity);
    const remaining = row.remaining_quantity;
    const statusSuffix = status ? ` · ${status}` : '';

    const inOrderAssigned = Number(row.assigned_quantity_in_production_order ?? 0);
    const globallyAssigned = Number(row.assigned_quantity ?? 0);

    if (remaining != null && inOrderAssigned > 0) {
        return `Pedido #${orderId} · ${product} · ${piece}${statusSuffix} (${formatQuantity(remaining)} de ${total} en esta orden)`;
    }

    if (globallyAssigned > 0) {
        return `Pedido #${orderId} · ${product} · ${piece}${statusSuffix} (${total} · asignada en otras órdenes)`;
    }

    return `Pedido #${orderId} · ${product} · ${piece}${statusSuffix} (${total})`;
}

function getStatusId(statusValue) {
    if (statusValue == null || statusValue === '') {
        return '';
    }

    if (typeof statusValue === 'object') {
        return statusValue.id != null ? String(statusValue.id) : '';
    }

    return String(statusValue);
}

function getMaxAssignableQuantity(orderPiece, assignment, productionOrderScoped = false) {
    if (!orderPiece) {
        return null;
    }

    const total = Number(orderPiece.quantity);
    let remaining;

    if (productionOrderScoped) {
        remaining =
            orderPiece.remaining_quantity != null
                ? Number(orderPiece.remaining_quantity)
                : total - Number(orderPiece.assigned_quantity_in_production_order ?? 0);
    } else {
        remaining = total;
    }

    if (assignment?.id && String(assignment.order_piece_id) === String(orderPiece.id)) {
        return remaining + Number(assignment.quantity ?? 0);
    }

    return remaining;
}

async function resolveProductionOrderId(manufacturerId) {
    const list = normalizeListResponse(
        await productionOrderService.getAll({
            manufacturer_id: Number(manufacturerId),
            paginated: false,
            limit: 1,
            sort: '-id',
        }),
    );

    if (list[0]?.id) {
        return list[0].id;
    }

    const response = await productionOrderService.store({
        manufacturer_id: Number(manufacturerId),
    });

    return (response?.data ?? response)?.id;
}

export function ManufacturerOrderPieceFormModal({
    productionOrderId: initialProductionOrderId = null,
    orderId = null,
    presetOrderPiece = null,
    assignment = null,
    onSave,
    onClose,
    ...params
}) {
    const isEdit = Boolean(assignment?.id);
    const lockOrderPiece = Boolean(presetOrderPiece?.id) && !isEdit;
    const needsManufacturer = !isEdit && !initialProductionOrderId;

    const [loading, setLoading] = useState(false);
    const [manufacturerOptions, setManufacturerOptions] = useState([]);
    const [orderPiecesById, setOrderPiecesById] = useState({});
    const [options, setOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [manufacturerId, setManufacturerId] = useState('');
    const [resolvedProductionOrderId, setResolvedProductionOrderId] = useState(null);
    const [resolvingProductionOrder, setResolvingProductionOrder] = useState(false);
    const [values, setValues] = useState({
        available_status_id: getStatusId(
            assignment?.available_status_id ?? assignment?.available_status ?? assignment?.availableStatus,
        ),
        status_of_completed_pieces: getStatusId(
            assignment?.status_of_completed_pieces ?? assignment?.statusOfCompletedPieces,
        ),
        order_piece_id:
            assignment?.order_piece_id != null
                ? String(assignment.order_piece_id)
                : presetOrderPiece?.id != null
                  ? String(presetOrderPiece.id)
                  : '',
        quantity: quantityToInputValue(
            assignment?.quantity ??
                (presetOrderPiece ? getMaxAssignableQuantity(presetOrderPiece, null) : null),
        ),
    });
    const [errors, setErrors] = useState({});

    const productionOrderId = initialProductionOrderId ?? resolvedProductionOrderId;
    const productionOrderScoped = Boolean(productionOrderId);

    useEffect(() => {
        if (!needsManufacturer || !manufacturerId) {
            setResolvedProductionOrderId(null);

            return;
        }

        let cancelled = false;
        setResolvingProductionOrder(true);

        resolveProductionOrderId(manufacturerId)
            .then((orderId) => {
                if (!cancelled) {
                    setResolvedProductionOrderId(orderId);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setResolvedProductionOrderId(null);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setResolvingProductionOrder(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [needsManufacturer, manufacturerId]);

    useEffect(() => {
        if (!needsManufacturer) {
            return;
        }

        manufacturerService
            .getAll({ paginated: false, limit: 500, include: 'entity' })
            .then((response) => {
                setManufacturerOptions(
                    normalizeListResponse(response).map((row) => ({
                        value: String(row.id),
                        label: row.entity?.name ?? `Maquilador #${row.id}`,
                    })),
                );
            })
            .catch(() => setManufacturerOptions([]));
    }, [needsManufacturer]);

    useEffect(() => {
        orderPieceStatusService
            .getAll({ paginated: false, limit: 500, sort: 'order' })
            .then((response) => {
                const list = normalizeListResponse(response).sort(
                    (a, b) => Number(a.order ?? 0) - Number(b.order ?? 0),
                );

                setStatusOptions(
                    list.map((row) => ({
                        value: String(row.id),
                        label: row.name,
                    })),
                );
            })
            .catch(() => setStatusOptions([]));
    }, []);

    useEffect(() => {
        if (needsManufacturer && !manufacturerId) {
            if (lockOrderPiece && presetOrderPiece) {
                setOrderPiecesById({ [presetOrderPiece.id]: presetOrderPiece });
                setOptions([
                    {
                        value: String(presetOrderPiece.id),
                        label: orderPieceLabel(presetOrderPiece),
                    },
                ]);
            }

            return;
        }

        if (needsManufacturer && resolvingProductionOrder) {
            return;
        }

        const pieceInclude = 'piece,orderConcept.product,order,orderPieceStatus';
        const assignmentParams = {
            include: pieceInclude,
            editing_manufacturer_order_piece_id: assignment?.id,
        };

        if (productionOrderId) {
            assignmentParams.for_production_order_id = productionOrderId;
        }

        if (lockOrderPiece && presetOrderPiece?.id) {
            orderPieceService
                .get(presetOrderPiece.id, assignmentParams)
                .then((row) => {
                    const piece = row?.data ?? row;

                    setOrderPiecesById({ [piece.id]: piece });
                    setOptions([
                        {
                            value: String(piece.id),
                            label: orderPieceLabel(piece),
                        },
                    ]);

                    if (!isEdit) {
                        const maxQty = getMaxAssignableQuantity(
                            piece,
                            assignment,
                            productionOrderScoped,
                        );

                        setValues((current) => ({
                            ...current,
                            order_piece_id: String(piece.id),
                            quantity: maxQty != null ? quantityToInputValue(maxQty) : '',
                        }));
                    }
                })
                .catch(() => {
                    setOrderPiecesById({ [presetOrderPiece.id]: presetOrderPiece });
                    setOptions([
                        {
                            value: String(presetOrderPiece.id),
                            label: orderPieceLabel(presetOrderPiece),
                        },
                    ]);
                });

            return;
        }

        const query = {
            limit: 500,
            include: pieceInclude,
            editing_manufacturer_order_piece_id: assignment?.id,
        };

        if (productionOrderId) {
            query.for_production_order_id = productionOrderId;
        } else if (orderId) {
            query.order_id = orderId;
        }

        orderPieceService
            .getAll(query)
            .then((response) => {
                const list = normalizeListResponse(response);
                const byId = {};

                const selectOptions = list.map((row) => {
                    byId[row.id] = row;

                    return {
                        value: String(row.id),
                        label: orderPieceLabel(row),
                    };
                });

                setOrderPiecesById(byId);
                setOptions(selectOptions);
            })
            .catch(() => {
                setOptions([]);
                setOrderPiecesById({});
            });
    }, [
        assignment,
        isEdit,
        lockOrderPiece,
        manufacturerId,
        needsManufacturer,
        orderId,
        presetOrderPiece,
        productionOrderId,
        productionOrderScoped,
        resolvingProductionOrder,
    ]);

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function handleOrderPieceChange(event) {
        const orderPieceId = event.target.value;
        const orderPiece = orderPiecesById[orderPieceId];
        const maxQty = getMaxAssignableQuantity(orderPiece, assignment, productionOrderScoped);

        setValues((current) => ({
            ...current,
            order_piece_id: orderPieceId,
            quantity: maxQty != null ? quantityToInputValue(maxQty) : '',
        }));
        setErrors((current) => ({ ...current, order_piece_id: null, quantity: null }));
    }

    function validate() {
        const nextErrors = {};
        const orderPiece = orderPiecesById[values.order_piece_id];
        const maxQty = getMaxAssignableQuantity(orderPiece, assignment, productionOrderScoped);

        if (needsManufacturer && !manufacturerId) {
            nextErrors.manufacturer_id = 'Seleccione un maquilador';
        }

        if (needsManufacturer && manufacturerId && resolvingProductionOrder) {
            nextErrors.manufacturer_id = 'Espere a resolver la orden de producción del maquilador';
        }

        if (needsManufacturer && manufacturerId && !resolvingProductionOrder && !productionOrderId) {
            nextErrors.manufacturer_id = 'No se pudo obtener la orden de producción del maquilador';
        }

        if (!values.available_status_id) {
            nextErrors.available_status_id = 'Seleccione el estado requerido de la pieza';
        }

        if (!values.status_of_completed_pieces) {
            nextErrors.status_of_completed_pieces = 'Seleccione el estado tras completar';
        } else if (
            values.available_status_id &&
            values.status_of_completed_pieces === values.available_status_id
        ) {
            nextErrors.status_of_completed_pieces =
                'Debe ser distinto al estado requerido';
        }

        if (!values.order_piece_id) {
            nextErrors.order_piece_id = 'Seleccione una pieza de pedido';
        }

        if (!values.quantity || Number(values.quantity) <= 0) {
            nextErrors.quantity = 'Indique una cantidad válida';
        } else if (maxQty != null && Number(values.quantity) > maxQty) {
            nextErrors.quantity = `La cantidad no puede superar ${formatQuantity(maxQty)} disponibles`;
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);

        try {
            const targetProductionOrderId =
                productionOrderId ?? (await resolveProductionOrderId(manufacturerId));

            const payload = {
                production_order_id: Number(targetProductionOrderId),
                order_piece_id: Number(values.order_piece_id),
                quantity: roundQuantity(values.quantity) ?? Number(values.quantity),
                available_status_id: Number(values.available_status_id),
                status_of_completed_pieces: Number(values.status_of_completed_pieces),
            };

            const response = isEdit
                ? await manufacturerOrderPieceService.update(assignment.id, payload)
                : await manufacturerOrderPieceService.store(payload);

            onSave?.(response?.data ?? response);
            onClose?.();
        } catch (error) {
            const apiErrors = parseApiErrors(error);

            if (apiErrors) {
                setErrors(apiErrors);
            }
        } finally {
            setLoading(false);
        }
    }

    const selectedOrderPiece = orderPiecesById[values.order_piece_id];
    const maxHint = getMaxAssignableQuantity(
        selectedOrderPiece,
        assignment,
        productionOrderScoped,
    );

    return (
        <Modal
            {...params}
            title={isEdit ? 'Editar pieza en la orden' : 'Asignar pieza de pedido'}
            onClose={onClose}
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                {needsManufacturer && (
                    <Select
                        label="Maquilador"
                        name="manufacturer_id"
                        value={manufacturerId}
                        onChange={(event) => {
                            setManufacturerId(event.target.value);
                            setErrors((current) => ({ ...current, manufacturer_id: null }));
                        }}
                        options={manufacturerOptions}
                        required
                        error={errors.manufacturer_id}
                    />
                )}
                <Select
                    label="Pieza de pedido"
                    name="order_piece_id"
                    value={values.order_piece_id}
                    onChange={handleOrderPieceChange}
                    options={options}
                    required
                    disabled={isEdit || lockOrderPiece}
                    error={errors.order_piece_id}
                />
                <Select
                    label="Estado de la pieza para manufactura"
                    name="available_status_id"
                    value={values.available_status_id}
                    onChange={handleChange}
                    options={statusOptions}
                    required
                    error={errors.available_status_id}
                />
                <Select
                    label="Estado de la pieza al completar"
                    name="status_of_completed_pieces"
                    value={values.status_of_completed_pieces}
                    onChange={handleChange}
                    options={statusOptions}
                    required
                    error={errors.status_of_completed_pieces}
                />
                <Input
                    label={
                        maxHint != null
                            ? `Cantidad (máx. ${formatQuantity(maxHint)} disponibles)`
                            : 'Cantidad'
                    }
                    name="quantity"
                    type="number"
                    min={0.0001}
                    step="any"
                    value={values.quantity}
                    onChange={handleChange}
                    required
                    error={errors.quantity}
                />
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
