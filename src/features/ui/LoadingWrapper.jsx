import React from 'react';
import { useApp } from '@resources/contexts';
import { PageLoader } from './PageLoader';

export function LoadingWrapper({ children }) {
    const { appIsLoading } = useApp();

    return appIsLoading ? <PageLoader /> : children;
}
