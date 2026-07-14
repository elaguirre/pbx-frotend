import { useEffect, useState } from 'react';
import { applySelectPlusRecord, Modal, SaveButton, Input, Select, SelectPlus, Textarea } from '@features/ui';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { isPriceModified, normalizeListResponse, parseApiErrors } from '@resources/helpers';
import { FormModal as ProductFormModal } from '@pages/Products/FormModal';
import { orderConceptService, orderService, productService } from '@resources/services';

const emptyValues = {
    id: null,
    order_id: '',
    product_id: '',
    quantity: 1,
    price: '',
    price_modification_reason: '',
    details: '',
};

export function FormModal({ onSave, formValues = {}, onClose, ...params }) {
    const { userCan } = useAuth();
    const { showModal } = useGlobalModals();
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [productById, setProductById] = useState({});
    const [values, setValues] = useState({ ...emptyValues, ...formValues });
    const [errors, setErrors] = useState({});

    const originalPrice = productById[values.product_id]?.price ?? null;
    const priceModified = isPriceModified(values.price, originalPrice);

    useEffect(() => {
        Promise.all([
            orderService.getAll({ paginated: false, limit: 200, include: 'client.entity' }),
            productService.getAll({ paginated: false, limit: 500 }),
        ])
            .then(([ordersResponse, productsResponse]) => {
                const orderList = normalizeListResponse(ordersResponse);
                const productList = normalizeListResponse(productsResponse);
                const byId = {};

                setOrders(
                    orderList.map((order) => ({
                        value: String(order.id),
                        label: `#${order.id} — ${order.client?.entity?.name ?? 'Cliente'}`,
                    })),
                );

                setProducts(
                    productList.map((product) => {
                        byId[product.id] = product;

                        return {
                            value: String(product.id),
                            label: `${product.sku} — ${product.name}`,
                        };
                    }),
                );
                setProductById(byId);
            })
            .catch(() => {
                setOrders([]);
                setProducts([]);
                setProductById({});
            });
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setValues((current) => {
            const next = { ...current, [name]: value };

            if (name === 'product_id') {
                const selected = productById[value] ?? productById[Number(value)];

                next.price = selected?.price != null ? String(selected.price) : '';
                next.price_modification_reason = '';
            }

            return next;
        });
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function handleProductCreated(record) {
        const row = record?.data ?? record;

        setProductById((current) => ({ ...current, [row.id]: row }));
        applySelectPlusRecord({
            onOptionsChange: setProducts,
            record: row,
            mapToOption: (product) => ({
                value: String(product.id),
                label: `${product.sku} — ${product.name}`,
            }),
            onChange: handleChange,
            name: 'product_id',
        });
        setValues((current) => ({
            ...current,
            product_id: String(row.id),
            price: row.price != null ? String(row.price) : '',
            price_modification_reason: '',
        }));
        setErrors((current) => ({ ...current, product_id: null }));
    }

    function openProductModal() {
        showModal(<ProductFormModal />, {
            onSave: handleProductCreated,
        });
    }

    function validate() {
        const nextErrors = {};

        if (!values.order_id) nextErrors.order_id = 'El pedido es obligatorio';
        if (!values.product_id) nextErrors.product_id = 'El producto es obligatorio';
        if (!values.quantity || values.quantity < 1) nextErrors.quantity = 'Cantidad inválida';

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
            order_id: Number(values.order_id),
            product_id: Number(values.product_id),
            quantity: Number(values.quantity),
            price: priceModified ? Number(values.price) : null,
            price_modification_reason: priceModified
                ? values.price_modification_reason?.trim() || null
                : null,
            details: values.details?.trim() || null,
        };

        try {
            const response = values.id
                ? await orderConceptService.update(values.id, payload)
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
        <Modal {...params} title={values.id ? 'Editar concepto' : 'Crear concepto'} onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Select
                    label="Pedido"
                    name="order_id"
                    value={values.order_id}
                    onChange={handleChange}
                    options={orders}
                    required
                    error={errors.order_id}
                />
                <SelectPlus
                    label="Producto"
                    name="product_id"
                    value={values.product_id}
                    onChange={handleChange}
                    options={products}
                    required
                    error={errors.product_id}
                    showAdd={userCan('products.add')}
                    addLabel="Nuevo producto"
                    onAddClick={openProductModal}
                />
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
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
