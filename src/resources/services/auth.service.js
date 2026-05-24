import axios from 'axios';

export const authService = {
    login(data) {
        return axios.post('/login', data).then((res) => res.data);
    },
    getMe() {
        return axios.get('/me').then((res) => res.data);
    },
};
