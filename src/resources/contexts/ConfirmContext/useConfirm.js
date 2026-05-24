import { useContext } from 'react';
import { ConfirmContext } from './index';

export function useConfirm() {
    return useContext(ConfirmContext);
}
