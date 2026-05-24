import React from 'react';
import { Outlet } from 'react-router-dom';

export function LayoutAuth() {
    return (
        <div className="flex min-h-full items-center justify-center p-6">
            <Outlet />
        </div>
    );
}
