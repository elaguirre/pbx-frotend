import { useEffect, useState } from 'react';
import { Input, Modal, SaveButton, Select } from '@features/ui';
import { ENTITY_ADDRESS_TYPES } from '@resources/constants/catalog';
import { normalizeListResponse, parseApiErrors } from '@resources/helpers';
import { cityService, entityAddressService, stateService } from '@resources/services';

const emptyValues = {
    id: null,
    type: 'shipping',
    street: '',
    external_number: '',
    internal_number: '',
    suburb: '',
    state_id: '',
    city_id: '',
};

export function FormModal({ onSave, formValues = {}, entityId, onClose, ...params }) {
    const fixedEntityId = entityId != null ? Number(entityId) : null;
    const [loading, setLoading] = useState(false);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [values, setValues] = useState({
        ...emptyValues,
        ...formValues,
        type: formValues.type?.value ?? formValues.type ?? 'shipping',
        state_id:
            formValues.city?.state_id != null
                ? String(formValues.city.state_id)
                : formValues.city?.state?.id != null
                  ? String(formValues.city.state.id)
                  : '',
        city_id: formValues.city_id != null ? String(formValues.city_id) : '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        stateService
            .getAll({ sort: 'name' })
            .then((response) => {
                const list = normalizeListResponse(response);

                setStates(
                    list.map((row) => ({
                        value: String(row.id),
                        label: row.name,
                    })),
                );
            })
            .catch(() => setStates([]));
    }, []);

    useEffect(() => {
        if (!values.state_id) {
            setCities([]);

            return;
        }

        cityService
            .getAll({ state_id: values.state_id, sort: 'name' })
            .then((response) => {
                const list = normalizeListResponse(response);

                setCities(
                    list.map((row) => ({
                        value: String(row.id),
                        label: row.name,
                    })),
                );
            })
            .catch(() => setCities([]));
    }, [values.state_id]);

    function handleChange(event) {
        const { name, value } = event.target;

        setValues((current) => {
            const next = { ...current, [name]: value };

            if (name === 'state_id') {
                next.city_id = '';
            }

            return next;
        });
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function validate() {
        const nextErrors = {};

        if (!values.type) nextErrors.type = 'El tipo es obligatorio';
        if (!values.street?.trim()) nextErrors.street = 'La calle es obligatoria';
        if (!values.external_number?.trim()) {
            nextErrors.external_number = 'El número exterior es obligatorio';
        }
        if (!values.suburb?.trim()) nextErrors.suburb = 'La colonia es obligatoria';
        if (!values.state_id) nextErrors.state_id = 'Seleccione el estado';
        if (!values.city_id) nextErrors.city_id = 'Seleccione la ciudad';

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
            entity_id: fixedEntityId ?? Number(formValues.entity_id),
            type: values.type,
            street: values.street.trim(),
            external_number: values.external_number.trim(),
            internal_number: values.internal_number?.trim() || null,
            suburb: values.suburb.trim(),
            city_id: Number(values.city_id),
        };

        try {
            const response = values.id
                ? await entityAddressService.update(values.id, payload)
                : await entityAddressService.store(payload);

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
        <Modal {...params} title={values.id ? 'Editar dirección' : 'Nueva dirección'} onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Select
                    label="Tipo"
                    name="type"
                    value={values.type}
                    onChange={handleChange}
                    options={ENTITY_ADDRESS_TYPES}
                    required
                    error={errors.type}
                />
                <Input
                    label="Calle"
                    name="street"
                    value={values.street}
                    onChange={handleChange}
                    required
                    error={errors.street}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="Número exterior"
                        name="external_number"
                        value={values.external_number}
                        onChange={handleChange}
                        required
                        error={errors.external_number}
                    />
                    <Input
                        label="Número interior"
                        name="internal_number"
                        value={values.internal_number}
                        onChange={handleChange}
                        error={errors.internal_number}
                    />
                </div>
                <Input
                    label="Colonia"
                    name="suburb"
                    value={values.suburb}
                    onChange={handleChange}
                    required
                    error={errors.suburb}
                />
                <Select
                    label="Estado"
                    name="state_id"
                    value={values.state_id}
                    onChange={handleChange}
                    options={states}
                    required
                    error={errors.state_id}
                />
                <Select
                    label="Ciudad / municipio"
                    name="city_id"
                    value={values.city_id}
                    onChange={handleChange}
                    options={cities}
                    required
                    disabled={!values.state_id}
                    error={errors.city_id}
                />
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
