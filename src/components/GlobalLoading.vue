<template>
    <div v-if="showLoading" class="global-loading-overlay">
        <ProgressSpinner />
    </div>
</template>

<script>
import ProgressSpinner from 'primevue/progressspinner';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

export default {
    name: 'GlobalLoading',
    components: {
        ProgressSpinner
    },
    setup() {
        const authStore = useAuthStore();
        const { isLoading } = storeToRefs(authStore);

        return {
            isLoading
        };
    },
    computed: {
        showLoading() {
            return this.isLoading;
        }
    }
}
</script>

<style scoped>
.global-loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(2px);
}
</style>

