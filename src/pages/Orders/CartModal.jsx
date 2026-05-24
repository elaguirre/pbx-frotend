import { useEffect, useMemo, useState } from 'react';
import { IconPencil, IconX } from '@tabler/icons-react';
import { Button, Icon, Modal } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { formatMoney, formatQuantity, getOrderTotal } from '@resources/helpers';
import { useAppStore } from '@resources/store';
import { orderConceptService } from '@resources/services';
import { OrderConceptFormModal } from './OrderConceptFormModal';

export function CartModal({ onClose, ...params }) {
    const { userCan } = useAuth();
    const { confirm, alert } = useConfirm();
    const { showModal } = useGlobalModals();
    const currentOrder = useAppStore((state) => state.currentOrder);
    const fetchCurrentOrder = useAppStore((state) => state.fetchCurrentOrder);
    const checkoutOrder = useAppStore((state) => state.checkoutOrder);
    const [loading, setLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    useEffect(() => {
        fetchCurrentOrder();
    }, []);

    const concepts = currentOrder?.concepts ?? [];
    const clientName = currentOrder?.client?.entity?.name ?? '—';

    const orderTotal = useMemo(() => getOrderTotal(concepts), [concepts]);

    async function refreshOrder() {
        await fetchCurrentOrder();
    }

    async function handleRemoveConcept(concept) {
        if (!(await confirm(`¿Quitar "${concept.product?.name}" del pedido?`, { danger: true }))) {
            return;
        }

        setLoading(true);

        try {
            await orderConceptService.destroy(concept.id);
            await refreshOrder();
        } catch (error) {
            const message = error.response?.data?.message ?? 'No se pudo quitar el concepto.';

            await alert(message, { title: 'Error' });
        } finally {
            setLoading(false);
        }
    }

    function openEditConcept(concept) {
        showModal(<OrderConceptFormModal />, {
            orderId: currentOrder.id,
            concept: { ...concept },
            onSave: refreshOrder,
        });
    }

    async function handleCheckout() {
        if (!(await confirm('¿Cerrar este pedido? Quedará en estado "En proceso".'))) {
            return;
        }

        setCheckoutLoading(true);

        try {
            await checkoutOrder();
            onClose?.();
        } catch (error) {
            const message = error.response?.data?.message ?? 'No se pudo cerrar el pedido.';

            await alert(message, { title: 'Error' });
        } finally {
            setCheckoutLoading(false);
        }
    }

    if (!currentOrder) {
        return (
            <Modal {...params} title="Pedido actual" onClose={onClose}>
                <p className="text-sm text-slate-600">No hay un pedido activo. Inicie uno desde Clientes.</p>
            </Modal>
        );
    }

    return (
        <Modal {...params} title="Pedido actual" onClose={onClose} size="lg">
            <div className="space-y-4">
                <p className="text-lg font-semibold text-slate-900">{clientName}</p>

                {concepts.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                        El pedido no tiene conceptos. Agregue productos desde el catálogo.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {concepts.map((concept) => (
                            <div
                                key={concept.id}
                                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-slate-200 p-3"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-slate-900">
                                        {concept.product?.name ?? `Producto #${concept.product_id}`}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Cantidad: {formatQuantity(concept.quantity)}
                                        {concept.price != null && ` · Precio: ${formatMoney(concept.price)}`}
                                    </p>
                                    {concept.details && (
                                        <p className="mt-1 text-xs text-slate-500">{concept.details}</p>
                                    )}
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    {userCan('order_concepts.edit') && (
                                        <button
                                            type="button"
                                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                            aria-label="Editar concepto"
                                            onClick={() => openEditConcept(concept)}
                                        >
                                            <Icon icon={IconPencil} size="md" />
                                        </button>
                                    )}
                                    {userCan('order_concepts.delete') && (
                                        <button
                                            type="button"
                                            className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50"
                                            aria-label="Quitar concepto"
                                            onClick={() => handleRemoveConcept(concept)}
                                            disabled={loading}
                                        >
                                            <Icon icon={IconX} size="md" className="text-red-600" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {concepts.length > 0 && (
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-sm font-medium text-slate-600">Total</span>
                        <span className="text-lg font-semibold text-slate-900">
                            {formatMoney(orderTotal)}
                        </span>
                    </div>
                )}

                {userCan('orders.checkout') && (
                    <div className="flex justify-end border-t border-slate-100 pt-4">
                        <Button
                            type="button"
                            onClick={handleCheckout}
                            loading={checkoutLoading}
                            disabled={concepts.length === 0}
                        >
                            Cerrar pedido
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
