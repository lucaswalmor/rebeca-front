<template>
    <Dialog
        :visible="visible"
        modal
        header="Iniciar nova conversa"
        :style="{ width: 'min(92vw, 480px)' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <InputText
            v-model="search"
            placeholder="Buscar por nome, apelido ou e-mail..."
            class="w-full search-input mb-3"
            size="small"
            @input="onSearchInput"
        />

        <div ref="listEl" class="user-scroll" @scroll="onScroll">
            <div v-if="loading && users.length === 0" class="center">
                <i class="pi pi-spin pi-spinner"></i>
            </div>

            <div v-else-if="!loading && users.length === 0" class="center muted">
                Nenhum usuário encontrado.
            </div>

            <button
                v-for="user in users"
                :key="user.id"
                type="button"
                class="user-row"
                :disabled="startingId === user.id"
                @click="startChat(user)"
            >
                <Avatar
                    :image="user.path_img_avatar || defaultAvatar"
                    shape="circle"
                />
                <div class="user-meta">
                    <div class="name">{{ displayName(user) }}</div>
                    <div class="sub">
                        <span v-if="user.has_active_subscription" class="ok">Assinatura ativa</span>
                        <span v-else class="warn">Sem assinatura ativa</span>
                        <span v-if="user.has_conversation"> · Já conversou</span>
                    </div>
                </div>
                <i v-if="startingId === user.id" class="pi pi-spin pi-spinner"></i>
                <i v-else class="pi pi-comments"></i>
            </button>

            <div v-if="loadingMore" class="center py-2">
                <i class="pi pi-spin pi-spinner"></i>
            </div>
        </div>
    </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Avatar from 'primevue/avatar';

export default {
    name: 'ChatStartConversationDialog',
    components: { Dialog, InputText, Avatar },
    props: {
        visible: Boolean,
    },
    emits: ['update:visible', 'started'],
    data() {
        return {
            search: '',
            users: [],
            page: 1,
            hasMore: false,
            loading: false,
            loadingMore: false,
            startingId: null,
            searchTimer: null,
            defaultAvatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
        };
    },
    watch: {
        visible(val) {
            if (val) {
                this.resetAndLoad();
            }
        },
    },
    beforeUnmount() {
        if (this.searchTimer) clearTimeout(this.searchTimer);
    },
    methods: {
        displayName(user) {
            return user.apelido || `${user.nome || ''} ${user.sobrenome || ''}`.trim() || user.email;
        },
        onSearchInput() {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.resetAndLoad(), 350);
        },
        async resetAndLoad() {
            this.page = 1;
            this.users = [];
            this.hasMore = false;
            await this.loadUsers(false);
        },
        async loadUsers(append) {
            if (append) {
                if (!this.hasMore || this.loadingMore) return;
                this.loadingMore = true;
            } else {
                this.loading = true;
            }

            try {
                const { data } = await this.api.get('/chat/users', {
                    params: {
                        search: this.search.trim() || undefined,
                        page: this.page,
                        per_page: 20,
                    },
                    skipLoading: true,
                });

                const chunk = data.data || [];
                this.users = append ? [...this.users, ...chunk] : chunk;
                this.hasMore = !!data.meta?.has_more;
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Falha ao carregar usuários',
                    life: 3000,
                });
            } finally {
                this.loading = false;
                this.loadingMore = false;
            }
        },
        onScroll() {
            const el = this.$refs.listEl;
            if (!el || !this.hasMore || this.loadingMore) return;
            const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 80;
            if (nearBottom) {
                this.page += 1;
                this.loadUsers(true);
            }
        },
        async startChat(user) {
            this.startingId = user.id;
            try {
                const { data } = await this.api.post('/chat/conversations/start', {
                    subscriber_id: user.id,
                });
                const conversation = data.data || data;
                this.$emit('started', conversation);
                this.$emit('update:visible', false);
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Não foi possível iniciar a conversa',
                    life: 3500,
                });
            } finally {
                this.startingId = null;
            }
        },
    },
};
</script>

<style scoped lang="scss">
.search-input {
    background: #1a1a1a !important;
}

.user-scroll {
    max-height: min(60vh, 480px);
    overflow-y: auto;
    margin: 0 -0.25rem;
}

.center {
    text-align: center;
    padding: 1.5rem;
    color: #f5cee1;
}

.muted {
    color: #888;
}

.user-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border: none;
    background: transparent;
    color: #fff;
    cursor: pointer;
    border-radius: 8px;
    text-align: left;

    &:hover {
        background: #1a1a1a;
    }

    &:disabled {
        opacity: 0.7;
        cursor: wait;
    }

    > .pi {
        color: #f5cee1;
    }
}

.user-meta {
    flex: 1;
    min-width: 0;
}

.name {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.sub {
    font-size: 0.8rem;
    color: #999;
    margin-top: 0.15rem;
}

.ok {
    color: #8fd19e;
}

.warn {
    color: #e8b86d;
}
</style>
