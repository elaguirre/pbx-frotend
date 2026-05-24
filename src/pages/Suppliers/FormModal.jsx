import { useEffect, useState } from 'react';
import { Modal, SaveButton, Select } from '@features/ui';
import { parseApiErrors } from '@resources/helpers';
import { entityService, supplierService } from '@resources/services';

const emptyValues = {
    id: null,
    entity_id: '',
};

export function FormModal({ onSave, formValues = {}, onClose, ...params }) {
    const [loading, setLoading] = useState(false);
    const [entities, setEntities] = useState([]);
    const [values, setValues] = useState({ ...emptyValues, ...formValues });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        entityService
            .getAll({ paginated: false, limit: 500 })
            .then((response) => {
                const list = Array.isArray(response) ? response : response?.data ?? [];

                setEntities(
                    list.map((entity) => ({
                        value: entity.id,
                        label: entity.name,
                    })),
                );
            })
            .catch(() => setEntities([]));
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function validate() {
        const nextErrors = {};

        if (!values.entity_id) nextErrors.entity_id = 'La entidad es obligatoria';

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
            entity_id: Number(values.entity_id),
        };

        try {
            const response = values.id
                ? await supplierService.update(values.id, payload)
                : await supplierService.store(payload);

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
        <Modal {...params} title={values.id ? 'Editar proveedor' : 'Crear proveedor'} onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Select
                    label="Entidad"
                    name="entity_id"
                    value={values.entity_id}
                    onChange={handleChange}
                    options={entities}
                    required
                    disabled={Boolean(values.id)}
                    error={errors.entity_id}
                />
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
