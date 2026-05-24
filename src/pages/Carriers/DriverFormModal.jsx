import { useEffect, useState } from 'react';
import { applySelectPlusRecord, Modal, SaveButton, SelectPlus } from '@features/ui';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { normalizeListResponse, parseApiErrors } from '@resources/helpers';
import { FormModal as EntityFormModal } from '@pages/Entities/FormModal';
import { driverService, entityService } from '@resources/services';

export function DriverFormModal({ carrierId, onSave, onClose, ...params }) {
    const { userCan } = useAuth();
    const { showModal } = useGlobalModals();
    const [loading, setLoading] = useState(false);
    const [entities, setEntities] = useState([]);
    const [entityId, setEntityId] = useState('');
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
        setEntityId(event.target.value);
        setErrors({});
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
            onSelect: setEntityId,
        });
        setErrors({});
    }

    function openEntityModal() {
        showModal(<EntityFormModal />, {
            onSave: handleEntityCreated,
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!entityId) {
            setErrors({ entity_id: 'La entidad es obligatoria' });

            return;
        }

        setLoading(true);

        try {
            const response = await driverService.store({
                carrier_id: Number(carrierId),
                entity_id: Number(entityId),
            });

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
        <Modal {...params} title="Registrar conductor" onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <SelectPlus
                    label="Entidad"
                    name="entity_id"
                    value={entityId}
                    onChange={handleChange}
                    options={entities}
                    required
                    error={errors.entity_id}
                    showAdd={userCan('entities.add')}
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
