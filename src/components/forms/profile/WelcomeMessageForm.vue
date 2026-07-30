<template>
    <div class="welcome-config">
        <div class="col-md-12 text-300 mb-3">
            <h4>Mensagem inicial</h4>
            <p class="hint">
                Essa mensagem é enviada automaticamente no chat quando um cliente assina pela primeira vez.
                Defina título, texto, imagem, vídeo e/ou áudio — pelo menos um é obrigatório.
            </p>
        </div>

        <div class="row">
            <div class="col-12 mb-3">
                <IftaLabel>
                    <InputText id="welcome_titulo" v-model="dados.titulo" class="w-full" />
                    <label for="welcome_titulo">Título (opcional)</label>
                </IftaLabel>
            </div>

            <div class="col-12 mb-3">
                <label class="field-label" for="welcome_body">Mensagem (opcional)</label>
                <Textarea
                    id="welcome_body"
                    v-model="dados.body"
                    rows="4"
                    class="w-full"
                    autoResize
                    placeholder="Escreva a mensagem de boas-vindas..."
                />
            </div>
        </div>

        <div class="media-block mb-3">
            <label class="field-label">Imagem (opcional)</label>
            <div class="media-row">
                <Button
                    label="Escolher imagem"
                    icon="pi pi-image"
                    size="small"
                    outlined
                    :loading="uploadingImage"
                    @click="$refs.imageInput.click()"
                />
                <Button
                    v-if="dados.image_url"
                    label="Remover"
                    icon="pi pi-trash"
                    size="small"
                    text
                    severity="danger"
                    :loading="removingImage"
                    @click="removeMedia('image')"
                />
                <input
                    ref="imageInput"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    hidden
                    @change="onFileSelected($event, 'image')"
                />
            </div>
            <img v-if="dados.image_url" :src="dados.image_url" class="preview-img" alt="Prévia imagem" />
        </div>

        <div class="media-block mb-3">
            <label class="field-label">Vídeo (opcional)</label>
            <div class="media-row">
                <Button
                    label="Escolher vídeo"
                    icon="pi pi-video"
                    size="small"
                    outlined
                    :loading="uploadingVideo"
                    @click="$refs.videoInput.click()"
                />
                <Button
                    v-if="dados.video_url"
                    label="Remover"
                    icon="pi pi-trash"
                    size="small"
                    text
                    severity="danger"
                    :loading="removingVideo"
                    @click="removeMedia('video')"
                />
                <input
                    ref="videoInput"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    hidden
                    @change="onFileSelected($event, 'video')"
                />
            </div>
            <video v-if="dados.video_url" :src="dados.video_url" class="preview-video" controls />
        </div>

        <div class="media-block mb-2">
            <label class="field-label">Áudio (opcional)</label>
            <div class="media-row">
                <Button
                    v-if="!isRecording && !dados.audio_url && !pendingAudioBlob"
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
                <Button
                    v-if="!isRecording"
                    label="Enviar arquivo"
                    icon="pi pi-upload"
                    size="small"
                    outlined
                    :loading="uploadingAudio"
                    @click="$refs.audioInput.click()"
                />
                <Button
                    v-if="dados.audio_url || pendingAudioBlob"
                    label="Remover áudio"
                    icon="pi pi-trash"
                    size="small"
                    text
                    severity="danger"
                    :loading="removingAudio"
                    @click="removeAudio"
                />
                <input
                    ref="audioInput"
                    type="file"
                    accept="audio/*,.webm,.mp3,.ogg,.m4a,.wav"
                    hidden
                    @change="onFileSelected($event, 'audio')"
                />
            </div>
            <audio
                v-if="audioPreviewUrl"
                :src="audioPreviewUrl"
                controls
                class="preview-audio"
            />
            <p class="hint-sm">Áudio com no máximo 1 minuto.</p>
        </div>

        <p class="hint-sm">
            Status:
            <span :class="hasContent ? 'ok' : 'warn'">
                {{ hasContent ? 'Mensagem inicial configurada' : 'Nenhum conteúdo definido ainda' }}
            </span>
        </p>
    </div>
</template>

<script>
import IftaLabel from 'primevue/iftalabel';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

export default {
    name: 'WelcomeMessageForm',
    components: { IftaLabel, InputText, Textarea, Button },
    props: {
        userId: { type: [Number, String], default: null },
    },
    data() {
        return {
            dados: {
                titulo: '',
                body: '',
                image_url: null,
                video_url: null,
                audio_url: null,
                audio_duration: null,
            },
            uploadingImage: false,
            uploadingVideo: false,
            uploadingAudio: false,
            removingImage: false,
            removingVideo: false,
            removingAudio: false,
            isRecording: false,
            mediaRecorder: null,
            mediaStream: null,
            recordChunks: [],
            recordStartedAt: 0,
            recordElapsedMs: 0,
            recordTimer: null,
            pendingAudioBlob: null,
            pendingAudioUrl: null,
            pendingAudioDuration: 0,
        };
    },
    computed: {
        hasContent() {
            return Boolean(
                this.dados.titulo?.trim()
                || this.dados.body?.trim()
                || this.dados.image_url
                || this.dados.video_url
                || this.dados.audio_url
                || this.pendingAudioBlob
            );
        },
        audioPreviewUrl() {
            return this.pendingAudioUrl || this.dados.audio_url;
        },
        recordLabel() {
            const s = Math.floor(this.recordElapsedMs / 1000);
            const mm = String(Math.floor(s / 60)).padStart(1, '0');
            const ss = String(s % 60).padStart(2, '0');
            return `${mm}:${ss}`;
        },
    },
    beforeUnmount() {
        this.cleanupRecording(true);
    },
    methods: {
        preencherDados(dados) {
            this.dados = {
                titulo: dados.titulo || '',
                body: dados.body || '',
                image_url: dados.image_url || null,
                video_url: dados.video_url || null,
                audio_url: dados.audio_url || null,
                audio_duration: dados.audio_duration || null,
            };
            this.clearPendingAudio();
        },
        dadosWelcome() {
            return {
                welcome_titulo: this.dados.titulo?.trim() || null,
                welcome_body: this.dados.body?.trim() || null,
            };
        },
        async ensurePendingAudioUploaded() {
            if (!this.pendingAudioBlob) return true;
            return this.uploadBlob('audio', this.pendingAudioBlob, 'welcome-audio.webm', this.pendingAudioDuration || 1);
        },
        async onFileSelected(event, type) {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;

            if (type === 'image' && file.size > 25 * 1024 * 1024) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Arquivo grande',
                    detail: 'Imagem até 25MB',
                    life: 3500,
                });
                return;
            }
            if (type === 'video' && file.size > 100 * 1024 * 1024) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Arquivo grande',
                    detail: 'Vídeo até 100MB',
                    life: 3500,
                });
                return;
            }
            if (type === 'audio' && file.size > 10 * 1024 * 1024) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Arquivo grande',
                    detail: 'Áudio até 10MB',
                    life: 3500,
                });
                return;
            }

            await this.uploadBlob(type, file, file.name, type === 'audio' ? 1 : null);
        },
        async uploadBlob(type, file, filename, audioDuration = null) {
            if (!this.userId) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Usuário não encontrado',
                    life: 3000,
                });
                return false;
            }

            const loadingKey = type === 'image'
                ? 'uploadingImage'
                : type === 'video'
                    ? 'uploadingVideo'
                    : 'uploadingAudio';
            this[loadingKey] = true;

            try {
                const form = new FormData();
                form.append('type', type);
                form.append('media', file, filename);
                if (type === 'audio') {
                    form.append('audio_duration', String(audioDuration || 1));
                }

                const { data } = await this.api.post(
                    `/users/${this.userId}/upload-welcome-media`,
                    form,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );

                if (type === 'image') this.dados.image_url = data.url;
                if (type === 'video') this.dados.video_url = data.url;
                if (type === 'audio') {
                    this.dados.audio_url = data.url;
                    this.dados.audio_duration = data.audio_duration || audioDuration || 1;
                    this.clearPendingAudio();
                }

                this.$toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Mídia atualizada',
                    life: 2500,
                });
                return true;
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Falha no upload',
                    life: 4000,
                });
                return false;
            } finally {
                this[loadingKey] = false;
            }
        },
        async removeMedia(type) {
            if (!this.userId) return;
            const loadingKey = type === 'image' ? 'removingImage' : 'removingVideo';
            this[loadingKey] = true;
            try {
                await this.api.delete(`/users/${this.userId}/welcome-media/${type}`);
                if (type === 'image') this.dados.image_url = null;
                if (type === 'video') this.dados.video_url = null;
                this.$toast.add({
                    severity: 'success',
                    summary: 'Removido',
                    detail: 'Mídia removida',
                    life: 2500,
                });
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Não foi possível remover',
                    life: 3500,
                });
            } finally {
                this[loadingKey] = false;
            }
        },
        async removeAudio() {
            this.clearPendingAudio();
            if (!this.dados.audio_url) return;
            this.removingAudio = true;
            try {
                await this.api.delete(`/users/${this.userId}/welcome-media/audio`);
                this.dados.audio_url = null;
                this.dados.audio_duration = null;
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Não foi possível remover o áudio',
                    life: 3500,
                });
            } finally {
                this.removingAudio = false;
            }
        },
        clearPendingAudio() {
            this.pendingAudioBlob = null;
            this.pendingAudioDuration = 0;
            if (this.pendingAudioUrl) {
                URL.revokeObjectURL(this.pendingAudioUrl);
                this.pendingAudioUrl = null;
            }
        },
        async startRecording() {
            try {
                this.clearPendingAudio();
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
                    this.pendingAudioBlob = blob;
                    this.pendingAudioDuration = Math.max(1, Math.round(this.recordElapsedMs / 1000));
                    if (this.pendingAudioUrl) URL.revokeObjectURL(this.pendingAudioUrl);
                    this.pendingAudioUrl = URL.createObjectURL(blob);
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
        cleanupRecording(clearAudio = false) {
            if (this.isRecording) this.stopRecording();
            this.stopStream();
            if (this.recordTimer) {
                clearInterval(this.recordTimer);
                this.recordTimer = null;
            }
            if (clearAudio) this.clearPendingAudio();
        },
    },
};
</script>

<style scoped lang="scss">
.welcome-config {
    color: #ddd;
}

.hint {
    color: #aaa;
    font-size: 0.9rem;
    margin: 0.35rem 0 0;
    line-height: 1.45;
}

.hint-sm {
    margin: 0.45rem 0 0;
    font-size: 0.8rem;
    color: #888;
}

.field-label {
    display: block;
    margin-bottom: 0.4rem;
    font-size: 0.85rem;
    color: #aaa;
}

.media-block {
    border: 1px solid #2a2a2a;
    border-radius: 10px;
    padding: 0.85rem;
    background: #121212;
}

.media-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
}

.preview-img {
    margin-top: 0.75rem;
    max-width: min(100%, 280px);
    border-radius: 10px;
    border: 1px solid #333;
}

.preview-video {
    margin-top: 0.75rem;
    width: min(100%, 360px);
    border-radius: 10px;
    background: #000;
}

.preview-audio {
    margin-top: 0.65rem;
    width: min(100%, 280px);
    height: 36px;
}

.ok { color: #4ade80; }
.warn { color: #fbbf24; }
</style>
