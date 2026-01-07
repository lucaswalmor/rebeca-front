import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * Store de autenticação usando Pinia
 * Esta store é usada apenas para casos específicos que precisam de reatividade
 * Para verificações simples, continue usando as funções globais em utils/global.js
 */
export const useAuthStore = defineStore('auth', () => {
    // Estado reativo - usado apenas para forçar atualização de componentes
    const updateTrigger = ref(0);
    const isLoading = ref(false);
    const requestCount = ref(0);

    // Actions
    function triggerUpdate() {
        // Incrementa o trigger para forçar reatividade em componentes que observam a store
        updateTrigger.value++;
    }

    function login() {
        // Apenas dispara atualização - os dados são salvos no localStorage pelas funções globais
        triggerUpdate();
    }

    function logout() {
        // Apenas dispara atualização - os dados são removidos do localStorage pelas funções globais
        triggerUpdate();
    }

    function startLoading() {
        requestCount.value++;
        if (requestCount.value === 1) {
            isLoading.value = true;
        }
    }

    function stopLoading() {
        requestCount.value = Math.max(0, requestCount.value - 1);
        if (requestCount.value === 0) {
            isLoading.value = false;
        }
    }

    return {
        // State (para reatividade)
        updateTrigger,
        isLoading,
        requestCount,
        // Actions
        triggerUpdate,
        login,
        logout,
        startLoading,
        stopLoading
    };
});

