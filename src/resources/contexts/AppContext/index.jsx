import React, { createContext, useState } from 'react';

export const AppContext = createContext({});

export function AppProvider({ children }) {
    const [contextLoaders, setContextLoaders] = useState({});
    const [appIsLoading, setAppIsLoading] = useState(true);

    function updateAppLoaderStatus(contexts) {
        const contextsLoading = Object.values(contexts).filter((context) => context.loading);
        setAppIsLoading(!!contextsLoading.length);
    }

    function setContextLoader(contextName, status) {
        const contexts = {
            ...contextLoaders,
            [contextName]: { loading: status },
        };

        setContextLoaders(contexts);
        updateAppLoaderStatus(contexts);
    }

    return (
        <AppContext.Provider
            value={{
                appIsLoading,
                registerContextLoader: (contextName) => setContextLoader(contextName, true),
                setContextLoaded: (contextName) => setContextLoader(contextName, false),
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
