import { useEffect, useMemo, useState } from 'react';
import { applySelectPlusRecord, Modal, SaveButton, SelectPlus } from '@features/ui';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { formatQuantity, normalizeListResponse, parseApiErrors } from '@resources/helpers';
import { CarrierUnitFormModal } from '@pages/Carriers/CarrierUnitFormModal';
import { DriverFormModal } from '@pages/Carriers/DriverFormModal';
import { FormModal as CarrierFormModal } from '@pages/Carriers/FormModal';
import { carrierService, carrierUnitService, driverService, shipmentService } from '@resources/services';

const emptyValues = {
    id: null,
    carrier_id: '',
    carrier_unit_id: '',
    driver_id: '',
};

export function FormModal({ onSave, formValues = {}, onClose, ...params }) {
    const { userCan } = useAuth();
    const { showModal } = useGlobalModals();
    const [loading, setLoading] = useState(false);
    const [carriers, setCarriers] = useState([]);
    const [units, setUnits] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [values, setValues] = useState({
        ...emptyValues,
        ...formValues,
        carrier_id: formValues.carrier_id != null ? String(formValues.carrier_id) : '',
        carrier_unit_id:
            formValues.carrier_unit_id != null ? String(formValues.carrier_unit_id) : '',
        driver_id: formValues.driver_id != null ? String(formValues.driver_id) : '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        carrierService
            .getAll({ paginated: false, limit: 500, include: 'entity' })
            .then((response) => {
                const list = normalizeListResponse(response);

                setCarriers(
                    list.map((row) => ({
                        value: String(row.id),
                        label: row.entity?.name ?? `Transportista #${row.id}`,
                    })),
                );
            })
            .catch(() => setCarriers([]));
    }, []);

    useEffect(() => {
        if (!values.carrier_id) {
            setDrivers([{ value: '', label: 'Sin conductor' }]);

            return;
        }

        driverService
            .getAll({
                paginated: false,
                limit: 500,
                include: 'entity',
                carrier_id: values.carrier_id,
            })
            .then((response) => {
                const list = normalizeListResponse(response);

                setDrivers([
                    { value: '', label: 'Sin conductor' },
                    ...list.map((row) => ({
                        value: String(row.id),
                        label: row.entity?.name ?? `Conductor #${row.id}`,
                    })),
                ]);
            })
            .catch(() => setDrivers([{ value: '', label: 'Sin conductor' }]));
    }, [values.carrier_id]);

    useEffect(() => {
        if (!values.carrier_id) {
            setUnits([]);

            return;
        }

        carrierUnitService
            .getAll({ paginated: false, limit: 500, carrier_id: values.carrier_id })
            .then((response) => {
                setUnits(normalizeListResponse(response));
            })
            .catch(() => setUnits([]));
    }, [values.carrier_id]);

    const unitOptions = useMemo(
        () =>
            units.map((row) => ({
                value: String(row.id),
                label: row.description ?? `Unidad #${row.id}`,
            })),
        [units],
    );

    const selectedUnit = units.find((row) => String(row.id) === values.carrier_unit_id);

    function handleChange(event) {
        const { name, value } = event.target;

        setValues((current) => {
            const next = { ...current, [name]: value };

            if (name === 'carrier_id') {
                next.carrier_unit_id = '';
                next.driver_id = '';
            }

            return next;
        });
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function handleCarrierCreated(record) {
        const carrier = record?.data ?? record;

        applySelectPlusRecord({
            onOptionsChange: setCarriers,
            record: carrier,
            mapToOption: (row) => ({
                value: String(row.id),
                label: row.entity?.name ?? `Transportista #${row.id}`,
            }),
            onChange: handleChange,
            name: 'carrier_id',
        });
        setErrors((current) => ({ ...current, carrier_id: null }));
    }

    function handleUnitCreated(record) {
        const unit = record?.data ?? record;

        if (!unit?.id) {
            return;
        }

        setUnits((current) => {
            if (current.some((row) => String(row.id) === String(unit.id))) {
                return current;
            }

            return [...current, unit];
        });
        handleChange({
            target: {
                name: 'carrier_unit_id',
                value: String(unit.id),
                type: 'select-one',
            },
        });
    }

    function handleDriverCreated(record) {
        const driver = record?.data ?? record;

        applySelectPlusRecord({
            onOptionsChange: (updater) => {
                setDrivers((current) => {
                    const merged = updater(current);
                    const withoutEmpty = merged.filter((row) => row.value !== '');

                    return [{ value: '', label: 'Sin conductor' }, ...withoutEmpty];
                });
            },
            record: driver,
            mapToOption: (row) => ({
                value: String(row.id),
                label: row.entity?.name ?? `Conductor #${row.id}`,
            }),
            onChange: handleChange,
            name: 'driver_id',
        });
        setErrors((current) => ({ ...current, driver_id: null }));
    }

    function openCarrierModal() {
        showModal(<CarrierFormModal />, {
            onSave: handleCarrierCreated,
        });
    }

    function openUnitModal() {
        showModal(<CarrierUnitFormModal />, {
            carrierId: values.carrier_id,
            onSave: handleUnitCreated,
        });
    }

    function openDriverModal() {
        showModal(<DriverFormModal />, {
            carrierId: values.carrier_id,
            onSave: handleDriverCreated,
        });
    }

    function validate() {
        const nextErrors = {};

        if (!values.carrier_id) nextErrors.carrier_id = 'Seleccione el transportista';
        if (!values.carrier_unit_id) nextErrors.carrier_unit_id = 'Seleccione la unidad';

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
            carrier_id: Number(values.carrier_id),
            carrier_unit_id: Number(values.carrier_unit_id),
            driver_id: values.driver_id ? Number(values.driver_id) : null,
        };

        try {
            const response = values.id
                ? await shipmentService.update(values.id, payload)
                : await shipmentService.store(payload);

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
        <Modal
            {...params}
            title={values.id ? 'Editar embarque' : 'Crear embarque'}
            onClose={onClose}
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <SelectPlus
                    label="Transportista"
                    name="carrier_id"
                    value={values.carrier_id}
                    onChange={handleChange}
                    options={carriers}
                    required
                    error={errors.carrier_id}
                    showAdd={userCan('carriers.add')}
                    addLabel="Nuevo transportista"
                    onAddClick={openCarrierModal}
                />
                <SelectPlus
                    label="Unidad de transporte"
                    name="carrier_unit_id"
                    value={values.carrier_unit_id}
                    onChange={handleChange}
                    options={unitOptions}
                    required
                    disabled={!values.carrier_id}
                    error={errors.carrier_unit_id}
                    showAdd={Boolean(values.carrier_id) && userCan('carrier_units.add')}
                    addLabel="Nueva unidad"
                    onAddClick={openUnitModal}
                />
                {selectedUnit && (
                    <p className="text-sm text-slate-600">
                        Capacidad de la unidad:{' '}
                        <span className="font-medium text-slate-900">
                            {formatQuantity(selectedUnit.load_volume_capacity)} m³ ·{' '}
                            {formatQuantity(selectedUnit.load_weight_capacity)} kg
                        </span>
                    </p>
                )}
                <SelectPlus
                    label="Conductor"
                    name="driver_id"
                    value={values.driver_id}
                    onChange={handleChange}
                    options={drivers}
                    disabled={!values.carrier_id}
                    error={errors.driver_id}
                    showAdd={Boolean(values.carrier_id) && userCan('drivers.add')}
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
