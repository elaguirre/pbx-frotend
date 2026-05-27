import { useEffect, useState } from 'react';
import { Modal, SaveButton, Input, Textarea, FileInput } from '@features/ui';
import { getMainImageUrl, parseApiErrors } from '@resources/helpers';
import { productService } from '@resources/services';

const emptyValues = {
    id: null,
    sku: '',
    name: '',
    price: '',
    details: '',
    images: [],
};

export function FormModal({ onSave, formValues = {}, onClose, ...params }) {
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({ ...emptyValues, ...formValues });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(() => getMainImageUrl(formValues.images));
    const [errors, setErrors] = useState({});

    useEffect(() => {
        return () => {
            if (imagePreview?.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function handleImageChange(event) {
        const file = event.target.files?.[0] ?? null;

        setImageFile(file);
        setErrors((current) => ({ ...current, image: null }));

        if (imagePreview?.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(getMainImageUrl(values.images));
        }
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

        const formData = new FormData();
        formData.append('sku', values.sku.trim());
        formData.append('name', values.name.trim());
        formData.append('price', String(Number(values.price)));
        formData.append('details', values.details?.trim() || '');

        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = values.id
                ? await productService.update(values.id, formData)
                : await productService.store(formData);

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

                <FileInput
                    label="Imagen principal"
                    name="image"
                    previewUrl={imagePreview}
                    onChange={handleImageChange}
                    hint="JPG, PNG o WebP. Máximo 5 MB."
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
