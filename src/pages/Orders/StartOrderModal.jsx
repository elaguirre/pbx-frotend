import { useEffect, useState } from 'react';
import { IconInfoCircle } from '@tabler/icons-react';
import { Alert, Modal, SaveButton, SelectPlus } from '@features/ui';
import { normalizeListResponse, parseApiErrors } from '@resources/helpers';
import { useAppStore } from '@resources/store';
import { clientService } from '@resources/services';

export function StartOrderModal({ onSave, onClose, ...params }) {
    const startOrder = useAppStore((state) => state.startOrder);
    const fetchCurrentOrder = useAppStore((state) => state.fetchCurrentOrder);
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [clientId, setClientId] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        clientService
            .getAll({ paginated: false, limit: 500, include: 'entity' })
            .then((response) => {
                const list = normalizeListResponse(response);

                setClients(
                    list.map((row) => ({
                        value: String(row.id),
                        label: row.entity?.name ?? `Cliente #${row.id}`,
                    })),
                );
            })
            .catch(() => setClients([]));
    }, []);

    function handleClientChange(event) {
        setClientId(event.target.value);
        setErrors((current) => ({ ...current, client_id: null }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!clientId) {
            setErrors({ client_id: 'Seleccione un cliente' });

            return;
        }

        setLoading(true);

        try {
            const order = await startOrder(Number(clientId));
            await fetchCurrentOrder();
            onSave?.(order);
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
        <Modal {...params} title="Nuevo pedido" onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <SelectPlus
                    label="Cliente"
                    name="client_id"
                    value={clientId}
                    onChange={handleClientChange}
                    options={clients}
                    required
                    error={errors.client_id}
                />
                <Alert style="info" icon={IconInfoCircle}>
                    Al continuar se iniciará un nuevo pedido y reemplazará al pedido activo actual,
                    si existe.
                </Alert>
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading}>Iniciar pedido</SaveButton>
                </div>
            </form>
        </Modal>
    );
}
