import { useState } from 'react';
import { Modal, SaveButton, Input, Select } from '@features/ui';
import { ENTITY_TYPES } from '@resources/constants/catalog';
import { parseApiErrors } from '@resources/helpers';
import { entityService } from '@resources/services';

const emptyValues = {
    id: null,
    image: '',
    name: '',
    rfc: '',
    type: 'natural_person',
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
        if (!values.type) nextErrors.type = 'El tipo es obligatorio';

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
            image: values.image?.trim() || null,
            name: values.name.trim(),
            rfc: values.rfc?.trim() || null,
            type: values.type,
        };

        try {
            const response = values.id
                ? await entityService.update(values.id, payload)
                : await entityService.store(payload);

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
        <Modal {...params} title={values.id ? 'Editar entidad' : 'Crear entidad'} onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Input
                    label="Nombre"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    required
                    error={errors.name}
                />
                <Input label="RFC" name="rfc" value={values.rfc} onChange={handleChange} error={errors.rfc} />
                <Select
                    label="Tipo"
                    name="type"
                    value={values.type}
                    onChange={handleChange}
                    options={ENTITY_TYPES}
                    required
                    error={errors.type}
                />
                <Input
                    label="Imagen (URL)"
                    name="image"
                    type="url"
                    value={values.image}
                    onChange={handleChange}
                    placeholder="https://..."
                    error={errors.image}
                />
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
