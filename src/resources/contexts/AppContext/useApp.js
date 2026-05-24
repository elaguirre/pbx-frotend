import { useContext } from 'react';
import { AppContext } from './index';

export function useApp() {
    return useContext(AppContext);
}
