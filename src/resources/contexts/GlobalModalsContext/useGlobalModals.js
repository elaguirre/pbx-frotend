import { useContext } from 'react';
import { GlobalModalsContext } from './index';

export function useGlobalModals() {
    return useContext(GlobalModalsContext);
}
