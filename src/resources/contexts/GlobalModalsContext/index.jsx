import React, { createContext, useEffect, useState } from 'react';
import { uuidv4 } from '@resources/helpers';

export const GlobalModalsContext = createContext({});

export function GlobalModalsProvider({ children }) {
    const [modalsToShow, setModalsToShow] = useState([]);

    function showModal(modal, params = {}) {
        const modalId = uuidv4();

        setModalsToShow((modals) => [
            ...modals,
            {
                modal,
                modalId,
                params,
            },
        ]);

        return modalId;
    }

    function hideModal(modalId) {
        setModalsToShow((modals) => modals.filter((modal) => modal.modalId !== modalId));
    }

    useEffect(() => {
        if (modalsToShow.length > 0) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }, [modalsToShow]);

    return (
        <GlobalModalsContext.Provider value={{ showModal, hideModal }}>
            {children}

            {modalsToShow.map(({ modal, modalId, params }, index) =>
                React.cloneElement(modal, {
                    ...params,
                    zIndex: 100 + index,
                    key: modalId,
                    onClose: () => hideModal(modalId),
                })
            )}
        </GlobalModalsContext.Provider>
    );
}
