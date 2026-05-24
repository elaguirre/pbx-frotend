import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '@resources/contexts';
import { LayoutAuth } from '@features/layouts';
import { PrivateRoutes } from './PrivateRoutes';
import { Login } from '@pages/Login';

export function Router() {
    const { isLoggedIn } = useAuth();

    return (
        <BrowserRouter>
            <Routes>
                {isLoggedIn ? (
                    <Route path="/*" element={<PrivateRoutes />} />
                ) : (
                    <Route element={<LayoutAuth />}>
                        <Route path="/*" element={<Login />} />
                    </Route>
                )}
            </Routes>
        </BrowserRouter>
    );
}
