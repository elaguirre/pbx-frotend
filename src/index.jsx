import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { Router } from '@features/Router';
import { Compose } from '@features/ui';
import {
    AppProvider,
    ThemeProvider,
    AuthProvider,
    ConfigProvider,
    GlobalModalsProvider,
    ConfirmProvider,
} from '@resources/contexts';
import { LoadingWrapper } from '@features/ui';
import { setupAxios } from '@resources/helpers';
import '@resources/i18n';
import './index.scss';

setupAxios(axios);

ReactDOM.createRoot(document.getElementById('root')).render(
    <Compose
        components={[
            AppProvider,
            ThemeProvider,
            AuthProvider,
            ConfigProvider,
            ConfirmProvider,
            GlobalModalsProvider,
            LoadingWrapper,
        ]}
    >
        <Router />
    </Compose>
);
