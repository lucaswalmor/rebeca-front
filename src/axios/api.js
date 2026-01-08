import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

// Criar instância do axios com configuração base
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    // baseURL: 'https://rebeca.lksoftware.com.br/public/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor de requisição: adiciona token automaticamente e inicia loading
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Iniciar loading global (exceto se config.skipLoading for true)
        if (!config.skipLoading) {
            const authStore = useAuthStore();
            authStore.startLoading();
        }
        
        return config;
    },
    (error) => {
        // Parar loading em caso de erro na requisição
        const authStore = useAuthStore();
        authStore.stopLoading();
        return Promise.reject(error);
    }
);

// Interceptor de resposta: trata erros e para loading
api.interceptors.response.use(
    (response) => {
        // Parar loading global (exceto se config.skipLoading for true)
        if (!response.config.skipLoading) {
            const authStore = useAuthStore();
            authStore.stopLoading();
        }
        return response;
    },
    (error) => {
        // Parar loading em caso de erro
        if (!error.config?.skipLoading) {
            const authStore = useAuthStore();
            authStore.stopLoading();
        }
        
        if (error.response && error.response.status === 401) {
            // Token inválido ou expirado
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Opcional: redirecionar para login
            // window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;

