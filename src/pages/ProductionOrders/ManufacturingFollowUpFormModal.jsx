import { useState } from 'react';
import { Button, Input, Modal, SaveButton, Select, Textarea } from '@features/ui';
import {
    MANUFACTURING_FOLLOW_UP_RESULT_OPTIONS,
    followUpRequiresDetails,
    followUpRequiresQuantity,
} from '@resources/constants/manufacturingFollowUpResult';
import { parseApiErrors, quantityToInputValue } from '@resources/helpers';
import { manufacturingFollowUpService } from '@resources/services';

function resolveResultValue(record) {
    return record?.result?.value ?? record?.result ?? 'completed_pieces';
}

export function ManufacturingFollowUpFormModal({
    manufacturerOrderPieceId,
    followUpRecord = null,
    onSave,
    onClose,
    ...params
}) {
    const isEdit = Boolean(followUpRecord?.id);
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        result: resolveResultValue(followUpRecord),
        quantity: quantityToInputValue(followUpRecord?.quantity),
        details: followUpRecord?.details ?? '',
    });
    const [errors, setErrors] = useState({});

    const showQuantity = followUpRequiresQuantity(values.result);
    const detailsRequired = followUpRequiresDetails(values.result);

    function setField(name, value) {
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function handleResultChange(event) {
        const result = event.target.value;

        setValues((current) => ({
            ...current,
            result,
            quantity: followUpRequiresQuantity(result) ? current.quantity : '',
        }));
        setErrors({});
    }

    function validate() {
        const nextErrors = {};

        if (!values.result) {
            nextErrors.result = 'Seleccione un resultado';
        }

        if (showQuantity && (values.quantity === '' || Number(values.quantity) <= 0)) {
            nextErrors.quantity = 'La cantidad debe ser mayor a cero';
        }

        if (detailsRequired && !values.details?.trim()) {
            nextErrors.details = 'Los detalles son obligatorios';
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
            result: values.result,
            details: values.details?.trim() || null,
            quantity: showQuantity ? Number(values.quantity) : null,
        };

        try {
            const response = isEdit
                ? await manufacturingFollowUpService.update(followUpRecord.id, payload)
                : await manufacturingFollowUpService.store({
                      manufacturer_order_piece_id: Number(manufacturerOrderPieceId),
                      ...payload,
                  });

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
            title={isEdit ? 'Editar seguimiento' : 'Registrar seguimiento'}
            onClose={onClose}
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Select
                    label="Resultado"
                    name="result"
                    value={values.result}
                    onChange={handleResultChange}
                    options={MANUFACTURING_FOLLOW_UP_RESULT_OPTIONS}
                    required
                    error={errors.result}
                />
                {showQuantity && (
                    <Input
                        label="Cantidad"
                        name="quantity"
                        type="number"
                        min={0.0001}
                        step="any"
                        value={values.quantity}
                        onChange={(event) => setField('quantity', event.target.value)}
                        required
                        error={errors.quantity}
                    />
                )}
                <Textarea
                    label="Detalles"
                    name="details"
                    value={values.details}
                    onChange={(event) => setField('details', event.target.value)}
                    required={detailsRequired}
                    error={errors.details}
                    placeholder={
                        detailsRequired
                            ? 'Describa el seguimiento (obligatorio)'
                            : 'Comentarios opcionales'
                    }
                />
                <p className="text-xs text-slate-500">
                    Se registrará el usuario actual como responsable del seguimiento.
                </p>
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
