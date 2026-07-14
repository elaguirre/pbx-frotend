import { useEffect, useState } from 'react';
import { applySelectPlusRecord, Button, Modal, SaveButton, SelectPlus } from '@features/ui';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { normalizeListResponse, parseApiErrors } from '@resources/helpers';
import { FormModal as ManufacturerFormModal } from '@pages/Manufacturers/FormModal';
import { manufacturerService, productionOrderService } from '@resources/services';

export function CreateProductionOrderModal({
    productionBatchId,
    onSave,
    onClose,
    ...params
}) {
    const { userCan } = useAuth();
    const { showModal } = useGlobalModals();
    const [loading, setLoading] = useState(false);
    const [manufacturerOptions, setManufacturerOptions] = useState([]);
    const [manufacturerId, setManufacturerId] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        manufacturerService
            .getAll({ paginated: false, limit: 500, include: 'entity' })
            .then((response) => {
                setManufacturerOptions(
                    normalizeListResponse(response).map((row) => ({
                        value: String(row.id),
                        label: row.entity?.name ?? `Maquilador #${row.id}`,
                    })),
                );
            })
            .catch(() => setManufacturerOptions([]));
    }, []);

    function handleManufacturerChange(event) {
        setManufacturerId(event.target.value);
        setErrors((current) => ({ ...current, manufacturer_id: null }));
    }

    function handleManufacturerCreated(record) {
        const manufacturer = record?.data ?? record;

        applySelectPlusRecord({
            onOptionsChange: setManufacturerOptions,
            record: manufacturer,
            mapToOption: (row) => ({
                value: String(row.id),
                label: row.entity?.name ?? `Maquilador #${row.id}`,
            }),
            onChange: handleManufacturerChange,
            name: 'manufacturer_id',
        });
        setErrors((current) => ({ ...current, manufacturer_id: null }));
    }

    function openManufacturerModal() {
        showModal(<ManufacturerFormModal />, {
            onSave: handleManufacturerCreated,
        });
    }

    function validate() {
        const nextErrors = {};

        if (!manufacturerId) {
            nextErrors.manufacturer_id = 'Seleccione un maquilador';
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

        try {
            const response = await productionOrderService.store({
                manufacturer_id: Number(manufacturerId),
                production_batch_id: Number(productionBatchId),
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
        <Modal {...params} title="Nueva orden de producción" onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <SelectPlus
                    label="Maquilador"
                    name="manufacturer_id"
                    value={manufacturerId}
                    onChange={handleManufacturerChange}
                    options={manufacturerOptions}
                    required
                    error={errors.manufacturer_id}
                    showAdd={userCan('manufacturers.add')}
                    addLabel="Nuevo maquilador"
                    onAddClick={openManufacturerModal}
                />
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
