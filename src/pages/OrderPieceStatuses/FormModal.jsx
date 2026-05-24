import { useState } from 'react';
import { Modal, SaveButton, Input, Textarea, Select } from '@features/ui';
import { ORDER_PIECE_STATUS_ROLES } from '@resources/constants/orderPieceStatusRole';
import { parseApiErrors } from '@resources/helpers';
import { orderPieceStatusService } from '@resources/services';

const emptyValues = {
    id: null,
    name: '',
    details: '',
    role: '',
    order: '',
};

export function FormModal({ onSave, formValues = {}, onClose, ...params }) {
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        ...emptyValues,
        ...formValues,
        role: formValues.role ?? '',
    });
    const [errors, setErrors] = useState({});

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({
            ...current,
            [name]: value,
        }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function validate() {
        const nextErrors = {};

        if (!values.name?.trim()) {
            nextErrors.name = 'El nombre es obligatorio';
        }

        if (values.order === '' || values.order == null || Number(values.order) < 0) {
            nextErrors.order = 'Indique un orden válido (0 o mayor)';
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
            name: values.name.trim(),
            details: values.details?.trim() || null,
            role: values.role || null,
            order: Number(values.order),
        };

        try {
            const response = values.id
                ? await orderPieceStatusService.update(values.id, payload)
                : await orderPieceStatusService.store(payload);

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
            title={values.id ? 'Editar estado de pieza' : 'Crear estado de pieza'}
            onClose={onClose}
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Input
                    label="Nombre"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    required
                    error={errors.name}
                />
                <Input
                    label="Orden"
                    name="order"
                    type="number"
                    min={0}
                    step={1}
                    value={values.order}
                    onChange={handleChange}
                    required
                    error={errors.order}
                />
                <Select
                    label="Rol"
                    name="role"
                    value={values.role}
                    onChange={handleChange}
                    options={ORDER_PIECE_STATUS_ROLES}
                    error={errors.role}
                />
                <Textarea
                    label="Detalles"
                    name="details"
                    value={values.details}
                    onChange={handleChange}
                    error={errors.details}
                />
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
