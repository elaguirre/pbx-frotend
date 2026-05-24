import { useState } from 'react';
import { Modal, SaveButton, Input } from '@features/ui';
import { parseApiErrors } from '@resources/helpers';
import { materialService } from '@resources/services';

const emptyValues = {
    id: null,
    name: '',
    uom: '',
};

export function FormModal({ onSave, formValues = {}, onClose, ...params }) {
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({ ...emptyValues, ...formValues });
    const [errors, setErrors] = useState({});

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function validate() {
        const nextErrors = {};

        if (!values.name?.trim()) nextErrors.name = 'El nombre es obligatorio';
        if (!values.uom?.trim()) nextErrors.uom = 'La unidad de medida es obligatoria';

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
            uom: values.uom.trim(),
        };

        try {
            const response = values.id
                ? await materialService.update(values.id, payload)
                : await materialService.store(payload);

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
        <Modal {...params} title={values.id ? 'Editar material' : 'Crear material'} onClose={onClose}>
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
                    label="Unidad de medida"
                    name="uom"
                    value={values.uom}
                    onChange={handleChange}
                    required
                    error={errors.uom}
                />
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
