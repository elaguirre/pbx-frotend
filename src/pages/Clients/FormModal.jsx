import { useEffect, useState } from 'react';
import { applySelectPlusRecord, Modal, SaveButton, Input, SelectPlus } from '@features/ui';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { normalizeListResponse, parseApiErrors } from '@resources/helpers';
import { FormModal as EntityFormModal } from '@pages/Entities/FormModal';
import { clientService, entityService } from '@resources/services';

const emptyValues = {
    id: null,
    entity_id: '',
    term_in_days: 0,
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
        term_in_days: formValues.term_in_days ?? 0,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        entityService
            .getAll({ paginated: false, limit: 500 })
            .then((response) => {
                const list = normalizeListResponse(response);

                setEntities(
                    list.map((entity) => ({
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
            options: entities,
            onOptionsChange: setEntities,
            record,
            mapToOption: (entity) => ({
                value: String(entity.id),
                label: entity.name,
            }),
            onSelect: (entityId) => {
                setValues((current) => ({ ...current, entity_id: entityId }));
            },
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
        if (values.term_in_days === '' || values.term_in_days < 0) {
            nextErrors.term_in_days = 'El plazo en días es obligatorio';
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
            entity_id: Number(values.entity_id),
            term_in_days: Number(values.term_in_days),
        };

        try {
            const response = values.id
                ? await clientService.update(values.id, payload)
                : await clientService.store(payload);

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
        <Modal {...params} title={isEdit ? 'Editar cliente' : 'Crear cliente'} onClose={onClose}>
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
                <Input
                    label="Plazo en días"
                    name="term_in_days"
                    type="number"
                    min={0}
                    value={values.term_in_days}
                    onChange={handleChange}
                    required
                    error={errors.term_in_days}
                />
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
