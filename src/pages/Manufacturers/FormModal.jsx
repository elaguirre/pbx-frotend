import { useEffect, useState } from 'react';
import { applySelectPlusRecord, Modal, SaveButton, SelectPlus } from '@features/ui';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { normalizeListResponse, parseApiErrors } from '@resources/helpers';
import { FormModal as EntityFormModal } from '@pages/Entities/FormModal';
import { entityService, manufacturerService } from '@resources/services';

const emptyValues = {
    id: null,
    entity_id: '',
};

export function FormModal({ onSave, formValues = {}, onClose, ...params }) {
    const { userCan } = useAuth();
    const { showModal } = useGlobalModals();
    const [loading, setLoading] = useState(false);
    const [entities, setEntities] = useState([]);
    const [values, setValues] = useState({
        ...emptyValues,
        ...formValues,
        entity_id:
            formValues.entity_id != null && formValues.entity_id !== ''
                ? String(formValues.entity_id)
                : '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        entityService
            .getAll({ limit: 500 })
            .then((response) => {
                setEntities(
                    normalizeListResponse(response).map((entity) => ({
                        value: String(entity.id),
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

    function handleEntityCreated(record) {
        applySelectPlusRecord({
            onOptionsChange: setEntities,
            record,
            mapToOption: (entity) => ({
                value: String(entity.id),
                label: entity.name,
            }),
            onChange: handleChange,
            name: 'entity_id',
        });
        setErrors((current) => ({ ...current, entity_id: null }));
    }

    function openEntityModal() {
        showModal(<EntityFormModal />, {
            onSave: handleEntityCreated,
        });
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
                ? await manufacturerService.update(values.id, payload)
                : await manufacturerService.store(payload);

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

    const isEdit = Boolean(values.id);

    return (
        <Modal {...params} title={isEdit ? 'Editar maquilador' : 'Crear maquilador'} onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <SelectPlus
                    label="Entidad"
                    name="entity_id"
                    value={values.entity_id}
                    onChange={handleChange}
                    options={entities}
                    required
                    disabled={isEdit}
                    error={errors.entity_id}
                    showAdd={!isEdit && userCan('entities.add')}
                    addLabel="Nueva entidad"
                    onAddClick={openEntityModal}
                />
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
