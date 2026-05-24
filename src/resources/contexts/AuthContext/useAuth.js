import { useContext } from 'react';
import { AuthContext } from './index';

export function useAuth() {
    return useContext(AuthContext);
}
