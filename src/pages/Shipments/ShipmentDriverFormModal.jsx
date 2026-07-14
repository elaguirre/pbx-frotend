import { useEffect, useState } from 'react';
import { applySelectPlusRecord, Modal, SaveButton, SelectPlus } from '@features/ui';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { normalizeListResponse, parseApiErrors } from '@resources/helpers';
import { DriverFormModal } from '@pages/Carriers/DriverFormModal';
import { driverService, shipmentDriverService } from '@resources/services';

export function ShipmentDriverFormModal({
    shipmentId,
    carrierId,
    onSave,
    onClose,
    ...params
}) {
    const { userCan } = useAuth();
    const { showModal } = useGlobalModals();
    const [loading, setLoading] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [driverId, setDriverId] = useState('');
    const [errors, setErrors] = useState({});

    function loadDrivers() {
        if (!carrierId) {
            setDrivers([]);

            return Promise.resolve();
        }

        return driverService
            .getAll({
                paginated: false,
                limit: 500,
                include: 'entity',
                carrier_id: carrierId,
            })
            .then((response) => {
                const list = normalizeListResponse(response);

                setDrivers(
                    list.map((row) => ({
                        value: String(row.id),
                        label: row.entity?.name ?? `Conductor #${row.id}`,
                    })),
                );
            })
            .catch(() => setDrivers([]));
    }

    useEffect(() => {
        loadDrivers();
    }, [carrierId]);

    function handleDriverChange(event) {
        setDriverId(event.target.value);
        setErrors({});
    }

    function handleDriverCreated(record) {
        const driver = record?.data ?? record;

        applySelectPlusRecord({
            onOptionsChange: setDrivers,
            record: driver,
            mapToOption: (row) => ({
                value: String(row.id),
                label: row.entity?.name ?? `Conductor #${row.id}`,
            }),
            onChange: handleDriverChange,
            name: 'driver_id',
        });
        setErrors({});
    }

    function openDriverModal() {
        showModal(<DriverFormModal />, {
            carrierId,
            onSave: handleDriverCreated,
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!driverId) {
            setErrors({ driver_id: 'Seleccione un conductor' });

            return;
        }

        setLoading(true);

        try {
            const response = await shipmentDriverService.store({
                shipment_id: Number(shipmentId),
                driver_id: Number(driverId),
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
        <Modal {...params} title="Asignar conductor al embarque" onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <SelectPlus
                    label="Conductor"
                    name="driver_id"
                    value={driverId}
                    onChange={handleDriverChange}
                    options={drivers}
                    required
                    disabled={!carrierId}
                    error={errors.driver_id}
                    showAdd={Boolean(carrierId) && userCan('drivers.add')}
                    addLabel="Nuevo conductor"
                    onAddClick={openDriverModal}
                />
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
