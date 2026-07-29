<template>
    <GlobalLoading />
    <Toast />
    <router-view/>
</template>

<script>
import GlobalLoading from '@/components/GlobalLoading.vue';
import Toast from 'primevue/toast';
import api from '@/axios/api';
import { chatLog } from '@/utils/echo';

export default {
    name: 'App',
    components: {
        GlobalLoading,
        Toast
    },
    data() {
        return {
            heartbeatTimer: null,
        };
    },
    mounted() {
        this.startHeartbeat();
        document.addEventListener('visibilitychange', this.onVisibility);
    },
    beforeUnmount() {
        this.stopHeartbeat();
        document.removeEventListener('visibilitychange', this.onVisibility);
    },
    methods: {
        onVisibility() {
            if (document.visibilityState === 'visible') {
                this.pingHeartbeat();
            }
        },
        startHeartbeat() {
            this.pingHeartbeat();
            this.heartbeatTimer = setInterval(() => this.pingHeartbeat(), 45000);
        },
        stopHeartbeat() {
            if (this.heartbeatTimer) {
                clearInterval(this.heartbeatTimer);
                this.heartbeatTimer = null;
            }
        },
        async pingHeartbeat() {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                await api.post('/chat/heartbeat', {}, { skipLoading: true });
                chatLog('heartbeat ok');
            } catch (e) {
                // silencioso
            }
        },
    },
}
</script>

<style>
</style>
