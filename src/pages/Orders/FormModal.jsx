import { useState } from 'react';
import { Modal, SaveButton, Select, Textarea } from '@features/ui';
import { isOrderStatusCanceled, ORDER_STATUS_OPTIONS, ORDER_STATUS_STARTED } from '@resources/constants/orders';
import { parseApiErrors } from '@resources/helpers';
import { orderService } from '@resources/services';

const emptyValues = {
    id: null,
    status: String(ORDER_STATUS_STARTED),
    cancellation_reason: '',
};

export function FormModal({ onSave, formValues = {}, onClose, ...params }) {
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        ...emptyValues,
        status:
            formValues.status != null && formValues.status !== ''
                ? String(
                      typeof formValues.status === 'object'
                          ? (formValues.status.value ?? formValues.status)
                          : formValues.status,
                  )
                : emptyValues.status,
        cancellation_reason: formValues.cancellation_reason ?? '',
        id: formValues.id ?? null,
    });
    const [errors, setErrors] = useState({});

    const clientName =
        formValues.client?.entity?.name ??
        (formValues.client_id ? `Cliente #${formValues.client_id}` : '—');

    const isCanceled = isOrderStatusCanceled(values.status);

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => {
            const next = { ...current, [name]: value };

            if (name === 'status' && !isOrderStatusCanceled(value)) {
                next.cancellation_reason = '';
            }

            return next;
        });
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function validate() {
        const nextErrors = {};

        if (values.status === '' || values.status == null) {
            nextErrors.status = 'El estado es obligatorio';
        }

        if (isOrderStatusCanceled(values.status) && !values.cancellation_reason?.trim()) {
            nextErrors.cancellation_reason = 'El motivo de cancelación es obligatorio';
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
            status: Number(values.status),
            cancellation_reason: isOrderStatusCanceled(values.status)
                ? values.cancellation_reason.trim()
                : null,
        };

        try {
            const response = await orderService.update(values.id, payload);

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
        <Modal {...params} title={`Editar pedido #${values.id}`} onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Cliente:</span> {clientName}
                </p>

                <Select
                    label="Estado"
                    name="status"
                    value={values.status}
                    onChange={handleChange}
                    options={ORDER_STATUS_OPTIONS}
                    required
                    error={errors.status}
                />

                {isCanceled && (
                    <Textarea
                        label="Motivo de cancelación"
                        name="cancellation_reason"
                        value={values.cancellation_reason}
                        onChange={handleChange}
                        placeholder="Indique por qué se cancela el pedido"
                        required
                        error={errors.cancellation_reason}
                    />
                )}

                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
