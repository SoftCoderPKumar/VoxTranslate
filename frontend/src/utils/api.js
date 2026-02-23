import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_URL || '',
    withCredentials: true,
    headers: { "Content-Type": 'application/json' },
    timeout: 30000,
})

// Response interceptor - handle 401 with token refresh
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);
const onRefreshed = () => refreshSubscribers.forEach(cb => cb());
const clearSubscribers = () => { refreshSubscribers = []; };

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh') &&
            !originalRequest.url?.includes('/auth/login')
        ) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => {
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post('/api/auth/refresh');
                onRefreshed();
                clearSubscribers();
                isRefreshing = false;
                return api(originalRequest);
            } catch (refreshError) {
                clearSubscribers();
                isRefreshing = false;
                // Redirect to login
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;