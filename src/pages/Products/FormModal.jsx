import { useState } from 'react';
import { Modal, SaveButton, Input, Textarea } from '@features/ui';
import { parseApiErrors } from '@resources/helpers';
import { productService } from '@resources/services';

const emptyValues = {
    id: null,
    sku: '',
    image: '',
    name: '',
    price: '',
    details: '',
};

export function FormModal({ onSave, formValues = {}, onClose, ...params }) {
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({ ...emptyValues, ...formValues });
    const [errors, setErrors] = useState({});

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function validate() {
        const nextErrors = {};

        if (!values.sku?.trim()) nextErrors.sku = 'El SKU es obligatorio';
        if (!values.name?.trim()) nextErrors.name = 'El nombre es obligatorio';
        if (values.price === '' || Number(values.price) < 0) nextErrors.price = 'El precio es obligatorio';

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
            sku: values.sku.trim(),
            image: values.image?.trim() || null,
            name: values.name.trim(),
            price: Number(values.price),
            details: values.details?.trim() || null,
        };

        try {
            const response = values.id
                ? await productService.update(values.id, payload)
                : await productService.store(payload);

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
        <Modal {...params} title={values.id ? 'Editar producto' : 'Crear producto'} onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Input
                    label="Nombre"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    required
                    error={errors.name}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="SKU"
                        name="sku"
                        value={values.sku}
                        onChange={handleChange}
                        required
                        error={errors.sku}
                    />
                    <Input
                        label="Precio"
                        name="price"
                        type="number"
                        min={0}
                        step="0.01"
                        value={values.price}
                        onChange={handleChange}
                        required
                        error={errors.price}
                    />
                </div>


                <Input
                    label="Imagen (URL)"
                    name="image"
                    type="url"
                    value={values.image}
                    onChange={handleChange}
                    placeholder="https://..."
                    error={errors.image}
                />

                <Textarea
                    label="Detalles"
                    name="details"
                    value={values.details}
                    onChange={handleChange}
                    placeholder="Descripción del producto"
                    error={errors.details}
                />

                {values.slug && (
                    <p className="text-sm text-slate-500">
                        Slug: <span className="font-mono text-slate-700">{values.slug}</span>
                    </p>
                )}

                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
