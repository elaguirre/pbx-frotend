import { useState } from 'react';
import { Modal, SaveButton, Input, Select, ImageInput } from '@features/ui';
import { ENTITY_TYPES } from '@resources/constants/catalog';
import { parseApiErrors } from '@resources/helpers';
import { entityService } from '@resources/services';

const emptyValues = {
    id: null,
    name: '',
    rfc: '',
    type: 'natural_person',
    images: [],
};

export function FormModal({ onSave, formValues = {}, onClose, ...params }) {
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({ ...emptyValues, ...formValues });
    const [imageState, setImageState] = useState({ file: null, removeImage: false });
    const [errors, setErrors] = useState({});

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function handleImageChange(nextImageState) {
        setImageState(nextImageState);
        setErrors((current) => ({ ...current, image: null }));
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

        const formData = new FormData();
        formData.append('name', values.name.trim());
        formData.append('rfc', values.rfc?.trim() || '');
        formData.append('type', values.type);

        if (imageState.file) {
            formData.append('image', imageState.file);
        }

        if (imageState.removeImage) {
            formData.append('remove_image', '1');
        }

        try {
            const response = values.id
                ? await entityService.update(values.id, formData)
                : await entityService.store(formData);

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
                <ImageInput
                    label="Imagen"
                    images={values.images}
                    onChange={handleImageChange}
                    error={errors.image}
                />
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
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
