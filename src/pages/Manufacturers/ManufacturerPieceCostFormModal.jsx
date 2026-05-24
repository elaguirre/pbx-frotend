import { useEffect, useState } from 'react';
import { Button, Input, Modal, SaveButton, Select } from '@features/ui';
import { normalizeListResponse, parseApiErrors } from '@resources/helpers';
import { manufacturerPieceCostService, pieceService } from '@resources/services';

export function ManufacturerPieceCostFormModal({
    manufacturerId,
    costRecord = null,
    onSave,
    onClose,
    ...params
}) {
    const isEdit = Boolean(costRecord?.id);
    const [loading, setLoading] = useState(false);
    const [pieceOptions, setPieceOptions] = useState([]);
    const [values, setValues] = useState({
        piece_id: costRecord?.piece_id != null ? String(costRecord.piece_id) : '',
        price: costRecord?.price != null ? String(costRecord.price) : '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        pieceService
            .getAll({ paginated: false, limit: 500 })
            .then((response) => {
                const list = normalizeListResponse(response);

                setPieceOptions(
                    list.map((row) => ({
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
        if (values.price === '' || Number(values.price) < 0) nextErrors.price = 'Indique un precio válido';

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
            manufacturer_id: Number(manufacturerId),
            piece_id: Number(values.piece_id),
            price: Number(values.price),
        };

        try {
            const response = isEdit
                ? await manufacturerPieceCostService.update(costRecord.id, payload)
                : await manufacturerPieceCostService.store(payload);

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
            title={isEdit ? 'Editar costo de pieza' : 'Registrar costo de pieza'}
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
                    disabled={isEdit}
                    error={errors.piece_id}
                />
                <Input
                    label="Precio (mano de obra)"
                    name="price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={values.price}
                    onChange={handleChange}
                    required
                    error={errors.price}
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
