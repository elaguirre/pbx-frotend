import { useState } from 'react';
import { Button, Input, Modal, SaveButton } from '@features/ui';
import { parseApiErrors } from '@resources/helpers';
import { materialSupplierPriceService } from '@resources/services';

export function MaterialSupplierPriceFormModal({
    materialSupplierId,
    priceRecord = null,
    onSave,
    onClose,
    ...params
}) {
    const isEdit = Boolean(priceRecord?.id);
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState(
        priceRecord?.price != null ? String(priceRecord.price) : '',
    );
    const [errors, setErrors] = useState({});

    function validate() {
        const nextErrors = {};

        if (price === '' || Number(price) < 0) {
            nextErrors.price = 'El precio es obligatorio';
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

        const payload = { price: Number(price) };

        try {
            const response = isEdit
                ? await materialSupplierPriceService.update(priceRecord.id, payload)
                : await materialSupplierPriceService.store({
                      material_supplier_id: Number(materialSupplierId),
                      ...payload,
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
        <Modal
            {...params}
            title={isEdit ? 'Editar precio' : 'Registrar precio'}
            onClose={onClose}
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Input
                    label="Precio"
                    name="price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={price}
                    onChange={(event) => {
                        setPrice(event.target.value);
                        setErrors((current) => ({ ...current, price: null }));
                    }}
                    required
                    error={errors.price}
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
