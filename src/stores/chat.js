import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/axios/api';
import { getEcho } from '@/utils/echo';

function currentUser() {
    try {
        return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
        return {};
    }
}

function previewText(msg) {
    if (!msg) return 'Nova mensagem';
    if (msg.type === 'image') return 'Enviou uma foto';
    if (msg.type === 'video') return 'Enviou um vídeo';
    const body = (msg.body || '').trim();
    if (!body) return 'Nova mensagem';
    return body.length > 80 ? `${body.slice(0, 80)}…` : body;
}

export const useChatStore = defineStore('chat', () => {
    const unreadCount = ref(0);
    const mediaCredits = ref(0);
    const canAccessChat = ref(false);
    const inboxChannelBound = ref(false);
    const activeConversationId = ref(null);
    let inboxChannel = null;
    const recentMessageIds = new Set();

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
        } catch {
            // silencioso
        }
    }

    function setActiveConversation(id) {
        activeConversationId.value = id ? Number(id) : null;
    }

    function shouldNotify(conversationId) {
        const path = window.location.pathname || '';
        const onMessages = path.includes('/messages');
        if (!onMessages) return true;
        if (!activeConversationId.value) return true;
        return Number(activeConversationId.value) !== Number(conversationId);
    }

    function emitIncomingToast(msg) {
        const sender = msg?.user?.apelido || msg?.user?.nome || 'Alguém';
        window.dispatchEvent(new CustomEvent('chat:incoming', {
            detail: {
                conversationId: msg.conversation_id,
                sender,
                preview: previewText(msg),
            },
        }));
    }

    function handleIncomingMessage(msg) {
        if (!msg) return;
        const me = currentUser();
        if (!me.id || Number(msg.user_id) === Number(me.id)) return;

        const messageId = msg.id ? Number(msg.id) : null;
        if (messageId && recentMessageIds.has(messageId)) {
            fetchUnread();
            return;
        }
        if (messageId) {
            recentMessageIds.add(messageId);
            setTimeout(() => recentMessageIds.delete(messageId), 15000);
        }

        if (shouldNotify(msg.conversation_id)) {
            unreadCount.value = Number(unreadCount.value || 0) + 1;
            emitIncomingToast(msg);
        }

        fetchUnread();
    }

    function bindInbox(force = false) {
        const user = currentUser();
        if (!user.id) {
            return;
        }

        const echo = getEcho();
        if (!echo) {
            return;
        }

        if (inboxChannelBound.value && !force) {
            return;
        }

        if (force && inboxChannel) {
            try {
                echo.leave(`chat.inbox.${user.id}`);
            } catch (e) {
                // ignore
            }
            inboxChannel = null;
            inboxChannelBound.value = false;
        }

        inboxChannel = echo.private(`chat.inbox.${user.id}`)
            .listen('.message.sent', (e) => {
                handleIncomingMessage(e.message);
            })
            .listen('.conversation.updated', (e) => {
                if (e?.cleared_for_everyone) {
                    fetchUnread();
                    return;
                }
                if (e?.unread_bump && e?.latest_message) {
                    handleIncomingMessage({
                        ...e.latest_message,
                        conversation_id: e.conversation_id,
                        user: e.sender || null,
                    });
                    return;
                }
                fetchUnread();
            });

        inboxChannelBound.value = true;
    }

    function reset() {
        unreadCount.value = 0;
        mediaCredits.value = 0;
        canAccessChat.value = false;
        inboxChannelBound.value = false;
        activeConversationId.value = null;
        inboxChannel = null;
    }

    return {
        unreadCount,
        mediaCredits,
        canAccessChat,
        activeConversationId,
        fetchUnread,
        bindInbox,
        setActiveConversation,
        reset,
    };
});
