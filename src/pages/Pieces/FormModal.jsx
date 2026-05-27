import { useState } from 'react';
import { Modal, SaveButton, Input } from '@features/ui';
import { parseApiErrors, quantityToInputValue, roundQuantity } from '@resources/helpers';
import { pieceService } from '@resources/services';

const emptyValues = {
    id: null,
    name: '',
    volume: '',
    weight: '',
};

export function FormModal({ onSave, formValues = {}, onClose, ...params }) {
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        ...emptyValues,
        ...formValues,
        volume: quantityToInputValue(formValues.volume),
        weight: quantityToInputValue(formValues.weight),
    });
    const [errors, setErrors] = useState({});

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function validate() {
        const nextErrors = {};

        if (!values.name?.trim()) nextErrors.name = 'El nombre es obligatorio';

        if (values.volume !== '' && Number(values.volume) < 0) {
            nextErrors.volume = 'El volumen no puede ser negativo';
        }

        if (values.weight !== '' && Number(values.weight) < 0) {
            nextErrors.weight = 'El peso no puede ser negativo';
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
            name: values.name.trim(),
            volume:
                values.volume === ''
                    ? null
                    : roundQuantity(values.volume) ?? Number(values.volume),
            weight:
                values.weight === ''
                    ? null
                    : roundQuantity(values.weight) ?? Number(values.weight),
        };

        try {
            const response = values.id
                ? await pieceService.update(values.id, payload)
                : await pieceService.store(payload);

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
        <Modal {...params} title={values.id ? 'Editar pieza' : 'Crear pieza'} onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Input
                    label="Nombre"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    required
                    error={errors.name}
                />
                <Input
                    label="Volumen (m³)"
                    name="volume"
                    type="number"
                    min={0}
                    step="any"
                    value={values.volume}
                    onChange={handleChange}
                    error={errors.volume}
                />
                <Input
                    label="Peso (kg)"
                    name="weight"
                    type="number"
                    min={0}
                    step="any"
                    value={values.weight}
                    onChange={handleChange}
                    error={errors.weight}
                />
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
