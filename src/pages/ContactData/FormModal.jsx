import { useEffect, useState } from 'react';
import { Modal, SaveButton, Input, Select } from '@features/ui';
import { CONTACT_DATA_TYPES } from '@resources/constants/catalog';
import { parseApiErrors } from '@resources/helpers';
import { contactDataService, entityService } from '@resources/services';

const emptyValues = {
    id: null,
    entity_id: '',
    type: 'email',
    value: '',
};

export function FormModal({ onSave, formValues = {}, entityId, onClose, ...params }) {
    const fixedEntityId = entityId != null ? String(entityId) : null;
    const [loading, setLoading] = useState(false);
    const [entities, setEntities] = useState([]);
    const [values, setValues] = useState({
        ...emptyValues,
        ...formValues,
        entity_id:
            fixedEntityId ??
            (formValues.entity_id != null ? String(formValues.entity_id) : ''),
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (fixedEntityId) {
            return;
        }

        entityService
            .getAll({ paginated: false, limit: 500 })
            .then((response) => {
                const list = Array.isArray(response) ? response : response?.data ?? [];

                setEntities(
                    list.map((entity) => ({
                        value: String(entity.id),
                        label: entity.name,
                    })),
                );
            })
            .catch(() => setEntities([]));
    }, [fixedEntityId]);

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function validate() {
        const nextErrors = {};

        if (!values.entity_id && !fixedEntityId) {
            nextErrors.entity_id = 'La entidad es obligatoria';
        }
        if (!values.type) nextErrors.type = 'El tipo es obligatorio';
        if (!values.value?.trim()) nextErrors.value = 'El valor es obligatorio';

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
            entity_id: Number(fixedEntityId ?? values.entity_id),
            type: values.type,
            value: values.value.trim(),
        };

        try {
            const response = values.id
                ? await contactDataService.update(values.id, payload)
                : await contactDataService.store(payload);

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
        <Modal {...params} title={values.id ? 'Editar contacto' : 'Crear contacto'} onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                {!fixedEntityId && (
                    <Select
                        label="Entidad"
                        name="entity_id"
                        value={values.entity_id}
                        onChange={handleChange}
                        options={entities}
                        required
                        error={errors.entity_id}
                    />
                )}
                <Select
                    label="Tipo"
                    name="type"
                    value={values.type}
                    onChange={handleChange}
                    options={CONTACT_DATA_TYPES}
                    required
                    error={errors.type}
                />
                <Input
                    label="Valor"
                    name="value"
                    value={values.value}
                    onChange={handleChange}
                    required
                    error={errors.value}
                />
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
