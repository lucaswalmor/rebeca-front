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
                        <span class="time">{{ formatTime(item.last_message_at || item.latest_message?.created_at) }}</span>
                    </div>
                    <div class="chat-list-bottom">
                        <span class="preview">{{ previewText(item) }}</span>
                        <Badge v-if="item.unread_count > 0" :value="item.unread_count" severity="danger" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

export default {
    name: 'ChatConversationList',
    components: { Avatar, Badge, InputText, Button },
    props: {
        conversations: { type: Array, default: () => [] },
        selectedId: { type: [Number, String], default: null },
        loading: { type: Boolean, default: false },
        showNewButton: { type: Boolean, default: false },
    },
    emits: ['select', 'new-conversation'],
    data() {
        return {
            search: '',
            defaultAvatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
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
    },
    methods: {
        displayName(item) {
            const u = item.other_user || {};
            return u.apelido || `${u.nome || ''} ${u.sobrenome || ''}`.trim() || 'Assinante';
        },
        previewText(item) {
            const m = item.latest_message;
            if (!m) return 'Sem mensagens';
            if (m.type === 'image') return 'Foto';
            if (m.type === 'video') return 'Vídeo';
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
</style>
