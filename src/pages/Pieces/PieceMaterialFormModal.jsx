import { useEffect, useState } from 'react';
import { Button, Input, Modal, SaveButton, Select } from '@features/ui';
import { parseApiErrors, quantityToInputValue, roundQuantity } from '@resources/helpers';
import { materialService, pieceMaterialService } from '@resources/services';

export function PieceMaterialFormModal({
    pieceId,
    assignment = null,
    onSave,
    onClose,
    ...params
}) {
    const isEdit = Boolean(assignment?.id);
    const [loading, setLoading] = useState(false);
    const [materialOptions, setMaterialOptions] = useState([]);
    const [values, setValues] = useState({
        material_id: assignment?.material_id ?? '',
        quantity: quantityToInputValue(assignment?.quantity),
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        materialService
            .getAll({ paginated: false, limit: 500 })
            .then((response) => {
                const list = Array.isArray(response) ? response : response?.data ?? [];

                setMaterialOptions(
                    list.map((row) => ({
                        value: row.id,
                        label: `${row.name} (${row.uom})`,
                    })),
                );
            })
            .catch(() => setMaterialOptions([]));
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function validate() {
        const nextErrors = {};

        if (!values.material_id) nextErrors.material_id = 'Seleccione un material';
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
            piece_id: Number(pieceId),
            material_id: Number(values.material_id),
            quantity: roundQuantity(values.quantity) ?? Number(values.quantity),
        };

        try {
            const response = isEdit
                ? await pieceMaterialService.update(assignment.id, payload)
                : await pieceMaterialService.store(payload);

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
            title={isEdit ? 'Editar material de la pieza' : 'Asignar material a la pieza'}
            onClose={onClose}
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Select
                    label="Material"
                    name="material_id"
                    value={values.material_id}
                    onChange={handleChange}
                    options={materialOptions}
                    required
                    error={errors.material_id}
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
