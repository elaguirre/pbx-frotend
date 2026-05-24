import { useState } from 'react';
import { Input, Modal, SaveButton, Textarea } from '@features/ui';
import { parseApiErrors, quantityToInputValue, roundQuantity } from '@resources/helpers';
import { carrierUnitService } from '@resources/services';

const emptyValues = {
    id: null,
    description: '',
    load_volume_capacity: '',
    load_weight_capacity: '',
};

export function CarrierUnitFormModal({ carrierId, unitRecord = null, onSave, onClose, ...params }) {
    const isEdit = Boolean(unitRecord?.id);
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        ...emptyValues,
        ...unitRecord,
        description: unitRecord?.description ?? '',
        load_volume_capacity: quantityToInputValue(unitRecord?.load_volume_capacity),
        load_weight_capacity: quantityToInputValue(unitRecord?.load_weight_capacity),
    });
    const [errors, setErrors] = useState({});

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function validate() {
        const nextErrors = {};

        if (!values.description?.trim()) {
            nextErrors.description = 'Indique la descripción de la unidad';
        }

        if (!values.load_volume_capacity || Number(values.load_volume_capacity) <= 0) {
            nextErrors.load_volume_capacity = 'Indique la capacidad volumétrica (m³)';
        }

        if (!values.load_weight_capacity || Number(values.load_weight_capacity) <= 0) {
            nextErrors.load_weight_capacity = 'Indique la capacidad de peso (kg)';
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
            carrier_id: Number(carrierId),
            description: values.description.trim(),
            load_volume_capacity:
                roundQuantity(values.load_volume_capacity) ?? Number(values.load_volume_capacity),
            load_weight_capacity:
                roundQuantity(values.load_weight_capacity) ?? Number(values.load_weight_capacity),
        };

        try {
            const response = isEdit
                ? await carrierUnitService.update(unitRecord.id, payload)
                : await carrierUnitService.store(payload);

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
            title={isEdit ? 'Editar unidad de transporte' : 'Nueva unidad de transporte'}
            onClose={onClose}
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Textarea
                    label="Descripción"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Ej. Tortón caja seca, tráiler refrigerado…"
                    error={errors.description}
                />
                <Input
                    label="Capacidad volumétrica (m³)"
                    name="load_volume_capacity"
                    type="number"
                    min={0.0001}
                    step="any"
                    value={values.load_volume_capacity}
                    onChange={handleChange}
                    required
                    error={errors.load_volume_capacity}
                />
                <Input
                    label="Capacidad de peso (kg)"
                    name="load_weight_capacity"
                    type="number"
                    min={0.0001}
                    step="any"
                    value={values.load_weight_capacity}
                    onChange={handleChange}
                    required
                    error={errors.load_weight_capacity}
                />
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
