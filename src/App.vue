<template>
    <GlobalLoading />
    <Toast position="top-right" />
    <router-view/>
</template>

<script>
import GlobalLoading from '@/components/GlobalLoading.vue';
import Toast from 'primevue/toast';
import api from '@/axios/api';
import { chatLog } from '@/utils/echo';
import { useChatStore } from '@/stores/chat';

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
        window.addEventListener('chat:incoming', this.onIncomingChat);
        // Garante inbox ligado em qualquer tela após login
        const token = localStorage.getItem('token');
        if (token) {
            useChatStore().bindInbox();
            useChatStore().fetchUnread();
        }
    },
    beforeUnmount() {
        this.stopHeartbeat();
        document.removeEventListener('visibilitychange', this.onVisibility);
        window.removeEventListener('chat:incoming', this.onIncomingChat);
    },
    methods: {
        onIncomingChat(event) {
            const detail = event?.detail || {};
            this.$toast.add({
                severity: 'info',
                summary: `Nova mensagem de ${detail.sender || 'alguém'}`,
                detail: detail.preview || 'Abra o chat para responder',
                life: 4500,
            });
        },
        onVisibility() {
            if (document.visibilityState === 'visible') {
                this.pingHeartbeat();
                if (localStorage.getItem('token')) {
                    useChatStore().fetchUnread();
                }
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
