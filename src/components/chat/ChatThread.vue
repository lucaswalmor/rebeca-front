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
                    class="icon-btn has-credit"
                    title="Comprar créditos de mídia ou áudio"
                    @click="openUnlock('media')"
                >
                    <i class="pi pi-shopping-bag"></i>
                    <span v-if="mediaCredits > 0 || audioCredits > 0" class="credit-pill">
                        {{ mediaCredits }}/{{ audioCredits }}
                    </span>
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

        <div
            ref="messagesEl"
            class="chat-messages"
            :class="{
                'has-wallpaper-desktop': !!wallpaperDesktop,
                'has-wallpaper-mobile': !!wallpaperMobile,
            }"
            :style="messagesStyle"
            @scroll="onScroll"
        >
            <div v-if="loading" class="center-msg">
                <i class="pi pi-spin pi-spinner"></i>
            </div>
            <div
                v-for="msg in messages"
                :key="msg.id"
                class="msg-row"
                :class="{
                    mine: isMine(msg),
                    'has-like': msg.likes_count > 0 || msg.liked_by_me,
                }"
                @contextmenu.prevent="openMenu($event, msg)"
            >
                <div class="msg-cluster">
                    <div class="bubble" :class="{ mine: isMine(msg), media: msg.type !== 'text', audio: msg.type === 'audio', 'video-call': msg.type === 'video_call', presentinho: msg.type === 'presentinho', exclusive: msg.type === 'conteudo_exclusivo' }">
                        <button
                            type="button"
                            class="bubble-menu-btn"
                            title="Opções da mensagem"
                            @click.stop="openMenu($event, msg)"
                        >
                            <i class="pi pi-chevron-down"></i>
                        </button>

                        <div v-if="msg.reply_to" class="reply-quote" @click="scrollToMessage(msg.reply_to.id)">
                            <strong>{{ msg.reply_to.user?.apelido || 'Mensagem' }}</strong>
                            <span>{{ replyPreview(msg.reply_to) }}</span>
                        </div>

                        <div v-if="msg.type === 'image' && msg.media_url" class="bubble-media-wrap">
                            <button
                                type="button"
                                class="bubble-media-btn"
                                title="Ampliar foto"
                                @click.stop="openImagePreview(msg.media_url)"
                            >
                                <img
                                    :src="msg.media_url"
                                    alt="Foto do chat"
                                    class="bubble-media-img"
                                    loading="lazy"
                                />
                            </button>
                        </div>
                        <div v-else-if="msg.type === 'video' && msg.media_url" class="bubble-media-wrap">
                            <video
                                :src="msg.media_url"
                                controls
                                playsinline
                                preload="metadata"
                                class="bubble-media-video"
                            />
                        </div>
                        <div v-else-if="msg.type === 'audio' && msg.media_url" class="bubble-media-wrap">
                            <ChatAudioBubble
                                :src="msg.media_url"
                                :duration-seconds="Number(msg.body) || 0"
                                :mine="isMine(msg)"
                            />
                        </div>
                        <div v-else-if="msg.type === 'video_call'" class="bubble-media-wrap">
                            <ChatVideoCallCard
                                :payload="parseVideoCallPayload(msg)"
                                :mine="isMine(msg)"
                            />
                        </div>
                        <div v-else-if="msg.type === 'presentinho'" class="bubble-media-wrap">
                            <ChatPresentinhoCard
                                :payload="parsePresentinhoPayload(msg)"
                                :mine="isMine(msg)"
                            />
                        </div>
                        <div v-else-if="msg.type === 'conteudo_exclusivo'" class="bubble-media-wrap">
                            <ChatConteudoExclusivoCard
                                :payload="parseExclusivePayload(msg)"
                                :mine="isMine(msg)"
                            />
                        </div>
                        <div v-if="msg.body && msg.type === 'text'" class="bubble-text">{{ msg.body }}</div>

                        <div class="bubble-meta">
                            <span v-if="msg.edited_at" class="edited">editada</span>
                            <span class="time">{{ formatTime(msg.created_at) }}</span>
                            <span v-if="isMine(msg)" class="ticks">
                                <i v-if="msg.read_at" class="pi pi-check-circle read"></i>
                                <i v-else-if="msg.delivered_at" class="pi pi-check"></i>
                                <i v-else class="pi pi-check"></i>
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        class="side-reply-btn"
                        title="Responder"
                        @click.stop="startReply(msg)"
                    >
                        <i class="pi pi-reply"></i>
                    </button>

                    <button
                        v-if="msg.likes_count > 0 || msg.liked_by_me"
                        type="button"
                        class="like-badge"
                        @click.stop="toggleLike(msg)"
                    >
                        ❤️ <span v-if="msg.likes_count > 1">{{ msg.likes_count }}</span>
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

        <div v-if="isRecording" class="chat-composer is-recording">
            <ChatVoiceRecorder
                :elapsed-ms="recordElapsedMs"
                :max-seconds="audioMaxSeconds"
                :paused="recordPaused"
                :can-send="canSendRecording"
                :level="recordLevel"
                :preview-url="recordPreviewUrl"
                @discard="discardRecording"
                @toggle-pause="toggleRecordPause"
                @send="sendRecording"
            />
        </div>

        <div v-else class="chat-composer">
            <div class="composer-left">
                <div v-if="isAdminUser" class="composer-menu-wrap" ref="composerMenuWrap">
                    <button
                        type="button"
                        class="icon-btn"
                        :title="showComposerMenu ? 'Fechar' : 'Mais ações'"
                        @click="showComposerMenu = !showComposerMenu"
                    >
                        <i :class="showComposerMenu ? 'pi pi-times' : 'pi pi-plus'"></i>
                    </button>
                    <div v-if="showComposerMenu" class="composer-menu" role="menu">
                        <button
                            type="button"
                            class="composer-menu-item"
                            title="Anexar"
                            @click="onComposerAttach"
                        >
                            <i class="pi pi-paperclip"></i>
                        </button>
                        <button
                            type="button"
                            class="composer-menu-item"
                            title="Chamada de vídeo"
                            @click="onComposerVideoCall"
                        >
                            <i class="pi pi-video"></i>
                        </button>
                    </div>
                </div>
                <button
                    v-else
                    class="icon-btn"
                    title="Enviar mídia"
                    @click="onAttachClick"
                >
                    <i class="pi pi-paperclip"></i>
                </button>
                <button
                    v-if="!isAdminUser"
                    class="icon-btn gift-btn"
                    title="Presentinho"
                    @click="showPresentinhoDialog = true"
                >
                    <i class="pi pi-gift"></i>
                </button>
                <button
                    v-if="!isAdminUser"
                    class="icon-btn exclusive-btn"
                    title="Conteúdo exclusivo"
                    @click="showExclusiveDialog = true"
                >
                    <i class="pi pi-star"></i>
                </button>
                <button class="icon-btn" title="Emoji" @click="showEmoji = !showEmoji">
                    <i class="pi pi-face-smile"></i>
                </button>
            </div>

            <input
                ref="fileInput"
                type="file"
                class="hidden-file"
                accept="image/*,video/*"
                @change="onFileSelected"
            />

            <textarea
                ref="draftInput"
                v-model="draft"
                class="composer-input"
                rows="1"
                placeholder="Mensagem"
                @keydown.enter.exact.prevent="sendText"
                @input="onDraftInput"
            />

            <button
                v-if="hasDraft"
                class="send-btn"
                :disabled="sending || !draft.trim()"
                title="Enviar"
                @click="sendText"
            >
                <i class="pi pi-send"></i>
            </button>
            <button
                v-else
                class="mic-btn"
                :disabled="sending"
                title="Gravar áudio"
                @click="startRecording"
            >
                <i class="pi pi-microphone"></i>
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
            :audio-credits="audioCredits"
            :credits-per-pack="creditsPerPack"
            :audio-credits-per-pack="audioCreditsPerPack"
            :price="packagePrice"
            :audio-price="audioPackagePrice"
            :initial-package="unlockPackage"
        />
        <ChatVideoCallDialog
            v-if="isAdminUser"
            v-model:visible="showVideoCallDialog"
            :conversation-id="conversationId"
            @created="onVideoCallCreated"
        />
        <ChatPresentinhoDialog
            v-if="!isAdminUser && conversationId"
            v-model:visible="showPresentinhoDialog"
            :conversation-id="conversationId"
        />
        <ChatConteudoExclusivoDialog
            v-if="!isAdminUser && conversationId"
            v-model:visible="showExclusiveDialog"
            :conversation-id="conversationId"
            :image-price="exclusiveImagePrice"
            :video-price="exclusiveVideoPrice"
        />

        <Teleport to="body">
            <div
                v-if="showImagePreview && previewImageUrl"
                class="chat-lightbox"
                @click.self="closeImagePreview"
                @keydown.esc="closeImagePreview"
            >
                <button type="button" class="chat-lightbox-close" title="Fechar" @click="closeImagePreview">
                    <i class="pi pi-times"></i>
                </button>
                <img
                    :src="previewImageUrl"
                    alt="Pré-visualização"
                    class="chat-lightbox-img"
                />
            </div>
        </Teleport>
    </div>
</template>

<script>
import Avatar from 'primevue/avatar';
import InputText from 'primevue/inputtext';
import Menu from 'primevue/menu';
import EmojiPicker from '@/components/EmojiPicker.vue';
import ChatGalleryDialog from './ChatGalleryDialog.vue';
import ChatMediaUnlockDialog from './ChatMediaUnlockDialog.vue';
import ChatAudioBubble from './ChatAudioBubble.vue';
import ChatVoiceRecorder from './ChatVoiceRecorder.vue';
import ChatVideoCallCard from './ChatVideoCallCard.vue';
import ChatVideoCallDialog from './ChatVideoCallDialog.vue';
import ChatPresentinhoCard from './ChatPresentinhoCard.vue';
import ChatPresentinhoDialog from './ChatPresentinhoDialog.vue';
import ChatConteudoExclusivoCard from './ChatConteudoExclusivoCard.vue';
import ChatConteudoExclusivoDialog from './ChatConteudoExclusivoDialog.vue';
import { getEcho, isEchoConnected } from '@/utils/echo';
import { useChatStore } from '@/stores/chat';
import { isAdmin, currentUserId } from '@/utils/global';

export default {
    name: 'ChatThread',
    components: {
        Avatar,
        InputText,
        Menu,
        EmojiPicker,
        ChatGalleryDialog,
        ChatMediaUnlockDialog,
        ChatAudioBubble,
        ChatVoiceRecorder,
        ChatVideoCallCard,
        ChatVideoCallDialog,
        ChatPresentinhoCard,
        ChatPresentinhoDialog,
        ChatConteudoExclusivoCard,
        ChatConteudoExclusivoDialog,
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
            unlockPackage: 'media',
            showVideoCallDialog: false,
            showPresentinhoDialog: false,
            showExclusiveDialog: false,
            showComposerMenu: false,
            showImagePreview: false,
            previewImageUrl: null,
            replyingTo: null,
            editingMessage: null,
            typingUser: null,
            typingTimer: null,
            whisperTimer: null,
            menuMessage: null,
            mediaCredits: 0,
            audioCredits: 0,
            creditsPerPack: 5,
            audioCreditsPerPack: 5,
            audioMaxSeconds: 60,
            packagePrice: null,
            audioPackagePrice: null,
            exclusiveImagePrice: null,
            exclusiveVideoPrice: null,
            wallpaperDesktop: null,
            wallpaperMobile: null,
            channel: null,
            pollTimer: null,
            isRecording: false,
            recordPaused: false,
            recordElapsedMs: 0,
            recordLevel: 0,
            recordChunks: [],
            mediaRecorder: null,
            mediaStream: null,
            audioContext: null,
            analyser: null,
            recordRaf: null,
            recordStartedAt: 0,
            recordAccumMs: 0,
            recordPreviewUrl: null,
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
        hasDraft() {
            return Boolean((this.draft || '').trim());
        },
        canSendRecording() {
            return this.recordElapsedMs >= 800 && !this.sending;
        },
        otherUser() {
            return this.conversation?.other_user || null;
        },
        otherName() {
            const u = this.otherUser || {};
            return u.apelido || `${u.nome || ''} ${u.sobrenome || ''}`.trim() || 'Conversa';
        },
        messagesStyle() {
            const style = {};
            if (this.wallpaperDesktop) {
                style['--chat-wallpaper-desktop'] = `url("${this.wallpaperDesktop}")`;
            }
            if (this.wallpaperMobile) {
                style['--chat-wallpaper-mobile'] = `url("${this.wallpaperMobile}")`;
            }
            return style;
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
                    command: () => this.startReply(msg),
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
    mounted() {
        this._onDocClickComposer = (e) => {
            if (!this.showComposerMenu) return;
            const wrap = this.$refs.composerMenuWrap;
            if (wrap && !wrap.contains(e.target)) {
                this.showComposerMenu = false;
            }
        };
        document.addEventListener('click', this._onDocClickComposer);
    },
    beforeUnmount() {
        this.teardownChannel();
        this.stopPolling();
        this.closeImagePreview();
        this.cleanupRecording(true);
        if (this.typingTimer) clearTimeout(this.typingTimer);
        if (this.whisperTimer) clearTimeout(this.whisperTimer);
        if (this._onDocClickComposer) {
            document.removeEventListener('click', this._onDocClickComposer);
        }
    },
    methods: {
        isMine(msg) {
            return Number(msg.user_id) === Number(currentUserId());
        },
        replyPreview(msg) {
            if (!msg) return '';
            if (msg.type === 'image') return 'Foto';
            if (msg.type === 'video') return 'Vídeo';
            if (msg.type === 'audio') return 'Áudio';
            if (msg.type === 'video_call') return 'Chamada de vídeo';
            if (msg.type === 'presentinho') return 'Presentinho';
            if (msg.type === 'conteudo_exclusivo') return 'Conteúdo exclusivo';
            return msg.body || '';
        },
        parseVideoCallPayload(msg) {
            if (!msg?.body) return {};
            if (typeof msg.body === 'object') return msg.body;
            try {
                return JSON.parse(msg.body);
            } catch (e) {
                return {};
            }
        },
        parsePresentinhoPayload(msg) {
            if (!msg?.body) return {};
            if (typeof msg.body === 'object') return msg.body;
            try {
                return JSON.parse(msg.body);
            } catch (e) {
                return {};
            }
        },
        parseExclusivePayload(msg) {
            if (!msg?.body) return {};
            if (typeof msg.body === 'object') return msg.body;
            try {
                return JSON.parse(msg.body);
            } catch (e) {
                return {};
            }
        },
        onDraftInput() {
            this.onTyping();
            this.$nextTick(this.autoResizeDraft);
        },
        autoResizeDraft() {
            const el = this.$refs.draftInput;
            if (!el) return;
            el.style.height = 'auto';
            const max = 140;
            el.style.height = `${Math.min(el.scrollHeight, max)}px`;
        },
        onVideoCallCreated(message) {
            this.upsertMessage(message);
            this.$emit('updated');
            this.$nextTick(this.scrollToBottom);
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
            } catch (e) {
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
                this.audioCredits = data.audio_credits || 0;
                this.creditsPerPack = data.credits_per_pack || 5;
                this.audioCreditsPerPack = data.audio_credits_per_pack || 5;
                this.audioMaxSeconds = data.audio_max_seconds || 60;
                this.packagePrice = data.price;
                this.audioPackagePrice = data.audio_price;
                this.exclusiveImagePrice = data.exclusive_image_price;
                this.exclusiveVideoPrice = data.exclusive_video_price;
                this.wallpaperDesktop = data.wallpaper_desktop || null;
                this.wallpaperMobile = data.wallpaper_mobile || null;
                useChatStore().mediaCredits = this.mediaCredits;
            } catch {
                // silencioso
            }
        },
        teardownChannel() {
            if (this.channel && this.conversationId) {
                try {
                    getEcho()?.leave(`chat.${this.conversationId}`);
                } catch {
                    // ignore
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
            } catch {
                // silencioso
            }
        },
        scrollToBottom() {
            const el = this.$refs.messagesEl;
            if (el) el.scrollTop = el.scrollHeight;
        },
        onScroll() {},
        openMenu(event, msg) {
            this.menuMessage = msg;
            this.$nextTick(() => this.$refs.msgMenu.toggle(event));
        },
        startReply(msg) {
            this.replyingTo = msg;
            this.editingMessage = null;
            this.$nextTick(() => {
                const input = this.$el?.querySelector?.('.composer-input input, .composer-input');
                if (input && typeof input.focus === 'function') input.focus();
            });
        },
        insertEmoji(emoji) {
            this.draft += emoji;
            this.showEmoji = false;
            this.$nextTick(this.autoResizeDraft);
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
            this.$nextTick(this.autoResizeDraft);
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
                this.$nextTick(this.autoResizeDraft);
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
                this.openUnlock('media');
                return;
            }
            this.$refs.fileInput.click();
        },
        closeComposerMenu() {
            this.showComposerMenu = false;
        },
        onComposerAttach() {
            this.showComposerMenu = false;
            this.onAttachClick();
        },
        onComposerVideoCall() {
            this.showComposerMenu = false;
            this.showVideoCallDialog = true;
        },
        openUnlock(packageType = 'media') {
            this.unlockPackage = packageType === 'audio' ? 'audio' : 'media';
            this.showUnlock = true;
        },
        async onFileSelected(event) {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;

            if (!this.isAdminUser && this.mediaCredits < 1) {
                this.openUnlock('media');
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
                }
                if (typeof data.audio_credits === 'number') {
                    this.audioCredits = data.audio_credits;
                }
                if (typeof data.media_credits !== 'number') {
                    await this.loadPackageInfo();
                }
                this.replyingTo = null;
                this.$emit('updated');
                this.$nextTick(this.scrollToBottom);
            } catch (e) {
                if (e.response?.data?.requires_media_pack) {
                    this.openUnlock(e.response?.data?.package_needed || 'media');
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
        pickRecorderMime() {
            const candidates = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4',
                'audio/ogg;codecs=opus',
            ];
            for (const type of candidates) {
                if (window.MediaRecorder?.isTypeSupported?.(type)) return type;
            }
            return '';
        },
        async startRecording() {
            if (this.isRecording || this.sending) return;

            if (!this.isAdminUser && this.audioCredits < 1) {
                this.openUnlock('audio');
                return;
            }

            if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Não suportado',
                    detail: 'Seu navegador não permite gravar áudio.',
                    life: 4000,
                });
                return;
            }

            try {
                this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mimeType = this.pickRecorderMime();
                this.recordChunks = [];
                this.mediaRecorder = mimeType
                    ? new MediaRecorder(this.mediaStream, { mimeType })
                    : new MediaRecorder(this.mediaStream);

                this.mediaRecorder.ondataavailable = (event) => {
                    if (event.data && event.data.size > 0) {
                        this.recordChunks.push(event.data);
                    }
                };

                this.setupAnalyser(this.mediaStream);
                this.mediaRecorder.start(200);
                this.isRecording = true;
                this.recordPaused = false;
                this.recordAccumMs = 0;
                this.recordStartedAt = Date.now();
                this.recordElapsedMs = 0;
                this.showEmoji = false;
                this.tickRecordingClock();
            } catch (e) {
                this.cleanupRecording(true);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Microfone',
                    detail: 'Não foi possível acessar o microfone. Verifique a permissão.',
                    life: 4500,
                });
            }
        },
        setupAnalyser(stream) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = this.audioContext.createMediaStreamSource(stream);
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;
                source.connect(this.analyser);
            } catch (e) {
                this.analyser = null;
            }
        },
        tickRecordingClock() {
            if (this.recordRaf) cancelAnimationFrame(this.recordRaf);
            const loop = () => {
                if (!this.isRecording) return;

                if (!this.recordPaused) {
                    this.recordElapsedMs = this.recordAccumMs + (Date.now() - this.recordStartedAt);
                    const maxMs = this.audioMaxSeconds * 1000;
                    if (this.recordElapsedMs >= maxMs) {
                        this.recordElapsedMs = maxMs;
                        this.pauseRecording(true);
                        return;
                    }
                    if (this.analyser) {
                        const data = new Uint8Array(this.analyser.frequencyBinCount);
                        this.analyser.getByteTimeDomainData(data);
                        let sum = 0;
                        for (let i = 0; i < data.length; i += 1) {
                            const v = (data[i] - 128) / 128;
                            sum += v * v;
                        }
                        this.recordLevel = Math.min(1, Math.sqrt(sum / data.length) * 4);
                    } else {
                        this.recordLevel = 0.25;
                    }
                }

                this.recordRaf = requestAnimationFrame(loop);
            };
            this.recordRaf = requestAnimationFrame(loop);
        },
        pauseRecording(fromCap = false) {
            if (!this.mediaRecorder || this.recordPaused) return;
            try {
                if (this.mediaRecorder.state === 'recording') {
                    this.mediaRecorder.pause();
                }
            } catch (e) {
                // alguns browsers não suportam pause
            }
            this.recordAccumMs = Math.min(
                this.audioMaxSeconds * 1000,
                this.recordAccumMs + (Date.now() - this.recordStartedAt)
            );
            this.recordElapsedMs = this.recordAccumMs;
            this.recordPaused = true;
            this.recordLevel = 0;
            this.buildRecordPreview();
            if (fromCap) {
                this.$toast.add({
                    severity: 'info',
                    summary: 'Limite de 1 minuto',
                    detail: 'Gravação pausada. Ouça, envie ou descarte o áudio.',
                    life: 3500,
                });
            }
        },
        buildRecordPreview() {
            try {
                this.mediaRecorder?.requestData?.();
            } catch (e) {
                // ignore
            }
            window.setTimeout(() => {
                const mime = this.mediaRecorder?.mimeType || 'audio/webm';
                const blob = new Blob(this.recordChunks, { type: mime });
                if (this.recordPreviewUrl) {
                    URL.revokeObjectURL(this.recordPreviewUrl);
                    this.recordPreviewUrl = null;
                }
                if (blob.size > 0) {
                    this.recordPreviewUrl = URL.createObjectURL(blob);
                }
            }, 80);
        },
        resumeRecording() {
            if (!this.mediaRecorder || !this.recordPaused) return;
            if (this.recordElapsedMs >= this.audioMaxSeconds * 1000) return;
            if (this.recordPreviewUrl) {
                URL.revokeObjectURL(this.recordPreviewUrl);
                this.recordPreviewUrl = null;
            }
            try {
                if (this.mediaRecorder.state === 'paused') {
                    this.mediaRecorder.resume();
                }
            } catch (e) {
                // ignore
            }
            this.recordStartedAt = Date.now();
            this.recordPaused = false;
            this.tickRecordingClock();
        },
        toggleRecordPause() {
            if (this.recordPaused) this.resumeRecording();
            else this.pauseRecording(false);
        },
        async discardRecording() {
            await this.cleanupRecording(true);
        },
        stopRecorderToBlob() {
            return new Promise((resolve) => {
                const recorder = this.mediaRecorder;
                if (!recorder) {
                    resolve(null);
                    return;
                }

                const finish = () => {
                    const mime = recorder.mimeType || 'audio/webm';
                    const blob = new Blob(this.recordChunks, { type: mime });
                    resolve(blob.size > 0 ? blob : null);
                };

                if (recorder.state === 'inactive') {
                    finish();
                    return;
                }

                recorder.onstop = finish;
                try {
                    recorder.requestData?.();
                } catch (e) {
                    // ignore
                }
                recorder.stop();
            });
        },
        async cleanupRecording(hard = false) {
            if (this.recordRaf) {
                cancelAnimationFrame(this.recordRaf);
                this.recordRaf = null;
            }
            try {
                if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                    this.mediaRecorder.onstop = null;
                    this.mediaRecorder.stop();
                }
            } catch (e) {
                // ignore
            }
            this.mediaRecorder = null;
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach((t) => t.stop());
                this.mediaStream = null;
            }
            if (this.audioContext) {
                try {
                    await this.audioContext.close();
                } catch (e) {
                    // ignore
                }
                this.audioContext = null;
            }
            this.analyser = null;
            if (this.recordPreviewUrl) {
                URL.revokeObjectURL(this.recordPreviewUrl);
                this.recordPreviewUrl = null;
            }
            if (hard) {
                this.recordChunks = [];
                this.isRecording = false;
                this.recordPaused = false;
                this.recordElapsedMs = 0;
                this.recordAccumMs = 0;
                this.recordLevel = 0;
            }
        },
        async sendRecording() {
            if (!this.canSendRecording) return;
            const durationSec = Math.max(1, Math.min(
                this.audioMaxSeconds,
                Math.round(this.recordElapsedMs / 1000)
            ));

            this.sending = true;
            try {
                const blob = await this.stopRecorderToBlob();
                await this.cleanupRecording(true);
                if (!blob) {
                    throw new Error('Áudio vazio');
                }

                const ext = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm';
                const file = new File([blob], `audio_${Date.now()}.${ext}`, { type: blob.type || 'audio/webm' });

                const form = new FormData();
                form.append('type', 'audio');
                form.append('media', file);
                form.append('body', String(durationSec));
                if (this.replyingTo) form.append('reply_to_id', this.replyingTo.id);

                const { data } = await this.api.post(
                    `/chat/conversations/${this.conversationId}/messages`,
                    form
                );
                this.upsertMessage(data.data || data);
                if (typeof data.audio_credits === 'number') {
                    this.audioCredits = data.audio_credits;
                }
                if (typeof data.media_credits === 'number') {
                    this.mediaCredits = data.media_credits;
                    useChatStore().mediaCredits = this.mediaCredits;
                }
                this.replyingTo = null;
                this.$emit('updated');
                this.$nextTick(this.scrollToBottom);
            } catch (e) {
                if (e.response?.data?.requires_media_pack) {
                    this.openUnlock(e.response?.data?.package_needed || 'audio');
                }
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || e.message || 'Falha ao enviar áudio',
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
        openImagePreview(url) {
            if (!url) return;
            this.previewImageUrl = url;
            this.showImagePreview = true;
            document.body.style.overflow = 'hidden';
        },
        closeImagePreview() {
            this.showImagePreview = false;
            this.previewImageUrl = null;
            document.body.style.overflow = '';
        },
    },
};
</script>

<style scoped lang="scss">
.chat-thread {
    height: 100%;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    background: #0d0d0d;
    position: relative;
    overflow: visible;
    min-width: 0;
}

.chat-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: #121212;
    border-bottom: 1px solid #2a2a2a;
    flex-shrink: 0;
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

.gift-btn {
    color: #f9a8d4;
}

.exclusive-btn {
    color: #fbbf24;
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
    background-color: #0d0d0d;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
}

.chat-messages.has-wallpaper-desktop {
    background-image: var(--chat-wallpaper-desktop);
}

.chat-messages.has-wallpaper-mobile {
    @media (max-width: 768px) {
        background-image: var(--chat-wallpaper-mobile);
    }
}

/* Se só tiver mobile, usa no mobile; no desktop fica sólido se não houver desktop */
.chat-messages.has-wallpaper-mobile:not(.has-wallpaper-desktop) {
    @media (max-width: 768px) {
        background-image: var(--chat-wallpaper-mobile);
    }
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
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;

    &.mine {
        justify-content: flex-end;
    }

    &.has-like {
        margin-bottom: 0.85rem;
    }
}

.msg-cluster {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    max-width: min(88%, 480px);
    min-width: 0;
}

.msg-row.mine .msg-cluster {
    flex-direction: row-reverse;
}

.side-reply-btn {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 50%;
    background: #1c1c1c;
    color: #f5cee1;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);

    &:hover {
        background: #761c49;
        transform: scale(1.05);
    }
}

.msg-row:hover .side-reply-btn,
.msg-row:focus-within .side-reply-btn {
    opacity: 1;
    pointer-events: auto;
}

@media (hover: none) {
    .side-reply-btn {
        opacity: 0.9;
        pointer-events: auto;
    }
}

.bubble-meta {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.2rem;
    padding: 0 0.2rem;
    font-size: 0.7rem;
    color: #bbb;
}

.bubble {
    max-width: min(78vw, 420px);
    min-width: 0;
    background: #1f1f1f;
    color: #fff;
    border-radius: 12px 12px 12px 4px;
    padding: 0.55rem 0.7rem;
    padding-top: 0.7rem;
    position: relative;
    box-sizing: border-box;

    &.mine {
        background: #3a1f2e;
        border-radius: 12px 12px 4px 12px;
    }

    &.media {
        width: min(72vw, 260px);
        max-width: min(72vw, 260px);
        padding: 0.3rem;
        padding-top: 0.55rem;
        overflow: visible;
    }

    &.audio {
        width: min(78vw, 300px);
        max-width: min(78vw, 300px);
        padding: 0.45rem 0.55rem 0.35rem;
        padding-top: 0.65rem;
    }

    &.video-call {
        width: auto;
        max-width: min(85vw, 320px);
        padding: 0.45rem;
        padding-top: 0.6rem;
    }
}

.bubble-menu-btn {
    position: absolute;
    top: 0.2rem;
    right: 0.25rem;
    width: 1.45rem;
    height: 1.45rem;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: rgba(245, 206, 225, 0.55);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    z-index: 3;
    padding: 0;
    font-size: 0.7rem;
    transition: opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease;

    &:hover {
        background: rgba(0, 0, 0, 0.35);
        color: #f5cee1;
    }
}

.msg-row:hover .bubble-menu-btn,
.msg-row:focus-within .bubble-menu-btn,
.bubble:hover .bubble-menu-btn {
    opacity: 1;
}

@media (hover: none) {
    .bubble-menu-btn {
        opacity: 0.7;
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

.bubble.audio .bubble-media-wrap {
    overflow: visible;
    background: transparent;
    border-radius: 0;
    line-height: normal;
}

.bubble.video-call .bubble-media-wrap {
    overflow: visible;
    background: transparent;
    border-radius: 0;
    line-height: normal;
}

.bubble-media-btn {
    display: block;
    width: 100%;
    padding: 0;
    margin: 0;
    border: none;
    background: transparent;
    cursor: zoom-in;
    line-height: 0;
}

.bubble-media-img {
    display: block;
    width: 100%;
    max-width: 100%;
    height: auto;
    max-height: 240px;
    object-fit: cover;
    object-position: center;
    border-radius: 10px;
    vertical-align: middle;
}

.bubble-media-video {
    display: block;
    width: 100%;
    max-width: 100%;
    height: auto;
    max-height: 240px;
    object-fit: contain;
    border-radius: 10px;
    background: #000;
}

.edited {
    font-style: italic;
}

.ticks .read {
    color: #f5cee1;
}

.like-badge {
    position: absolute;
    bottom: -0.7rem;
    left: 0.65rem;
    z-index: 4;
    border: 1px solid #2a2a2a;
    background: #161616;
    color: #fff;
    border-radius: 999px;
    padding: 0.15rem 0.45rem;
    font-size: 0.78rem;
    line-height: 1;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

.msg-row.mine .like-badge {
    left: auto;
    right: 0.65rem;
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
    align-items: flex-end;
    padding: 0.65rem 0.75rem;
    background: #121212;
    border-top: 1px solid #2a2a2a;
    flex-shrink: 0;
    position: relative;
    overflow: visible;
    z-index: 20;

    &.is-recording {
        padding-bottom: 1.35rem;
        align-items: center;
        z-index: 2;
    }
}

.composer-left {
    display: flex;
    align-items: center;
    gap: 0.15rem;
    flex-shrink: 0;
    position: relative;
}

.composer-menu-wrap {
    position: relative;
    flex-shrink: 0;
}

.composer-menu {
    position: absolute;
    left: 50%;
    bottom: calc(100% + 0.45rem);
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    z-index: 40;
}

.composer-menu-item {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    border: 1px solid #333;
    background: #1f1f1f;
    color: #f5cee1;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);

    &:hover {
        background: #2a2a2a;
    }
}

.composer-input {
    flex: 1;
    border-radius: 18px !important;
    resize: none;
    overflow-y: auto;
    min-height: 2.4rem;
    max-height: 140px;
    padding: 0.55rem 0.9rem;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    color: #fff;
    font: inherit;
    line-height: 1.35;

    &:focus {
        outline: none;
        border-color: #f5cee1;
    }
}

.send-btn,
.mic-btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.send-btn {
    background: #f5cee1;
    color: #761c49;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.mic-btn {
    background: transparent;
    color: #f5cee1;
    font-size: 1.15rem;

    &:hover {
        background: #1a1a1a;
    }

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

<style lang="scss">
.chat-lightbox {
    position: fixed;
    inset: 0;
    z-index: 12000;
    background: rgba(0, 0, 0, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    box-sizing: border-box;
}

.chat-lightbox-img {
    display: block;
    width: auto;
    height: auto;
    max-width: min(98vw, 1400px);
    max-height: 94vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
}

.chat-lightbox-close {
    position: fixed;
    top: 1rem;
    right: 1rem;
    width: 2.6rem;
    height: 2.6rem;
    border: none;
    border-radius: 50%;
    background: rgba(30, 30, 30, 0.9);
    color: #f5cee1;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    z-index: 12001;

    &:hover {
        background: #761c49;
    }
}

.chat-image-preview-content {
    padding: 0.5rem !important;
    background: #0d0d0d !important;
    display: flex;
    justify-content: center;
    align-items: center;
}

.chat-image-preview-full {
    display: block;
    width: auto;
    max-width: 100%;
    max-height: min(82vh, 860px);
    height: auto;
    object-fit: contain;
    border-radius: 8px;
}
</style>
