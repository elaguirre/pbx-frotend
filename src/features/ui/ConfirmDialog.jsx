import { Button } from './Button';
import { Modal } from './Modal';

export function ConfirmDialog({
    type = 'confirm',
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    danger = false,
    onConfirm,
    onCancel,
    zIndex = 1000,
}) {
    const isAlert = type === 'alert';

    return (
        <Modal
            title={title}
            size="sm"
            zIndex={zIndex}
            canHideModal={!isAlert}
            onClose={onCancel}
        >
            <p className="text-sm text-slate-600">{message}</p>
            <div className="mt-6 flex justify-end gap-2">
                {!isAlert && (
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                )}
                <Button type="button" variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
}
