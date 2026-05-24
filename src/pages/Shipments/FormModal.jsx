import { useEffect, useMemo, useState } from 'react';
import { Modal, SaveButton, Select } from '@features/ui';
import { formatQuantity, normalizeListResponse, parseApiErrors } from '@resources/helpers';
import { carrierService, carrierUnitService, driverService, shipmentService } from '@resources/services';

const emptyValues = {
    id: null,
    carrier_id: '',
    carrier_unit_id: '',
    driver_id: '',
};

export function FormModal({ onSave, formValues = {}, onClose, ...params }) {
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
                const list = normalizeListResponse(response);

                setUnits(list);
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
                <Select
                    label="Transportista"
                    name="carrier_id"
                    value={values.carrier_id}
                    onChange={handleChange}
                    options={carriers}
                    required
                    error={errors.carrier_id}
                />
                <Select
                    label="Unidad de transporte"
                    name="carrier_unit_id"
                    value={values.carrier_unit_id}
                    onChange={handleChange}
                    options={unitOptions}
                    required
                    disabled={!values.carrier_id}
                    error={errors.carrier_unit_id}
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
                <Select
                    label="Conductor"
                    name="driver_id"
                    value={values.driver_id}
                    onChange={handleChange}
                    options={drivers}
                    disabled={!values.carrier_id}
                    error={errors.driver_id}
                />
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
