import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/axios/api';
import { getEcho, chatLog, chatWarn } from '@/utils/echo';

export const useChatStore = defineStore('chat', () => {
    const unreadCount = ref(0);
    const mediaCredits = ref(0);
    const canAccessChat = ref(false);
    const inboxChannelBound = ref(false);

    async function fetchUnread() {
        const token = localStorage.getItem('token');
        if (!token) {
            unreadCount.value = 0;
            return;
        }

        try {
            const { data } = await api.get('/chat/unread-count', { skipLoading: true });
            unreadCount.value = data.unread_count || 0;
            mediaCredits.value = data.media_credits || 0;
            canAccessChat.value = !!data.can_access_chat;
            chatLog('unread', data);
        } catch (e) {
            chatWarn('fetchUnread failed', e);
        }
    }

    function bindInbox(force = false) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id) {
            return;
        }
        if (inboxChannelBound.value && !force) {
            return;
        }

        const echo = getEcho();
        if (!echo) {
            return;
        }

        echo.private(`chat.inbox.${user.id}`)
            .listen('.conversation.updated', () => {
                fetchUnread();
            });

        inboxChannelBound.value = true;
        chatLog('inbox bound', user.id);
    }

    function reset() {
        unreadCount.value = 0;
        mediaCredits.value = 0;
        canAccessChat.value = false;
        inboxChannelBound.value = false;
    }

    return {
        unreadCount,
        mediaCredits,
        canAccessChat,
        fetchUnread,
        bindInbox,
        reset,
    };
});
