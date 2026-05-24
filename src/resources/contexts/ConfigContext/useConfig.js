import { useContext } from 'react';
import { ConfigContext } from './index';

export function useConfig() {
    return useContext(ConfigContext);
}
