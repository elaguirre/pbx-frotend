import React, { createContext, useEffect } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import Cookies from 'js-cookie';
import { useAppStore } from '@resources/store';
import { AUTH } from '@resources/constants';
import { authService } from '@resources/services';
import { uuidv4 } from '@resources/helpers';
import { useApp } from '../AppContext/useApp';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [deviceId, setDeviceId] = useLocalStorage(AUTH.DEVICE_IDENTIFIER, null);
    const { registerContextLoader, setContextLoaded } = useApp();
    const token = Cookies.get(AUTH.COOKIE);
    const { user, isLoggedIn, setMe, reset } = useAppStore((state) => state);

    function login(data) {
        return authService.login(data).then((data) => {
            Cookies.set(AUTH.COOKIE, data.token, { expires: 10 * 365 });
            return getMe();
        });
    }

    function getMe() {
        if (!Cookies.get(AUTH.COOKIE)) {
            return Promise.resolve({});
        }

        return authService
            .getMe()
            .then((user) => {
                setMe(user);

                if (user?.id) {
                    useAppStore.getState().fetchCurrentOrder();
                }
            })
            .catch((error) => {
                if (error.response?.status === 401) {
                    logout();
                }
                return Promise.reject(error);
            });
    }

    function logout() {
        reset();
        Cookies.remove(AUTH.COOKIE);
    }

    function userCan(ability) {
        if (!isLoggedIn) {
            return false;
        }

        return user.abilities?.includes('*') || user.abilities?.includes(ability);
    }

    useEffect(() => {
        registerContextLoader('AuthContext');

        if (!deviceId) {
            setDeviceId(uuidv4());
        }

        getMe().finally(() => setContextLoaded('AuthContext'));
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn,
                token,
                login,
                logout,
                userCan,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
