<template>
    <Dialog
        :visible="visible"
        modal
        header="Enviar mensagem em massa"
        :style="{ width: 'min(94vw, 560px)' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <div class="broadcast-body">
            <div class="field">
                <label class="field-label">Destinatários</label>
                <div class="audience-grid">
                    <button
                        type="button"
                        class="audience-card"
                        :class="{ active: audience === 'all' }"
                        @click="audience = 'all'"
                    >
                        <i class="pi pi-users"></i>
                        <span>Todos os clientes</span>
                    </button>
                    <button
                        type="button"
                        class="audience-card"
                        :class="{ active: audience === 'active' }"
                        @click="audience = 'active'"
                    >
                        <i class="pi pi-verified"></i>
                        <span>Assinantes ativos</span>
                    </button>
                    <button
                        type="button"
                        class="audience-card"
                        :class="{ active: audience === 'manual' }"
                        @click="audience = 'manual'"
                    >
                        <i class="pi pi-check-square"></i>
                        <span>Selecionar manualmente</span>
                    </button>
                </div>
            </div>

            <div v-if="audience === 'manual'" class="field manual-box">
                <InputText
                    v-model="search"
                    placeholder="Buscar cliente..."
                    class="w-full mb-2"
                    size="small"
                    @input="onSearchInput"
                />
                <div class="selected-count" v-if="selectedIds.length">
                    {{ selectedIds.length }} selecionado(s)
                </div>
                <div class="user-scroll">
                    <div v-if="loadingUsers && users.length === 0" class="center">
                        <i class="pi pi-spin pi-spinner"></i>
                    </div>
                    <label
                        v-for="user in users"
                        :key="user.id"
                        class="user-row"
                    >
                        <input
                            type="checkbox"
                            :value="user.id"
                            :checked="selectedIds.includes(user.id)"
                            @change="toggleUser(user.id)"
                        />
                        <Avatar
                            :image="user.path_img_avatar || defaultAvatar"
                            shape="circle"
                        />
                        <div class="user-meta">
                            <div class="name">{{ displayName(user) }}</div>
                            <div class="sub">
                                <span v-if="user.has_active_subscription" class="ok">Ativo</span>
                                <span v-else class="warn">Sem assinatura</span>
                            </div>
                        </div>
                    </label>
                    <div v-if="!loadingUsers && users.length === 0" class="center muted">
                        Nenhum cliente encontrado.
                    </div>
                </div>
            </div>

            <div class="field">
                <IftaLabel>
                    <InputText id="bc_titulo" v-model="titulo" class="w-full" />
                    <label for="bc_titulo">Título (opcional)</label>
                </IftaLabel>
            </div>

            <div class="field">
                <label class="field-label" for="bc_body">Mensagem (opcional)</label>
                <Textarea
                    id="bc_body"
                    v-model="body"
                    rows="4"
                    class="w-full"
                    autoResize
                    placeholder="Escreva a mensagem..."
                />
            </div>

            <div class="field">
                <label class="field-label">Imagens e vídeos (opcional)</label>
                <div class="media-actions">
                    <Button
                        label="Adicionar mídia"
                        icon="pi pi-images"
                        size="small"
                        outlined
                        :disabled="mediaItems.length >= 10"
                        @click="$refs.mediaInput.click()"
                    />
                    <input
                        ref="mediaInput"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        hidden
                        @change="onMediaSelected"
                    />
                    <span class="media-count" v-if="mediaItems.length">
                        {{ mediaItems.length }}/10
                    </span>
                </div>
                <div v-if="mediaItems.length" class="media-grid">
                    <div
                        v-for="item in mediaItems"
                        :key="item.id"
                        class="media-thumb"
                    >
                        <img v-if="item.kind === 'image'" :src="item.url" alt="" />
                        <video v-else :src="item.url" muted />
                        <span class="kind-badge">{{ item.kind === 'image' ? 'Foto' : 'Vídeo' }}</span>
                        <button type="button" class="remove-media" title="Remover" @click="removeMedia(item.id)">
                            <i class="pi pi-times"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="field audio-field">
                <label class="field-label">Áudio (opcional)</label>
                <div class="audio-actions">
                    <Button
                        v-if="!isRecording && !audioBlob"
                        label="Gravar áudio"
                        icon="pi pi-microphone"
                        size="small"
                        outlined
                        @click="startRecording"
                    />
                    <Button
                        v-if="isRecording"
                        :label="`Parar (${recordLabel})`"
                        icon="pi pi-stop"
                        size="small"
                        severity="danger"
                        @click="stopRecording"
                    />
                    <template v-if="audioBlob && !isRecording">
                        <audio :src="audioPreviewUrl" controls class="audio-preview" />
                        <Button
                            label="Remover áudio"
                            icon="pi pi-trash"
                            size="small"
                            text
                            severity="danger"
                            @click="clearAudio"
                        />
                    </template>
                </div>
                <p class="hint">
                    Máximo 10 imagens/vídeos e 1 minuto de áudio. Envie título, mensagem, mídia e/ou áudio — ao menos um é obrigatório.
                </p>
            </div>
        </div>

        <template #footer>
            <Button label="Cancelar" text @click="$emit('update:visible', false)" />
            <Button
                class="send-btn"
                label="Enviar"
                icon="pi pi-send"
                :loading="sending"
                @click="enviar"
            />
        </template>
    </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import IftaLabel from 'primevue/iftalabel';
import Avatar from 'primevue/avatar';

export default {
    name: 'ChatBroadcastDialog',
    components: { Dialog, Button, InputText, Textarea, IftaLabel, Avatar },
    props: {
        visible: Boolean,
    },
    emits: ['update:visible', 'sent'],
    data() {
        return {
            audience: 'all',
            titulo: '',
            body: '',
            sending: false,
            search: '',
            users: [],
            selectedIds: [],
            loadingUsers: false,
            searchTimer: null,
            defaultAvatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
            isRecording: false,
            mediaRecorder: null,
            mediaStream: null,
            recordChunks: [],
            recordStartedAt: 0,
            recordElapsedMs: 0,
            recordTimer: null,
            audioBlob: null,
            audioPreviewUrl: null,
            audioDuration: 0,
            mediaItems: [],
            mediaIdSeq: 0,
        };
    },
    computed: {
        recordLabel() {
            const s = Math.floor(this.recordElapsedMs / 1000);
            const mm = String(Math.floor(s / 60)).padStart(1, '0');
            const ss = String(s % 60).padStart(2, '0');
            return `${mm}:${ss}`;
        },
        canSend() {
            return Boolean(
                this.titulo.trim()
                || this.body.trim()
                || this.audioBlob
                || this.mediaItems.length
            );
        },
    },
    watch: {
        visible(val) {
            if (val) {
                this.resetForm();
            } else {
                this.cleanupRecording(true);
                this.clearMedia();
            }
        },
        audience(val) {
            if (val === 'manual') this.loadUsers();
        },
    },
    beforeUnmount() {
        if (this.searchTimer) clearTimeout(this.searchTimer);
        this.cleanupRecording(true);
        this.clearMedia();
    },
    methods: {
        resetForm() {
            this.audience = 'all';
            this.titulo = '';
            this.body = '';
            this.search = '';
            this.users = [];
            this.selectedIds = [];
            this.clearAudio();
            this.clearMedia();
        },
        onMediaSelected(event) {
            const files = Array.from(event.target.files || []);
            event.target.value = '';
            if (!files.length) return;

            const remaining = 10 - this.mediaItems.length;
            if (remaining <= 0) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Limite',
                    detail: 'Máximo de 10 arquivos por envio.',
                    life: 3000,
                });
                return;
            }

            const accepted = files.slice(0, remaining);
            if (files.length > remaining) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Limite',
                    detail: `Apenas ${remaining} arquivo(s) foram adicionados (máx. 10).`,
                    life: 3500,
                });
            }

            for (const file of accepted) {
                const isVideo = file.type.startsWith('video/');
                const isImage = file.type.startsWith('image/');
                if (!isVideo && !isImage) {
                    this.$toast.add({
                        severity: 'warn',
                        summary: 'Arquivo inválido',
                        detail: `${file.name} não é imagem nem vídeo.`,
                        life: 3000,
                    });
                    continue;
                }

                const max = isVideo ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
                if (file.size > max) {
                    this.$toast.add({
                        severity: 'warn',
                        summary: 'Arquivo grande',
                        detail: isVideo
                            ? `${file.name}: vídeo até 100MB`
                            : `${file.name}: imagem até 25MB`,
                        life: 3500,
                    });
                    continue;
                }

                this.mediaIdSeq += 1;
                this.mediaItems.push({
                    id: this.mediaIdSeq,
                    file,
                    kind: isVideo ? 'video' : 'image',
                    url: URL.createObjectURL(file),
                });
            }
        },
        removeMedia(id) {
            const item = this.mediaItems.find((m) => m.id === id);
            if (item?.url) URL.revokeObjectURL(item.url);
            this.mediaItems = this.mediaItems.filter((m) => m.id !== id);
        },
        clearMedia() {
            this.mediaItems.forEach((item) => {
                if (item.url) URL.revokeObjectURL(item.url);
            });
            this.mediaItems = [];
        },
        displayName(user) {
            return user.apelido || `${user.nome || ''} ${user.sobrenome || ''}`.trim() || user.email;
        },
        onSearchInput() {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.loadUsers(), 350);
        },
        async loadUsers() {
            this.loadingUsers = true;
            try {
                const { data } = await this.api.get('/chat/users', {
                    params: {
                        search: this.search.trim() || undefined,
                        page: 1,
                        per_page: 50,
                    },
                    skipLoading: true,
                });
                this.users = data.data || [];
            } catch {
                this.users = [];
            } finally {
                this.loadingUsers = false;
            }
        },
        toggleUser(id) {
            const n = Number(id);
            if (this.selectedIds.includes(n)) {
                this.selectedIds = this.selectedIds.filter((x) => x !== n);
            } else {
                this.selectedIds = [...this.selectedIds, n];
            }
        },
        async startRecording() {
            try {
                this.clearAudio();
                this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.recordChunks = [];
                const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm';
                this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType: mime });
                this.mediaRecorder.ondataavailable = (e) => {
                    if (e.data?.size) this.recordChunks.push(e.data);
                };
                this.mediaRecorder.onstop = () => {
                    const blob = new Blob(this.recordChunks, { type: 'audio/webm' });
                    this.audioBlob = blob;
                    this.audioDuration = Math.max(1, Math.round(this.recordElapsedMs / 1000));
                    if (this.audioPreviewUrl) URL.revokeObjectURL(this.audioPreviewUrl);
                    this.audioPreviewUrl = URL.createObjectURL(blob);
                    this.stopStream();
                };
                this.mediaRecorder.start(200);
                this.isRecording = true;
                this.recordStartedAt = Date.now();
                this.recordElapsedMs = 0;
                this.recordTimer = setInterval(() => {
                    this.recordElapsedMs = Date.now() - this.recordStartedAt;
                    if (this.recordElapsedMs >= 60000) this.stopRecording();
                }, 200);
            } catch {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Microfone',
                    detail: 'Não foi possível acessar o microfone.',
                    life: 3500,
                });
            }
        },
        stopRecording() {
            if (!this.isRecording) return;
            this.isRecording = false;
            if (this.recordTimer) {
                clearInterval(this.recordTimer);
                this.recordTimer = null;
            }
            try {
                if (this.mediaRecorder?.state !== 'inactive') this.mediaRecorder.stop();
            } catch {
                // ignore
            }
        },
        stopStream() {
            this.mediaStream?.getTracks?.().forEach((t) => t.stop());
            this.mediaStream = null;
        },
        clearAudio() {
            this.audioBlob = null;
            this.audioDuration = 0;
            if (this.audioPreviewUrl) {
                URL.revokeObjectURL(this.audioPreviewUrl);
                this.audioPreviewUrl = null;
            }
        },
        cleanupRecording(clearAudio = false) {
            if (this.isRecording) this.stopRecording();
            this.stopStream();
            if (this.recordTimer) {
                clearInterval(this.recordTimer);
                this.recordTimer = null;
            }
            if (clearAudio) this.clearAudio();
        },
        async enviar() {
            if (!this.canSend) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Conteúdo obrigatório',
                    detail: 'Informe título, mensagem, mídia ou grave um áudio.',
                    life: 3500,
                });
                return;
            }

            if (this.audience === 'manual' && this.selectedIds.length === 0) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Destinatários',
                    detail: 'Selecione pelo menos um cliente.',
                    life: 3500,
                });
                return;
            }

            this.sending = true;
            try {
                const form = new FormData();
                form.append('audience', this.audience);
                if (this.titulo.trim()) form.append('titulo', this.titulo.trim());
                if (this.body.trim()) form.append('body', this.body.trim());
                if (this.audience === 'manual') {
                    this.selectedIds.forEach((id) => form.append('user_ids[]', String(id)));
                }
                if (this.audioBlob) {
                    form.append('media', this.audioBlob, 'broadcast.webm');
                    form.append('audio_duration', String(this.audioDuration || 1));
                }
                this.mediaItems.forEach((item) => {
                    form.append('media_files[]', item.file, item.file.name);
                });

                const { data } = await this.api.post('/chat/broadcast', form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                this.$toast.add({
                    severity: 'success',
                    summary: 'Enviado',
                    detail: data.message || `Enviado para ${data.sent} cliente(s).`,
                    life: 4000,
                });
                this.$emit('sent', data);
                this.$emit('update:visible', false);
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Não foi possível enviar a mensagem',
                    life: 4000,
                });
            } finally {
                this.sending = false;
            }
        },
    },
};
</script>

<style scoped lang="scss">
.broadcast-body {
    display: flex;
    flex-direction: column;
    gap: 0.95rem;
    color: #ddd;
}

.field-label {
    display: block;
    margin-bottom: 0.4rem;
    font-size: 0.85rem;
    color: #aaa;
}

.audience-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.55rem;
}

.audience-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 0.75rem 0.5rem;
    border-radius: 10px;
    border: 1px solid #333;
    background: #161616;
    color: #ddd;
    cursor: pointer;
    text-align: center;
    font-size: 0.78rem;
    font-weight: 600;

    i {
        font-size: 1.15rem;
        color: #c4b5fd;
    }

    &.active {
        border-color: #a78bfa;
        background: rgba(167, 139, 250, 0.12);
        color: #ede9fe;
    }
}

.manual-box {
    border: 1px solid #2a2a2a;
    border-radius: 10px;
    padding: 0.75rem;
    background: #121212;
}

.selected-count {
    font-size: 0.8rem;
    color: #c4b5fd;
    margin-bottom: 0.45rem;
}

.user-scroll {
    max-height: 180px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.user-row {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.4rem 0.35rem;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
        background: #1a1a1a;
    }

    input {
        accent-color: #a78bfa;
    }
}

.user-meta {
    min-width: 0;
    flex: 1;
}

.name {
    color: #fff;
    font-size: 0.88rem;
    font-weight: 600;
}

.sub {
    font-size: 0.75rem;
    .ok { color: #4ade80; }
    .warn { color: #fbbf24; }
}

.center {
    text-align: center;
    padding: 0.75rem;
    color: #888;
}

.muted {
    color: #777;
}

.audio-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.55rem;
}

.media-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.55rem;
}

.media-count {
    font-size: 0.8rem;
    color: #c4b5fd;
}

.media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
    gap: 0.55rem;
    margin-top: 0.65rem;
}

.media-thumb {
    position: relative;
    aspect-ratio: 1;
    border-radius: 10px;
    overflow: hidden;
    background: #1a1a1a;
    border: 1px solid #333;

    img,
    video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
}

.kind-badge {
    position: absolute;
    left: 6px;
    bottom: 6px;
    font-size: 0.65rem;
    font-weight: 700;
    color: #fff;
    background: rgba(0, 0, 0, 0.65);
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
}

.remove-media {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    cursor: pointer;
    display: grid;
    place-items: center;
    padding: 0;

    i {
        font-size: 0.7rem;
    }
}

.audio-preview {
    width: min(100%, 240px);
    height: 36px;
}

.hint {
    margin: 0.45rem 0 0;
    font-size: 0.78rem;
    color: #888;
    line-height: 1.4;
}

.send-btn {
    background: #7c3aed !important;
    border-color: #7c3aed !important;
    color: #fff !important;

    :deep(.p-button-label),
    :deep(.p-button-icon) {
        color: #fff !important;
    }
}

@media (max-width: 560px) {
    .audience-grid {
        grid-template-columns: 1fr;
    }
}
</style>
