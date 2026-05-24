import { useEffect, useState } from 'react';
import { Button, Input, Modal, SaveButton, Select } from '@features/ui';
import { normalizeListResponse, parseApiErrors, quantityToInputValue, roundQuantity } from '@resources/helpers';
import { pieceService, productPieceService } from '@resources/services';

export function ProductPieceFormModal({
    productId,
    assignment = null,
    onSave,
    onClose,
    ...params
}) {
    const isEdit = Boolean(assignment?.id);
    const [loading, setLoading] = useState(false);
    const [pieceOptions, setPieceOptions] = useState([]);
    const [values, setValues] = useState({
        piece_id: assignment?.piece_id != null ? String(assignment.piece_id) : '',
        quantity: quantityToInputValue(assignment?.quantity ?? 1),
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        pieceService
            .getAll({ limit: 500 })
            .then((response) => {
                setPieceOptions(
                    normalizeListResponse(response).map((row) => ({
                        value: String(row.id),
                        label: row.name,
                    })),
                );
            })
            .catch(() => setPieceOptions([]));
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function validate() {
        const nextErrors = {};

        if (!values.piece_id) nextErrors.piece_id = 'Seleccione una pieza';
        if (values.quantity === '' || Number(values.quantity) < 0) {
            nextErrors.quantity = 'La cantidad es obligatoria';
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
            product_id: Number(productId),
            piece_id: Number(values.piece_id),
            quantity: roundQuantity(values.quantity) ?? Number(values.quantity),
        };

        try {
            const response = isEdit
                ? await productPieceService.update(assignment.id, payload)
                : await productPieceService.store(payload);

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
            title={isEdit ? 'Editar pieza del producto' : 'Asignar pieza al producto'}
            onClose={onClose}
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Select
                    label="Pieza"
                    name="piece_id"
                    value={values.piece_id}
                    onChange={handleChange}
                    options={pieceOptions}
                    required
                    error={errors.piece_id}
                />
                <Input
                    label="Cantidad"
                    name="quantity"
                    type="number"
                    min={0}
                    step="0.0001"
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
