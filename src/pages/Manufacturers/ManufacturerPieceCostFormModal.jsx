import { useEffect, useState } from 'react';
import { applySelectPlusRecord, Button, Input, Modal, SaveButton, SelectPlus } from '@features/ui';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { normalizeListResponse, parseApiErrors } from '@resources/helpers';
import { FormModal as PieceFormModal } from '@pages/Pieces/FormModal';
import { manufacturerPieceCostService, pieceService } from '@resources/services';

export function ManufacturerPieceCostFormModal({
    manufacturerId,
    costRecord = null,
    onSave,
    onClose,
    ...params
}) {
    const { userCan } = useAuth();
    const { showModal } = useGlobalModals();
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

    function handlePieceCreated(record) {
        applySelectPlusRecord({
            onOptionsChange: setPieceOptions,
            record,
            mapToOption: (piece) => ({
                value: String(piece.id),
                label: piece.name,
            }),
            onChange: handleChange,
            name: 'piece_id',
        });
        setErrors((current) => ({ ...current, piece_id: null }));
    }

    function openPieceModal() {
        showModal(<PieceFormModal />, {
            onSave: handlePieceCreated,
        });
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
                <SelectPlus
                    label="Pieza"
                    name="piece_id"
                    value={values.piece_id}
                    onChange={handleChange}
                    options={pieceOptions}
                    required
                    disabled={isEdit}
                    error={errors.piece_id}
                    showAdd={!isEdit && userCan('pieces.add')}
                    addLabel="Nueva pieza"
                    onAddClick={openPieceModal}
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
