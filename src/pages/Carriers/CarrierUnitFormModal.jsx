import { useState } from 'react';
import { Input, Modal, SaveButton, Textarea } from '@features/ui';
import { parseApiErrors, quantityToInputValue, roundQuantity } from '@resources/helpers';
import { carrierUnitService } from '@resources/services';

const emptyValues = {
    id: null,
    description: '',
    load_volume_capacity: '',
    load_weight_capacity: '',
    price_by_volume: '',
    price_by_weight: '',
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
        price_by_volume: quantityToInputValue(unitRecord?.price_by_volume),
        price_by_weight: quantityToInputValue(unitRecord?.price_by_weight),
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

        if (values.price_by_volume !== '' && Number(values.price_by_volume) < 0) {
            nextErrors.price_by_volume = 'El precio por volumen no puede ser negativo';
        }

        if (values.price_by_weight !== '' && Number(values.price_by_weight) < 0) {
            nextErrors.price_by_weight = 'El precio por peso no puede ser negativo';
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
            price_by_volume:
                values.price_by_volume === ''
                    ? null
                    : roundQuantity(values.price_by_volume) ?? Number(values.price_by_volume),
            price_by_weight:
                values.price_by_weight === ''
                    ? null
                    : roundQuantity(values.price_by_weight) ?? Number(values.price_by_weight),
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
                <Input
                    label="Precio por volumen (por m³)"
                    name="price_by_volume"
                    type="number"
                    min={0}
                    step="0.01"
                    value={values.price_by_volume}
                    onChange={handleChange}
                    error={errors.price_by_volume}
                />
                <Input
                    label="Precio por peso (por kg)"
                    name="price_by_weight"
                    type="number"
                    min={0}
                    step="0.01"
                    value={values.price_by_weight}
                    onChange={handleChange}
                    error={errors.price_by_weight}
                />
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
