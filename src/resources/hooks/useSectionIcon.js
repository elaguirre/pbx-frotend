import { useLocation } from 'react-router-dom';
import { getMenuIconForPath } from '@resources/menu';

export function useSectionIcon() {
    const { pathname } = useLocation();

    return getMenuIconForPath(pathname);
}
