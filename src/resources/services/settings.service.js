import axios from 'axios';

export const settingsService = {
    getAll() {
        return axios.get('/settings').then((res) => res.data);
    },
};
