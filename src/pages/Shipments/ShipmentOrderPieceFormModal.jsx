import { useEffect, useState } from 'react';
import { Input, Modal, SaveButton, Select } from '@features/ui';
import { SHIPMENT_ORDER_PIECE_STATUSES } from '@resources/constants/shipmentOrderPieces';
import {
    formatQuantity,
    getOrderConcept,
    normalizeListResponse,
    parseApiErrors,
    quantityToInputValue,
    roundQuantity,
} from '@resources/helpers';
import { orderPieceService, shipmentOrderPieceService } from '@resources/services';

function remainingForShipment(orderPiece, lineRecord = null) {
    const total = Number(orderPiece.quantity);
    const shipped = Number(orderPiece.shipped_quantity ?? 0);
    const lineQty =
        lineRecord && Number(lineRecord.order_piece_id) === Number(orderPiece.id)
            ? Number(lineRecord.quantity)
            : 0;

    return Math.max(0, total - shipped + lineQty);
}

function getOrderPieceOptionText(row, lineRecord = null) {
    const orderId = row.order_id ?? row.order?.id ?? '—';
    const product = getOrderConcept(row)?.product?.name ?? '—';
    const piece = row.piece?.name ?? `Pieza #${row.piece_id}`;
    const status = row.order_piece_status?.name ?? row.orderPieceStatus?.name ?? '—';
    const remaining = remainingForShipment(row, lineRecord);

    return `Pedido #${orderId} · ${product} · ${piece} · ${status} (disp. ${formatQuantity(remaining)} de ${formatQuantity(row.quantity)})`;
}

export function ShipmentOrderPieceFormModal({
    shipmentId,
    lineRecord = null,
    onSave,
    onClose,
    ...params
}) {
    const isEdit = Boolean(lineRecord?.id);
    const [loading, setLoading] = useState(false);
    const [orderPieces, setOrderPieces] = useState([]);
    const [orderPiecesById, setOrderPiecesById] = useState({});
    const [values, setValues] = useState({
        order_piece_id:
            lineRecord?.order_piece_id != null ? String(lineRecord.order_piece_id) : '',
        quantity: quantityToInputValue(lineRecord?.quantity),
        status: lineRecord?.status?.value ?? lineRecord?.status ?? 'pending',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isEdit || !lineRecord?.order_piece_id) {
            return;
        }

        orderPieceService
            .get(lineRecord.order_piece_id, {
                include: 'piece,orderConcept.product,order,orderPieceStatus',
                include_shipped_quantity: true,
            })
            .then((row) => {
                setOrderPiecesById((current) => ({
                    ...current,
                    [row.id]: row,
                }));
            })
            .catch(() => {});
    }, [isEdit, lineRecord?.order_piece_id]);

    useEffect(() => {
        orderPieceService
            .getAll({
                paginated: false,
                limit: 500,
                include: 'piece,orderConcept.product,order,orderPieceStatus',
                shippable_for_shipment: true,
            })
            .then((response) => {
                const list = normalizeListResponse(response);
                const byId = {};

                setOrderPieces(
                    list.map((row) => {
                        byId[row.id] = row;

                        return {
                            value: String(row.id),
                            label: getOrderPieceOptionText(row, lineRecord),
                        };
                    }),
                );
                setOrderPiecesById(byId);
            })
            .catch(() => {
                setOrderPieces([]);
                setOrderPiecesById({});
            });
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        if (name === 'order_piece_id') {
            const orderPiece = orderPiecesById[value];

            setValues({
                order_piece_id: value,
                quantity: orderPiece
                    ? quantityToInputValue(remainingForShipment(orderPiece, lineRecord))
                    : '',
            });
        } else {
            setValues((current) => ({ ...current, [name]: value }));
        }

        setErrors((current) => ({ ...current, [name]: null }));
    }

    function validate() {
        const nextErrors = {};
        const orderPiece = orderPiecesById[values.order_piece_id];
        const maxQty = orderPiece ? remainingForShipment(orderPiece, lineRecord) : null;

        if (!values.order_piece_id) {
            nextErrors.order_piece_id = 'Seleccione una pieza de pedido';
        }

        if (!values.quantity || Number(values.quantity) <= 0) {
            nextErrors.quantity = 'Indique una cantidad válida';
        } else if (maxQty != null && Number(values.quantity) > maxQty + 0.0001) {
            nextErrors.quantity = `No puede superar lo disponible para embarque (${formatQuantity(maxQty)})`;
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
            shipment_id: Number(shipmentId),
            order_piece_id: Number(values.order_piece_id),
            quantity: roundQuantity(values.quantity) ?? Number(values.quantity),
            status: values.status,
        };

        try {
            const response = isEdit
                ? await shipmentOrderPieceService.update(lineRecord.id, payload)
                : await shipmentOrderPieceService.store(payload);

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

    return (
        <Modal
            {...params}
            title={isEdit ? 'Editar pieza del embarque' : 'Agregar pieza al embarque'}
            onClose={onClose}
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Select
                    label="Pieza de pedido"
                    name="order_piece_id"
                    value={values.order_piece_id}
                    onChange={handleChange}
                    options={orderPieces}
                    required
                    disabled={isEdit}
                    error={errors.order_piece_id}
                />
                {isEdit && (
                    <Select
                        label="Estado de entrega"
                        name="status"
                        value={values.status}
                        onChange={handleChange}
                        options={SHIPMENT_ORDER_PIECE_STATUSES}
                        required
                        error={errors.status}
                    />
                )}
                <Input
                    label="Cantidad"
                    name="quantity"
                    type="number"
                    min={0.0001}
                    max={
                        values.order_piece_id && orderPiecesById[values.order_piece_id]
                            ? remainingForShipment(
                                  orderPiecesById[values.order_piece_id],
                                  lineRecord,
                              )
                            : undefined
                    }
                    step="any"
                    value={values.quantity}
                    onChange={handleChange}
                    required
                    error={errors.quantity}
                />
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
