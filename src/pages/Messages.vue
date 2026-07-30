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

        <div v-else class="messages-shell" :class="{ 'is-subscriber': !isAdminUser }">
            <aside
                v-if="isAdminUser"
                class="list-pane"
                :class="{ 'hidden-mobile': Boolean(activeConversation) }"
            >
                <ChatConversationList
                    :conversations="conversations"
                    :selected-id="activeConversation?.id"
                    :loading="loadingList"
                    :show-new-button="true"
                    @select="selectConversation"
                    @new-conversation="showStartDialog = true"
                    @deleted="onConversationDeleted"
                />
            </aside>

            <section
                class="thread-pane"
                :class="{ 'hidden-mobile': isAdminUser && !activeConversation }"
            >
                <div v-if="!activeConversation" class="empty-thread">
                    <i class="pi pi-comments"></i>
                    <p>{{ isAdminUser ? 'Selecione uma conversa à esquerda' : 'Abrindo chat...' }}</p>
                    <Button
                        v-if="isAdminUser"
                        label="Iniciar nova conversa"
                        icon="pi pi-plus"
                        class="mt-3"
                        @click="showStartDialog = true"
                    />
                </div>
                <ChatThread
                    v-else
                    :conversation="activeConversation"
                    :show-back="isAdminUser"
                    @back="activeConversation = null"
                    @updated="onThreadUpdated"
                />
            </section>
        </div>

        <ChatStartConversationDialog
            v-if="isAdminUser"
            v-model:visible="showStartDialog"
            @started="onConversationStarted"
        />
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import ChatConversationList from '@/components/chat/ChatConversationList.vue';
import ChatThread from '@/components/chat/ChatThread.vue';
import ChatStartConversationDialog from '@/components/chat/ChatStartConversationDialog.vue';
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
        ChatStartConversationDialog,
        Card,
        Button,
    },
    data() {
        return {
            conversations: [],
            activeConversation: null,
            loadingList: false,
            blocked: false,
            showStartDialog: false,
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
        // Não sai do canal inbox aqui — ele precisa ficar ativo nas outras telas (badge/toast)
        useChatStore().setActiveConversation(null);
    },
    watch: {
        activeConversation: {
            immediate: true,
            handler(val) {
                useChatStore().setActiveConversation(val?.id || null);
            },
        },
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
                })
                .listen('.message.sent', () => {
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
        async onConversationDeleted({ conversation }) {
            if (Number(this.activeConversation?.id) === Number(conversation?.id)) {
                this.activeConversation = null;
            }
            await this.loadConversations();
            useChatStore().fetchUnread();
        },
        selectConversation(item) {
            this.activeConversation = item;
        },
        async onConversationStarted(conversation) {
            await this.loadConversations();
            const found = this.conversations.find((c) => c.id === conversation.id);
            this.activeConversation = found || conversation;
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
    grid-template-columns: minmax(300px, 380px) 1fr;
    overflow: hidden;

    &.is-subscriber {
        grid-template-columns: 1fr;
    }
}

.list-pane,
.thread-pane {
    min-width: 0;
    min-height: 0;
    height: 100%;
    overflow: hidden;
    position: relative;
}

.thread-pane {
    display: flex;
    flex-direction: column;
}

.thread-pane > * {
    min-width: 0;
    min-height: 0;
    flex: 1;
}

.empty-thread {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #888;
    gap: 0.5rem;
    background: #0d0d0d;
    border-left: 1px solid #1f1f1f;

    i {
        font-size: 2.5rem;
        color: #f5cee1;
    }

    p {
        margin: 0;
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

@media (max-width: 900px) {
    .messages-shell {
        grid-template-columns: 1fr;
    }

    .hidden-mobile {
        display: none !important;
    }

    .empty-thread {
        border-left: none;
    }
}
</style>
