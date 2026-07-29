<template>
    <div class="chat-thread">
        <div class="chat-header">
            <button v-if="showBack" class="icon-btn" @click="$emit('back')">
                <i class="pi pi-arrow-left"></i>
            </button>
            <Avatar
                :image="otherUser?.path_img_avatar || defaultAvatar"
                shape="circle"
            />
            <div class="header-info">
                <div class="header-name">{{ otherName }}</div>
                <div class="header-status">
                    <span v-if="typingUser">digitando...</span>
                    <span v-else-if="otherUser?.is_online">online</span>
                    <span v-else>offline</span>
                </div>
            </div>
            <div class="header-actions">
                <button
                    class="icon-btn"
                    title="Galeria"
                    @click="showGallery = true"
                >
                    <i class="pi pi-th-large"></i>
                </button>
                <button
                    v-if="!isAdminUser"
                    class="icon-btn"
                    title="Comprar créditos para enviar fotos/vídeos"
                    @click="showUnlock = true"
                >
                    <i class="pi pi-shopping-bag"></i>
                    <span v-if="mediaCredits > 0" class="credit-pill">{{ mediaCredits }}</span>
                </button>
                <button
                    class="icon-btn"
                    title="Limpar conversa"
                    @click="openClearMenu"
                >
                    <i class="pi pi-trash"></i>
                </button>
            </div>
        </div>

        <div ref="messagesEl" class="chat-messages" @scroll="onScroll">
            <div v-if="loading" class="center-msg">
                <i class="pi pi-spin pi-spinner"></i>
            </div>
            <div
                v-for="msg in messages"
                :key="msg.id"
                class="msg-row"
                :class="{ mine: isMine(msg) }"
                @contextmenu.prevent="openMenu($event, msg)"
            >
                <div class="bubble" :class="{ mine: isMine(msg), media: msg.type !== 'text' }">
                    <div v-if="msg.reply_to" class="reply-quote" @click="scrollToMessage(msg.reply_to.id)">
                        <strong>{{ msg.reply_to.user?.apelido || 'Mensagem' }}</strong>
                        <span>{{ replyPreview(msg.reply_to) }}</span>
                    </div>

                    <div v-if="msg.type === 'image' && msg.media_url" class="bubble-media-wrap">
                        <Image
                            :src="msg.media_url"
                            preview
                            imageClass="bubble-media-img"
                            class="bubble-image"
                        />
                    </div>
                    <div v-else-if="msg.type === 'video' && msg.media_url" class="bubble-media-wrap">
                        <video
                            :src="msg.media_url"
                            controls
                            playsinline
                            class="bubble-media-video"
                        />
                    </div>
                    <div v-if="msg.body" class="bubble-text">{{ msg.body }}</div>

                    <div class="bubble-meta">
                        <span v-if="msg.edited_at" class="edited">editada</span>
                        <span class="time">{{ formatTime(msg.created_at) }}</span>
                        <span v-if="isMine(msg)" class="ticks">
                            <i v-if="msg.read_at" class="pi pi-check-circle read"></i>
                            <i v-else-if="msg.delivered_at" class="pi pi-check"></i>
                            <i v-else class="pi pi-check"></i>
                        </span>
                    </div>

                    <button
                        v-if="msg.likes_count > 0 || msg.liked_by_me"
                        class="like-badge"
                        @click.stop="toggleLike(msg)"
                    >
                        ❤️ {{ msg.likes_count || '' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="replyingTo" class="reply-bar">
            <div>
                <strong>Respondendo</strong>
                <span>{{ replyPreview(replyingTo) }}</span>
            </div>
            <button class="icon-btn" @click="replyingTo = null"><i class="pi pi-times"></i></button>
        </div>

        <div v-if="editingMessage" class="reply-bar">
            <div>
                <strong>Editando mensagem</strong>
            </div>
            <button class="icon-btn" @click="cancelEdit"><i class="pi pi-times"></i></button>
        </div>

        <div class="chat-composer">
            <button class="icon-btn" @click="showEmoji = !showEmoji">
                <i class="pi pi-face-smile"></i>
            </button>
            <input
                ref="fileInput"
                type="file"
                class="hidden-file"
                accept="image/*,video/*"
                @change="onFileSelected"
            />
            <button
                class="icon-btn"
                title="Enviar mídia"
                @click="onAttachClick"
            >
                <i class="pi pi-paperclip"></i>
            </button>
            <InputText
                v-model="draft"
                class="composer-input"
                placeholder="Mensagem"
                @keydown.enter.exact.prevent="sendText"
                @input="onTyping"
            />
            <button class="send-btn" :disabled="sending || !draft.trim()" @click="sendText">
                <i class="pi pi-send"></i>
            </button>
        </div>

        <div v-if="showEmoji" class="emoji-wrap">
            <EmojiPicker @emoji-selected="insertEmoji" />
        </div>

        <Menu ref="msgMenu" :model="menuItems" popup />
        <Menu ref="clearMenu" :model="clearMenuItems" popup />

        <ChatGalleryDialog
            v-model:visible="showGallery"
            :conversation-id="conversationId"
        />
        <ChatMediaUnlockDialog
            v-model:visible="showUnlock"
            :media-credits="mediaCredits"
            :credits-per-pack="creditsPerPack"
            :price="packagePrice"
        />
    </div>
</template>

<script>
import Avatar from 'primevue/avatar';
import InputText from 'primevue/inputtext';
import Image from 'primevue/image';
import Menu from 'primevue/menu';
import EmojiPicker from '@/components/EmojiPicker.vue';
import ChatGalleryDialog from './ChatGalleryDialog.vue';
import ChatMediaUnlockDialog from './ChatMediaUnlockDialog.vue';
import { getEcho, chatLog, chatWarn, isEchoConnected } from '@/utils/echo';
import { useChatStore } from '@/stores/chat';
import { isAdmin, currentUserId } from '@/utils/global';

export default {
    name: 'ChatThread',
    components: {
        Avatar,
        InputText,
        Image,
        Menu,
        EmojiPicker,
        ChatGalleryDialog,
        ChatMediaUnlockDialog,
    },
    props: {
        conversation: { type: Object, required: true },
        showBack: { type: Boolean, default: false },
    },
    emits: ['back', 'updated'],
    data() {
        return {
            messages: [],
            loading: false,
            sending: false,
            draft: '',
            showEmoji: false,
            showGallery: false,
            showUnlock: false,
            replyingTo: null,
            editingMessage: null,
            typingUser: null,
            typingTimer: null,
            whisperTimer: null,
            menuMessage: null,
            mediaCredits: 0,
            creditsPerPack: 5,
            packagePrice: null,
            channel: null,
            pollTimer: null,
            defaultAvatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
        };
    },
    computed: {
        conversationId() {
            return this.conversation?.id;
        },
        isAdminUser() {
            return isAdmin();
        },
        otherUser() {
            return this.conversation?.other_user || null;
        },
        otherName() {
            const u = this.otherUser || {};
            return u.apelido || `${u.nome || ''} ${u.sobrenome || ''}`.trim() || 'Conversa';
        },
        clearMenuItems() {
            const items = [
                {
                    label: 'Limpar só para mim',
                    icon: 'pi pi-eye-slash',
                    command: () => this.clearConversation('me'),
                },
            ];

            if (this.isAdminUser) {
                items.push({
                    label: 'Limpar para todos',
                    icon: 'pi pi-trash',
                    command: () => this.clearConversation('everyone'),
                });
            }

            return items;
        },
        menuItems() {
            const msg = this.menuMessage;
            if (!msg) return [];
            const mine = this.isMine(msg);
            const items = [
                {
                    label: msg.liked_by_me ? 'Remover curtida' : 'Curtir',
                    icon: 'pi pi-heart',
                    command: () => this.toggleLike(msg),
                },
                {
                    label: 'Responder',
                    icon: 'pi pi-reply',
                    command: () => {
                        this.replyingTo = msg;
                        this.editingMessage = null;
                    },
                },
            ];
            if (mine && msg.type === 'text') {
                items.push({
                    label: 'Editar',
                    icon: 'pi pi-pencil',
                    command: () => {
                        this.editingMessage = msg;
                        this.draft = msg.body || '';
                        this.replyingTo = null;
                    },
                });
            }
            if (mine || this.isAdminUser) {
                items.push({
                    label: 'Excluir',
                    icon: 'pi pi-trash',
                    command: () => this.deleteMessage(msg),
                });
            }
            return items;
        },
    },
    watch: {
        conversationId: {
            immediate: true,
            handler(id) {
                if (id) this.bootstrap();
            },
        },
    },
    beforeUnmount() {
        this.teardownChannel();
        this.stopPolling();
        if (this.typingTimer) clearTimeout(this.typingTimer);
        if (this.whisperTimer) clearTimeout(this.whisperTimer);
    },
    methods: {
        isMine(msg) {
            return Number(msg.user_id) === Number(currentUserId());
        },
        replyPreview(msg) {
            if (!msg) return '';
            if (msg.type === 'image') return 'Foto';
            if (msg.type === 'video') return 'Vídeo';
            return msg.body || '';
        },
        formatTime(iso) {
            if (!iso) return '';
            return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        },
        async bootstrap() {
            await Promise.all([this.loadMessages(), this.loadPackageInfo()]);
            this.bindChannel();
            this.startPolling();
            await this.markRead();
            this.$nextTick(this.scrollToBottom);
        },
        startPolling() {
            this.stopPolling();
            // Só como fallback se o WebSocket cair — com Reverb saudável não fica batendo a API
            this.pollTimer = setInterval(() => {
                if (isEchoConnected()) return;
                this.pollMessages();
            }, 5000);
        },
        stopPolling() {
            if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
            }
        },
        async pollMessages() {
            if (!this.conversationId || document.hidden) return;
            if (isEchoConnected()) return;
            chatWarn('ws offline — poll fallback');
            try {
                const { data } = await this.api.get(
                    `/chat/conversations/${this.conversationId}/messages`,
                    { skipLoading: true }
                );
                const list = data.data || [];
                if (!Array.isArray(list) || list.length === 0) return;

                const knownIds = new Set(this.messages.map((m) => m.id));
                let added = false;
                list.forEach((msg) => {
                    const idx = this.messages.findIndex((m) => m.id === msg.id);
                    if (idx >= 0) {
                        this.messages.splice(idx, 1, msg);
                    } else if (!knownIds.has(msg.id)) {
                        this.messages.push(msg);
                        added = true;
                    }
                });

                // Remove mensagens apagadas por outro lado
                const remoteIds = new Set(list.map((m) => m.id));
                const before = this.messages.length;
                this.messages = this.messages.filter((m) => remoteIds.has(m.id));
                if (this.messages.length !== before || added) {
                    this.$emit('updated');
                    if (added) {
                        this.markRead();
                        this.$nextTick(this.scrollToBottom);
                    }
                }
            } catch (e) {
                // silencioso no poll
            }
        },
        async loadMessages() {
            this.loading = true;
            try {
                const { data } = await this.api.get(`/chat/conversations/${this.conversationId}/messages`);
                const list = data.data || [];
                this.messages = Array.isArray(list) ? list : [];
                chatLog('messages loaded', this.messages.length);
            } catch (e) {
                chatWarn('load messages failed', e);
                if (e.response?.data?.requires_subscription) {
                    this.$emit('back');
                }
            } finally {
                this.loading = false;
            }
        },
        async loadPackageInfo() {
            try {
                const { data } = await this.api.get('/chat/media-package', { skipLoading: true });
                this.mediaCredits = data.media_credits || 0;
                this.creditsPerPack = data.credits_per_pack || 5;
                this.packagePrice = data.price;
                useChatStore().mediaCredits = this.mediaCredits;
            } catch (e) {
                chatWarn('package info failed', e);
            }
        },
        teardownChannel() {
            if (this.channel && this.conversationId) {
                try {
                    getEcho()?.leave(`chat.${this.conversationId}`);
                } catch (e) {
                    chatWarn('leave channel', e);
                }
            }
            this.channel = null;
        },
        bindChannel() {
            this.teardownChannel();
            const echo = getEcho();
            if (!echo || !this.conversationId) return;

            this.channel = echo.private(`chat.${this.conversationId}`)
                .listen('.message.sent', (e) => {
                    chatLog('event message.sent', e);
                    this.upsertMessage(e.message);
                    this.markRead();
                    this.$emit('updated');
                })
                .listen('.message.updated', (e) => {
                    this.upsertMessage(e.message);
                })
                .listen('.message.deleted', (e) => {
                    this.messages = this.messages.filter((m) => m.id !== e.message_id);
                })
                .listen('.message.liked', (e) => {
                    this.upsertMessage(e.message);
                })
                .listen('.conversation.updated', (e) => {
                    if (e.cleared_for_everyone) {
                        this.messages = [];
                        this.$emit('updated');
                        return;
                    }
                    if (e.read_by && Number(e.read_by) !== Number(currentUserId())) {
                        this.messages = this.messages.map((m) => (
                            this.isMine(m) ? { ...m, read_at: e.read_at || m.read_at } : m
                        ));
                    }
                })
                .listenForWhisper('typing', (e) => {
                    if (Number(e.user_id) === Number(currentUserId())) return;
                    this.typingUser = e.name || 'Alguém';
                    if (this.typingTimer) clearTimeout(this.typingTimer);
                    this.typingTimer = setTimeout(() => {
                        this.typingUser = null;
                    }, 2000);
                });

            chatLog('subscribed chat.' + this.conversationId);
        },
        openClearMenu(event) {
            this.$refs.clearMenu.toggle(event);
        },
        async clearConversation(scope) {
            const isEveryone = scope === 'everyone';
            const ok = window.confirm(
                isEveryone
                    ? 'Limpar a conversa para TODOS? As mensagens serão apagadas permanentemente.'
                    : 'Limpar a conversa só para você? O outro lado continua vendo o histórico.'
            );
            if (!ok) return;

            try {
                await this.api.post(`/chat/conversations/${this.conversationId}/clear`, { scope });
                this.messages = [];
                this.$toast.add({
                    severity: 'success',
                    summary: 'Conversa limpa',
                    detail: isEveryone
                        ? 'A conversa foi apagada para todos.'
                        : 'A conversa foi limpa só para você.',
                    life: 3000,
                });
                this.$emit('updated');
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Não foi possível limpar a conversa',
                    life: 3500,
                });
            }
        },
        upsertMessage(message) {
            if (!message?.id) return;
            const idx = this.messages.findIndex((m) => m.id === message.id);
            if (idx >= 0) {
                this.messages.splice(idx, 1, message);
            } else {
                this.messages.push(message);
                this.$nextTick(this.scrollToBottom);
            }
        },
        async markRead() {
            try {
                await this.api.post(`/chat/conversations/${this.conversationId}/read`, {}, { skipLoading: true });
                useChatStore().fetchUnread();
            } catch (e) {
                chatWarn('markRead failed', e);
            }
        },
        scrollToBottom() {
            const el = this.$refs.messagesEl;
            if (el) el.scrollTop = el.scrollHeight;
        },
        onScroll() {},
        openMenu(event, msg) {
            this.menuMessage = msg;
            this.$refs.msgMenu.toggle(event);
        },
        insertEmoji(emoji) {
            this.draft += emoji;
            this.showEmoji = false;
        },
        onTyping() {
            if (!this.channel) return;
            if (this.whisperTimer) return;
            this.channel.whisper('typing', {
                user_id: currentUserId(),
                name: JSON.parse(localStorage.getItem('user') || '{}').apelido || 'Usuário',
            });
            this.whisperTimer = setTimeout(() => {
                this.whisperTimer = null;
            }, 1200);
        },
        cancelEdit() {
            this.editingMessage = null;
            this.draft = '';
        },
        async sendText() {
            const text = this.draft.trim();
            if (!text || this.sending) return;

            if (this.editingMessage) {
                this.sending = true;
                try {
                    const { data } = await this.api.put(`/chat/messages/${this.editingMessage.id}`, { body: text });
                    this.upsertMessage(data.data || data);
                    this.cancelEdit();
                } catch (e) {
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: e.response?.data?.message || 'Falha ao editar',
                        life: 3000,
                    });
                } finally {
                    this.sending = false;
                }
                return;
            }

            this.sending = true;
            try {
                const form = new FormData();
                form.append('type', 'text');
                form.append('body', text);
                if (this.replyingTo) form.append('reply_to_id', this.replyingTo.id);

                const { data } = await this.api.post(
                    `/chat/conversations/${this.conversationId}/messages`,
                    form
                );
                this.upsertMessage(data.data || data);
                this.draft = '';
                this.replyingTo = null;
                this.showEmoji = false;
                this.$emit('updated');
                this.$nextTick(this.scrollToBottom);
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Falha ao enviar',
                    life: 3000,
                });
            } finally {
                this.sending = false;
            }
        },
        onAttachClick() {
            if (!this.isAdminUser && this.mediaCredits < 1) {
                this.showUnlock = true;
                return;
            }
            this.$refs.fileInput.click();
        },
        async onFileSelected(event) {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;

            if (!this.isAdminUser && this.mediaCredits < 1) {
                this.showUnlock = true;
                return;
            }

            const isVideo = file.type.startsWith('video/');
            const type = isVideo ? 'video' : 'image';

            if (!this.isAdminUser) {
                const max = isVideo ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
                if (file.size > max) {
                    this.$toast.add({
                        severity: 'warn',
                        summary: 'Arquivo grande',
                        detail: isVideo ? 'Vídeo até 100MB' : 'Imagem até 25MB',
                        life: 4000,
                    });
                    return;
                }
            }

            this.sending = true;
            try {
                const form = new FormData();
                form.append('type', type);
                form.append('media', file);
                if (this.replyingTo) form.append('reply_to_id', this.replyingTo.id);

                const { data } = await this.api.post(
                    `/chat/conversations/${this.conversationId}/messages`,
                    form
                );
                this.upsertMessage(data.data || data);
                if (typeof data.media_credits === 'number') {
                    this.mediaCredits = data.media_credits;
                    useChatStore().mediaCredits = this.mediaCredits;
                } else {
                    await this.loadPackageInfo();
                }
                this.replyingTo = null;
                this.$emit('updated');
                this.$nextTick(this.scrollToBottom);
            } catch (e) {
                if (e.response?.data?.requires_media_pack) {
                    this.showUnlock = true;
                }
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Falha ao enviar mídia',
                    life: 4000,
                });
            } finally {
                this.sending = false;
            }
        },
        async toggleLike(msg) {
            try {
                const { data } = await this.api.post(`/chat/messages/${msg.id}/like`);
                this.upsertMessage(data.data || data);
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Falha ao curtir',
                    life: 3000,
                });
            }
        },
        async deleteMessage(msg) {
            try {
                await this.api.delete(`/chat/messages/${msg.id}`);
                this.messages = this.messages.filter((m) => m.id !== msg.id);
                this.$emit('updated');
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Falha ao excluir',
                    life: 3000,
                });
            }
        },
        scrollToMessage() {},
    },
};
</script>

<style scoped lang="scss">
.chat-thread {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #0d0d0d;
    position: relative;
}

.chat-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: #121212;
    border-bottom: 1px solid #2a2a2a;
}

.header-info {
    flex: 1;
    min-width: 0;
}

.header-name {
    color: #fff;
    font-weight: 600;
}

.header-status {
    color: #f5cee1;
    font-size: 0.8rem;
}

.header-actions {
    display: flex;
    gap: 0.35rem;
    align-items: center;
}

.icon-btn {
    background: transparent;
    border: none;
    color: #f5cee1;
    cursor: pointer;
    position: relative;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: #1a1a1a;
    }
}

.credit-pill {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #761c49;
    color: #fff;
    border-radius: 999px;
    font-size: 0.65rem;
    padding: 0 4px;
    min-width: 1rem;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.center-msg {
    text-align: center;
    color: #f5cee1;
    padding: 2rem;
}

.msg-row {
    display: flex;
    justify-content: flex-start;
    min-width: 0;
    width: 100%;

    &.mine {
        justify-content: flex-end;
    }
}

.bubble {
    max-width: min(78%, 420px);
    background: #1f1f1f;
    color: #fff;
    border-radius: 12px 12px 12px 4px;
    padding: 0.55rem 0.7rem;
    position: relative;

    &.mine {
        background: #3a1f2e;
        border-radius: 12px 12px 4px 12px;
    }

    &.media {
        max-width: min(78%, 280px);
        padding: 0.35rem;
        overflow: hidden;
    }
}

.reply-quote {
    background: rgba(245, 206, 225, 0.12);
    border-left: 3px solid #f5cee1;
    padding: 0.35rem 0.5rem;
    margin-bottom: 0.4rem;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;

    strong {
        display: block;
        color: #f5cee1;
    }
}

.bubble-text {
    white-space: pre-wrap;
    word-break: break-word;
    padding: 0.2rem 0.35rem 0;
}

.bubble-media-wrap {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    border-radius: 10px;
    background: #121212;
    line-height: 0;
}

.bubble-image {
    display: block !important;
    width: 100% !important;
    max-width: 100%;
}

.bubble-image :deep(.p-image),
.bubble-image :deep(.p-image-preview-container) {
    display: block;
    width: 100%;
    max-width: 100%;
}

.bubble-image :deep(img),
.bubble-media-img {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: min(52vh, 360px);
    object-fit: contain;
    border-radius: 10px;
    background: #121212;
}

.bubble-image :deep(.p-image-preview-indicator),
.bubble-image :deep(.p-image-preview-mask) {
    width: 100%;
    border-radius: 10px;
}

.bubble-media-video {
    display: block;
    width: 100%;
    max-width: 100%;
    height: auto;
    max-height: min(52vh, 360px);
    object-fit: contain;
    border-radius: 10px;
    background: #000;
}

.bubble-meta {
    display: flex;
    justify-content: flex-end;
    gap: 0.35rem;
    align-items: center;
    margin-top: 0.25rem;
    padding: 0 0.25rem;
    font-size: 0.7rem;
    color: #bbb;
}

.edited {
    font-style: italic;
}

.ticks .read {
    color: #f5cee1;
}

.like-badge {
    position: absolute;
    bottom: -10px;
    left: 8px;
    border: none;
    background: #121212;
    color: #fff;
    border-radius: 999px;
    padding: 0 6px;
    font-size: 0.75rem;
    cursor: pointer;
}

.reply-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: #1a1a1a;
    border-top: 1px solid #2a2a2a;
    color: #ddd;
    font-size: 0.85rem;
}

.chat-composer {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    padding: 0.65rem 0.75rem;
    background: #121212;
    border-top: 1px solid #2a2a2a;
}

.composer-input {
    flex: 1;
    border-radius: 999px !important;
}

.send-btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: none;
    background: #f5cee1;
    color: #761c49;
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.hidden-file {
    display: none;
}

.emoji-wrap {
    position: absolute;
    bottom: 4.2rem;
    left: 0.75rem;
    right: 0.75rem;
    z-index: 20;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 12px;
    overflow: hidden;
}
</style>
