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
    orderPieceService,
    orderPieceStatusService,
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

function getMaxAssignableQuantity(orderPiece, assignment) {
    if (!orderPiece) {
        return null;
    }

    const remaining =
        orderPiece.remaining_quantity != null
            ? Number(orderPiece.remaining_quantity)
            : Number(orderPiece.quantity);

    if (assignment?.id && String(assignment.order_piece_id) === String(orderPiece.id)) {
        return remaining + Number(assignment.quantity ?? 0);
    }

    return remaining;
}

export function ManufacturerOrderPieceFormModal({
    productionOrderId,
    assignment = null,
    onSave,
    onClose,
    ...params
}) {
    const isEdit = Boolean(assignment?.id);
    const [loading, setLoading] = useState(false);
    const [orderPiecesById, setOrderPiecesById] = useState({});
    const [options, setOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [values, setValues] = useState({
        available_status_id: getStatusId(
            assignment?.available_status_id ?? assignment?.available_status ?? assignment?.availableStatus,
        ),
        status_of_completed_pieces: getStatusId(
            assignment?.status_of_completed_pieces ?? assignment?.statusOfCompletedPieces,
        ),
        order_piece_id:
            assignment?.order_piece_id != null ? String(assignment.order_piece_id) : '',
        quantity: quantityToInputValue(assignment?.quantity),
    });
    const [errors, setErrors] = useState({});

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
        orderPieceService
            .getAll({
                limit: 500,
                include: 'piece,orderConcept.product,order,orderPieceStatus',
                for_production_order_id: productionOrderId,
                editing_manufacturer_order_piece_id: assignment?.id,
            })
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
    }, [assignment?.id, assignment?.order_piece_id, isEdit, productionOrderId]);

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function handleOrderPieceChange(event) {
        const orderPieceId = event.target.value;
        const orderPiece = orderPiecesById[orderPieceId];
        const maxQty = getMaxAssignableQuantity(orderPiece, assignment);

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
        const maxQty = getMaxAssignableQuantity(orderPiece, assignment);

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

        const payload = {
            production_order_id: Number(productionOrderId),
            order_piece_id: Number(values.order_piece_id),
            quantity: roundQuantity(values.quantity) ?? Number(values.quantity),
            available_status_id: Number(values.available_status_id),
            status_of_completed_pieces: Number(values.status_of_completed_pieces),
        };

        try {
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
    const maxHint = getMaxAssignableQuantity(selectedOrderPiece, assignment);

    return (
        <Modal
            {...params}
            title={isEdit ? 'Editar pieza en la orden' : 'Asignar pieza de pedido'}
            onClose={onClose}
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Select
                    label="Pieza de pedido"
                    name="order_piece_id"
                    value={values.order_piece_id}
                    onChange={handleOrderPieceChange}
                    options={options}
                    required
                    disabled={isEdit}
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
