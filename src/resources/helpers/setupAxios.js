import Cookies from 'js-cookie';
import { AUTH } from '@resources/constants';
import { getTenantId } from './getTenantId';
import { notify } from './notify';

function onSuccessResponseHandler(response) {
    if (response.data?.message) {
        notify.success(response.data.message);
    }

    return response;
}

function onErrorResponseHandler(error) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message;

    switch (status) {
        case 400:
            notify.warning(message || 'Solicitud inválida');
            break;
        case 401:
            notify.warning('Debes iniciar sesión para continuar');
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
            break;
        case 403:
            notify.warning(message || 'Acceso denegado');
            break;
        case 422:
            Object.values(error.response.data.errors || {}).forEach((fieldErrors) => {
                fieldErrors.forEach((msg) => notify.warning(msg));
            });
            break;
        case 500:
            notify.error(message || 'Error interno');
            break;
        default:
            notify.error(message || 'Error inesperado');
    }

    return Promise.reject(error);
}

function onRequestingHandler(config) {
    const token = Cookies.get(AUTH.COOKIE);

    if (token) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
        };
    }

    return config;
}

export function setupAxios(axios) {
    axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL;
    axios.defaults.headers.Accept = 'application/json';
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    axios.defaults.headers.common['X-Tenant'] = getTenantId();
    axios.defaults.headers.common['X-Fingerprint-Device'] = localStorage.getItem(AUTH.DEVICE_IDENTIFIER);

    axios.defaults.validateStatus = (status) => status >= 200 && status < 400;

    axios.interceptors.request.use(onRequestingHandler, (err) => Promise.reject(err));
    axios.interceptors.response.use(onSuccessResponseHandler, onErrorResponseHandler);
}
