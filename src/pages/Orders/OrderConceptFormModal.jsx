import { useEffect, useState } from 'react';
import { Button, Input, Modal, SaveButton, Select, Textarea } from '@features/ui';
import { formatMoney, isPriceModified, parseApiErrors, quantityToInputValue, roundQuantity } from '@resources/helpers';
import { orderConceptService, productService } from '@resources/services';

function buildInitialValues({ product, concept }) {
    const sourceProduct = product ?? concept?.product;

    return {
        product_id: product?.id ?? concept?.product_id ?? '',
        quantity: concept?.quantity != null ? quantityToInputValue(concept.quantity) : '1',
        price:
            concept?.price != null
                ? String(concept.price)
                : sourceProduct?.price != null
                  ? String(sourceProduct.price)
                  : '',
        price_modification_reason: concept?.price_modification_reason ?? '',
        details: concept?.details ?? '',
        _product: sourceProduct,
    };
}

export function OrderConceptFormModal({
    orderId,
    product = null,
    concept = null,
    onSave,
    onClose,
    ...params
}) {
    const isEdit = Boolean(concept?.id);
    const hasFixedProduct = Boolean(product);
    const [loading, setLoading] = useState(false);
    const [productOptions, setProductOptions] = useState([]);
    const [values, setValues] = useState(() => buildInitialValues({ product, concept }));
    const [errors, setErrors] = useState({});

    const displayProduct = values._product ?? product ?? concept?.product;
    const originalPrice = displayProduct?.price ?? null;
    const priceModified = isPriceModified(values.price, originalPrice);

    useEffect(() => {
        if (hasFixedProduct || isEdit) {
            return;
        }

        productService
            .getAll({ paginated: false, limit: 500 })
            .then((response) => {
                const list = Array.isArray(response) ? response : response?.data ?? [];

                setProductOptions(
                    list.map((row) => ({
                        value: row.id,
                        label: `${row.sku} — ${row.name} (${formatMoney(row.price)})`,
                        row,
                    })),
                );
            })
            .catch(() => setProductOptions([]));
    }, [hasFixedProduct, isEdit]);

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function handleProductChange(event) {
        const productId = event.target.value;
        const selected = productOptions.find((option) => String(option.value) === productId);

        setValues((current) => ({
            ...current,
            product_id: productId,
            _product: selected?.row ?? null,
            price: selected?.row?.price != null ? String(selected.row.price) : '',
            price_modification_reason: '',
        }));
        setErrors((current) => ({ ...current, product_id: null }));
    }

    function validate() {
        const nextErrors = {};

        if (!values.product_id) nextErrors.product_id = 'Seleccione un producto';
        if (!values.quantity || Number(values.quantity) < 1) nextErrors.quantity = 'Cantidad inválida';

        if (priceModified && !values.price_modification_reason?.trim()) {
            nextErrors.price_modification_reason = 'Indique el motivo al modificar el precio.';
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
            order_id: orderId,
            product_id: Number(values.product_id),
            quantity: roundQuantity(values.quantity) ?? Number(values.quantity),
            price: priceModified ? Number(values.price) : null,
            price_modification_reason: priceModified
                ? values.price_modification_reason?.trim() || null
                : null,
            details: values.details?.trim() || null,
        };

        try {
            const response = isEdit
                ? await orderConceptService.update(concept.id, payload)
                : await orderConceptService.store(payload);

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
            title={isEdit ? 'Editar concepto' : 'Agregar al pedido'}
            onClose={onClose}
            size="md"
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                {displayProduct && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex gap-4">
                            {displayProduct.image ? (
                                <img
                                    src={displayProduct.image}
                                    alt={displayProduct.name}
                                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-500">
                                    Sin imagen
                                </div>
                            )}
                            <div className="min-w-0 space-y-1 text-sm">
                                <p className="font-medium text-slate-900">{displayProduct.name}</p>
                                <p className="text-slate-500">SKU: {displayProduct.sku}</p>
                                <p className="text-slate-500">
                                    Precio: {formatMoney(displayProduct.price ?? 0)}
                                </p>
                                {displayProduct.details && (
                                    <p className="line-clamp-3 text-slate-600">{displayProduct.details}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!hasFixedProduct && !isEdit && (
                    <Select
                        label="Producto"
                        name="product_id"
                        value={values.product_id}
                        onChange={handleProductChange}
                        options={productOptions}
                        required
                        error={errors.product_id}
                    />
                )}

                <Input
                    label="Cantidad"
                    name="quantity"
                    type="number"
                    min={1}
                    value={values.quantity}
                    onChange={handleChange}
                    required
                    error={errors.quantity}
                />
                <Input
                    label="Precio"
                    name="price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={values.price}
                    onChange={handleChange}
                    error={errors.price}
                />
                {priceModified && (
                    <Textarea
                        label="Motivo modificación de precio"
                        name="price_modification_reason"
                        value={values.price_modification_reason}
                        onChange={handleChange}
                        required
                        error={errors.price_modification_reason}
                    />
                )}
                <Textarea
                    label="Detalles"
                    name="details"
                    value={values.details}
                    onChange={handleChange}
                    error={errors.details}
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
