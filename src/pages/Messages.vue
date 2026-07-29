<template>
    <div class="messages-page">
        <Header />

        <div v-if="blocked" class="blocked-wrap">
            <Card class="blocked-card">
                <template #content>
                    <h3>Assinatura necessária</h3>
                    <p>Seu chat está congelado até renovar a assinatura. Galeria e créditos de mídia também ficam indisponíveis.</p>
                    <Button label="Ir para assinaturas" icon="pi pi-credit-card" @click="$router.push('/user-settings')" />
                </template>
            </Card>
        </div>

        <div v-else class="messages-shell" :class="{ 'list-mode': isAdminUser && !activeConversation }">
            <div
                v-if="isAdminUser"
                class="list-pane"
                :class="{ 'hidden-mobile': Boolean(activeConversation) }"
            >
                <ChatConversationList
                    :conversations="conversations"
                    :selected-id="activeConversation?.id"
                    :loading="loadingList"
                    @select="selectConversation"
                />
            </div>

            <div
                class="thread-pane"
                :class="{ 'hidden-mobile': isAdminUser && !activeConversation }"
            >
                <div v-if="!activeConversation" class="empty-thread">
                    <i class="pi pi-comments"></i>
                    <p>{{ isAdminUser ? 'Selecione uma conversa' : 'Abrindo chat...' }}</p>
                </div>
                <ChatThread
                    v-else
                    :conversation="activeConversation"
                    :show-back="isAdminUser"
                    @back="activeConversation = null"
                    @updated="onThreadUpdated"
                />
            </div>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import ChatConversationList from '@/components/chat/ChatConversationList.vue';
import ChatThread from '@/components/chat/ChatThread.vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { isAdmin, hasAssinaturaAtiva } from '@/utils/global';
import { getEcho, chatLog, chatWarn } from '@/utils/echo';
import { useChatStore } from '@/stores/chat';

export default {
    name: 'MessagesPage',
    components: {
        Header,
        ChatConversationList,
        ChatThread,
        Card,
        Button,
    },
    data() {
        return {
            conversations: [],
            activeConversation: null,
            loadingList: false,
            blocked: false,
        };
    },
    computed: {
        isAdminUser() {
            return isAdmin();
        },
    },
    async mounted() {
        useChatStore().bindInbox();
        useChatStore().fetchUnread();

        if (this.isAdminUser) {
            await this.loadConversations();
            this.bindAdminInbox();
        } else {
            if (!hasAssinaturaAtiva()) {
                this.blocked = true;
                return;
            }
            await this.openSubscriberChat();
        }
    },
    beforeUnmount() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
            try {
                getEcho()?.leave(`chat.inbox.${user.id}`);
            } catch (e) {
                chatWarn('leave inbox', e);
            }
        }
    },
    methods: {
        async loadConversations() {
            this.loadingList = true;
            try {
                const { data } = await this.api.get('/chat/conversations');
                this.conversations = data.data || data || [];
                chatLog('conversations', this.conversations.length);
            } catch (e) {
                chatWarn('load conversations', e);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Falha ao carregar conversas',
                    life: 3000,
                });
            } finally {
                this.loadingList = false;
            }
        },
        bindAdminInbox() {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const echo = getEcho();
            if (!echo || !user.id) return;
            echo.private(`chat.inbox.${user.id}`)
                .listen('.conversation.updated', () => {
                    this.loadConversations();
                });
        },
        async openSubscriberChat() {
            try {
                const { data } = await this.api.post('/chat/conversations/open');
                this.activeConversation = data.data || data;
                chatLog('opened conversation', this.activeConversation?.id);
            } catch (e) {
                if (e.response?.data?.requires_subscription) {
                    this.blocked = true;
                    return;
                }
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Não foi possível abrir o chat',
                    life: 4000,
                });
            }
        },
        selectConversation(item) {
            this.activeConversation = item;
        },
        async onThreadUpdated() {
            if (this.isAdminUser) {
                await this.loadConversations();
            }
            useChatStore().fetchUnread();
        },
    },
};
</script>

<style scoped lang="scss">
.messages-page {
    min-height: 100vh;
    background: #000;
    color: #fff;
}

.messages-shell {
    height: calc(100vh - 56px);
    display: grid;
    grid-template-columns: 360px 1fr;

    &.list-mode {
        grid-template-columns: 1fr;
    }
}

.list-pane,
.thread-pane {
    min-height: 0;
    height: 100%;
}

.empty-thread {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #888;
    gap: 0.75rem;

    i {
        font-size: 2.5rem;
        color: #f5cee1;
    }
}

.blocked-wrap {
    display: flex;
    justify-content: center;
    padding: 3rem 1rem;
}

.blocked-card {
    max-width: 420px;
    width: 100%;

    :deep(.p-card-body) {
        background: #121212;
        color: #ddd;
    }

    h3 {
        color: #f5cee1;
        margin-top: 0;
    }

    p {
        margin-bottom: 1.25rem;
    }
}

@media (max-width: 768px) {
    .messages-shell {
        grid-template-columns: 1fr;
    }

    .hidden-mobile {
        display: none !important;
    }
}
</style>
