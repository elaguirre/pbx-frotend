import { createContext, useCallback, useEffect, useState } from 'react';
import { ConfirmDialog } from '@features/ui/ConfirmDialog';

export const ConfirmContext = createContext({});

export function ConfirmProvider({ children }) {
    const [dialog, setDialog] = useState(null);

    const closeDialog = useCallback((result) => {
        setDialog((current) => {
            current?.resolve(result);

            return null;
        });
    }, []);

    const confirm = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            setDialog({
                type: 'confirm',
                message,
                title: options.title ?? 'Confirmar',
                confirmLabel: options.confirmLabel ?? 'Confirmar',
                cancelLabel: options.cancelLabel ?? 'Cancelar',
                danger: options.danger ?? false,
                resolve,
            });
        });
    }, []);

    const alert = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            setDialog({
                type: 'alert',
                message,
                title: options.title ?? 'Aviso',
                confirmLabel: options.confirmLabel ?? 'Aceptar',
                resolve,
            });
        });
    }, []);

    useEffect(() => {
        if (dialog) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }, [dialog]);

    return (
        <ConfirmContext.Provider value={{ confirm, alert }}>
            {children}

            {dialog && (
                <ConfirmDialog
                    type={dialog.type}
                    title={dialog.title}
                    message={dialog.message}
                    confirmLabel={dialog.confirmLabel}
                    cancelLabel={dialog.cancelLabel}
                    danger={dialog.danger}
                    onConfirm={() => closeDialog(true)}
                    onCancel={() => closeDialog(dialog.type === 'alert' ? true : false)}
                />
            )}
        </ConfirmContext.Provider>
    );
}
