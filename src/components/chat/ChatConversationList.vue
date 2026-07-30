<template>
    <div class="chat-list">
        <div class="chat-list-header">
            <div class="header-top">
                <h3>Conversas</h3>
            </div>
            <Button
                v-if="showNewButton"
                label="Iniciar nova conversa"
                icon="pi pi-plus"
                class="w-full new-chat-btn"
                size="small"
                @click="$emit('new-conversation')"
            />
            <InputText
                v-model="search"
                placeholder="Pesquisar conversas..."
                class="w-full search-input"
                size="small"
            />
        </div>

        <div class="chat-list-body">
            <div v-if="loading" class="chat-list-empty">
                <i class="pi pi-spin pi-spinner"></i>
            </div>

            <div v-else-if="filtered.length === 0" class="chat-list-empty">
                Nenhuma conversa ainda.
            </div>

            <div
                v-for="item in filtered"
                :key="item.id"
                class="chat-list-item"
                :class="{ active: selectedId === item.id }"
                @click="$emit('select', item)"
            >
                <Avatar
                    :image="item.other_user?.path_img_avatar || defaultAvatar"
                    shape="circle"
                    size="large"
                />
                <div class="chat-list-meta">
                    <div class="chat-list-top">
                        <span class="name">{{ displayName(item) }}</span>
                        <div class="top-right">
                            <span class="time">{{ formatTime(item.last_message_at || item.latest_message?.created_at) }}</span>
                            <button
                                type="button"
                                class="item-menu-btn"
                                title="Opções"
                                @click.stop="openItemMenu($event, item)"
                            >
                                <i class="pi pi-ellipsis-h"></i>
                            </button>
                        </div>
                    </div>
                    <div class="chat-list-bottom">
                        <span class="preview">{{ previewText(item) }}</span>
                        <Badge v-if="item.unread_count > 0" :value="item.unread_count" severity="danger" />
                    </div>
                </div>
            </div>
        </div>

        <Menu ref="itemMenu" :model="menuItems" popup />

        <Dialog
            v-model:visible="confirmVisible"
            modal
            :header="confirmTitle"
            :style="{ width: 'min(92vw, 420px)' }"
            dismissableMask
        >
            <p class="confirm-text">{{ confirmMessage }}</p>
            <template #footer>
                <Button label="Cancelar" text @click="confirmVisible = false" />
                <Button
                    :label="confirmScope === 'everyone' ? 'Excluir para todos' : 'Excluir só para mim'"
                    severity="danger"
                    :loading="deleting"
                    @click="confirmDelete"
                />
            </template>
        </Dialog>
    </div>
</template>

<script>
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import Dialog from 'primevue/dialog';

export default {
    name: 'ChatConversationList',
    components: { Avatar, Badge, InputText, Button, Menu, Dialog },
    props: {
        conversations: { type: Array, default: () => [] },
        selectedId: { type: [Number, String], default: null },
        loading: { type: Boolean, default: false },
        showNewButton: { type: Boolean, default: false },
    },
    emits: ['select', 'new-conversation', 'deleted'],
    data() {
        return {
            search: '',
            defaultAvatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
            menuConversation: null,
            confirmVisible: false,
            confirmScope: null,
            deleting: false,
        };
    },
    computed: {
        filtered() {
            const q = this.search.trim().toLowerCase();
            if (!q) return this.conversations;
            return this.conversations.filter((c) => {
                const name = this.displayName(c).toLowerCase();
                return name.includes(q);
            });
        },
        menuItems() {
            return [
                {
                    label: 'Excluir só para mim',
                    icon: 'pi pi-eye-slash',
                    command: () => this.askDelete('me'),
                },
                {
                    label: 'Excluir para todos',
                    icon: 'pi pi-trash',
                    command: () => this.askDelete('everyone'),
                },
            ];
        },
        confirmTitle() {
            return this.confirmScope === 'everyone'
                ? 'Excluir conversa para todos?'
                : 'Excluir conversa só para você?';
        },
        confirmMessage() {
            const name = this.displayName(this.menuConversation || {});
            if (this.confirmScope === 'everyone') {
                return `A conversa com ${name} será apagada permanentemente para você e para a outra pessoa. Esta ação não pode ser desfeita.`;
            }
            return `A conversa com ${name} sai da sua lista. A outra pessoa continua vendo o histórico. Se alguém mandar mensagem nova, ela pode voltar a aparecer.`;
        },
    },
    methods: {
        displayName(item) {
            const u = item?.other_user || {};
            return u.apelido || `${u.nome || ''} ${u.sobrenome || ''}`.trim() || 'Assinante';
        },
        previewText(item) {
            const m = item.latest_message;
            if (!m) return 'Sem mensagens';
            if (m.type === 'image') return 'Foto';
            if (m.type === 'video') return 'Vídeo';
            if (m.type === 'audio') return 'Áudio';
            if (m.type === 'video_call') return 'Chamada de vídeo';
            if (m.type === 'presentinho') return 'Presentinho';
            if (m.type === 'conteudo_exclusivo') return 'Conteúdo exclusivo';
            return m.body || '';
        },
        formatTime(iso) {
            if (!iso) return '';
            const d = new Date(iso);
            const now = new Date();
            const sameDay = d.toDateString() === now.toDateString();
            if (sameDay) {
                return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }
            const yesterday = new Date();
            yesterday.setDate(now.getDate() - 1);
            if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
            return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        },
        openItemMenu(event, item) {
            this.menuConversation = item;
            this.$refs.itemMenu.toggle(event);
        },
        askDelete(scope) {
            if (!this.menuConversation) return;
            this.confirmScope = scope;
            this.confirmVisible = true;
        },
        async confirmDelete() {
            if (!this.menuConversation || !this.confirmScope) return;
            this.deleting = true;
            const conversation = this.menuConversation;
            const scope = this.confirmScope;
            try {
                await this.api.post(`/chat/conversations/${conversation.id}/clear`, { scope });
                this.confirmVisible = false;
                this.$toast.add({
                    severity: 'success',
                    summary: 'Conversa excluída',
                    detail: scope === 'everyone'
                        ? 'A conversa foi apagada para todos.'
                        : 'A conversa foi removida da sua lista.',
                    life: 3000,
                });
                this.$emit('deleted', { conversation, scope });
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Não foi possível excluir a conversa',
                    life: 3500,
                });
            } finally {
                this.deleting = false;
            }
        },
    },
};
</script>

<style scoped lang="scss">
.chat-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #121212;
    border-right: 1px solid #2a2a2a;
}

.chat-list-header {
    padding: 1rem;
    border-bottom: 1px solid #2a2a2a;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex-shrink: 0;
}

.header-top h3 {
    color: #f5cee1;
    margin: 0;
    font-size: 1.25rem;
}

.new-chat-btn {
    background: #f5cee1 !important;
    border-color: #f5cee1 !important;
    color: #761c49 !important;
}

.search-input {
    background: #1a1a1a !important;
}

.chat-list-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
}

.chat-list-empty {
    color: #888;
    text-align: center;
    padding: 2rem 1rem;
}

.chat-list-item {
    display: flex;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    cursor: pointer;
    border-bottom: 1px solid #1f1f1f;
    transition: background 0.2s;

    &:hover,
    &.active {
        background: #1a1a1a;
    }
}

.chat-list-meta {
    flex: 1;
    min-width: 0;
}

.chat-list-top,
.chat-list-bottom {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    align-items: center;
}

.top-right {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.1rem;
    flex-shrink: 0;
}

.item-menu-btn {
    width: auto;
    min-width: 1.5rem;
    height: 1.2rem;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: #f5cee1;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    padding: 0 0.15rem;
    font-size: 0.85rem;
    line-height: 1;

    &:hover {
        opacity: 1;
        background: rgba(245, 206, 225, 0.12);
    }
}

.name {
    color: #fff;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.time {
    color: #888;
    font-size: 0.75rem;
    flex-shrink: 0;
}

.preview {
    color: #aaa;
    font-size: 0.85rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.confirm-text {
    color: #ddd;
    line-height: 1.5;
    margin: 0;
}
</style>
