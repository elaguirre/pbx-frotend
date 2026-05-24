import { useEffect, useState } from 'react';
import { Button, Modal, SaveButton, Select } from '@features/ui';
import { normalizeListResponse, parseApiErrors } from '@resources/helpers';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { driverService, shipmentDriverService } from '@resources/services';
import { DriverFormModal } from '@pages/Carriers/DriverFormModal';

export function ShipmentDriverFormModal({ shipmentId, carrierId, onSave, onClose, ...params }) {
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

    function openDriverModal() {
        showModal(<DriverFormModal />, {
            carrierId,
            onSave: async (driver) => {
                await loadDrivers();

                if (driver?.id) {
                    setDriverId(String(driver.id));
                }
            },
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
                <Select
                    label="Conductor"
                    name="driver_id"
                    value={driverId}
                    onChange={(event) => {
                        setDriverId(event.target.value);
                        setErrors({});
                    }}
                    options={drivers}
                    required
                    disabled={!carrierId}
                    error={errors.driver_id}
                />
                {carrierId && userCan('drivers.add') && (
                    <Button type="button" variant="secondary" onClick={openDriverModal}>
                        + Registrar conductor
                    </Button>
                )}
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
