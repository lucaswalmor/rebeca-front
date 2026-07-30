import { disconnectEcho } from '@/utils/echo';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import api from '@/axios/api';

export async function performLogout({ toast, router } = {}) {
    const authStore = useAuthStore();
    const chatStore = useChatStore();

    try {
        await api.post('/logout');
    } catch (e) {
        // segue com limpeza local mesmo se a API falhar
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    chatStore.reset();
    disconnectEcho();
    authStore.logout();

    if (toast) {
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Logout realizado com sucesso!',
            life: 3000,
        });
    }

    if (router) {
        setTimeout(() => {
            router.push('/home');
        }, 600);
    }
}
