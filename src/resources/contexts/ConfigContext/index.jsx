import React, { createContext } from 'react';
import { settingsService } from '@resources/services';

export const ConfigContext = createContext({});

export function ConfigProvider({ children }) {
    const [config, setConfig] = React.useState({});

    function getConfig(key, defaultValue = null) {
        return config?.[key] ?? defaultValue;
    }

    function reload() {
        return settingsService.getAll().then(setConfig);
    }

    return (
        <ConfigContext.Provider
            value={{
                init: reload,
                reload,
                getConfig,
                configs: config,
            }}
        >
            {children}
        </ConfigContext.Provider>
    );
}
