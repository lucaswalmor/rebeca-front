<template>
    <div class="chat-config">
        <div class="col-md-12 text-300 mb-3">
            <h4>Configurar chat</h4>
            <p class="hint">
                Defina o valor do pacote de mídia e os fundos da conversa. O sistema usa o wallpaper
                de computador no desktop e o de celular no mobile — para você e para os assinantes.
            </p>
        </div>

        <div class="col-md-12 mb-4">
            <IftaLabel>
                <InputText
                    id="pacote_midia_chat"
                    v-mask="['R$ #,##', 'R$ ##,##', 'R$ ###,##', 'R$ ####,##']"
                    v-model="dados.pacote_midia_chat"
                    class="w-full"
                    size="small"
                />
                <label for="pacote_midia_chat">Pacote chat (5 envios foto/vídeo)</label>
            </IftaLabel>
        </div>

        <div class="row g-3">
            <div class="col-md-6">
                <div class="wallpaper-card">
                    <div class="wallpaper-title">
                        <i class="pi pi-desktop"></i>
                        <span>Wallpaper computador</span>
                    </div>
                    <div class="wallpaper-preview" :style="desktopPreviewStyle">
                        <span v-if="!desktopPreviewUrl" class="placeholder">Sem imagem</span>
                    </div>
                    <input
                        ref="desktopInput"
                        type="file"
                        class="hidden-file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        @change="onDesktopSelected"
                    />
                    <div class="wallpaper-actions">
                        <Button
                            label="Escolher imagem"
                            icon="pi pi-upload"
                            size="small"
                            :loading="uploadingDesktop"
                            @click="$refs.desktopInput.click()"
                        />
                        <Button
                            v-if="dados.wallpaper_desktop"
                            label="Remover"
                            icon="pi pi-trash"
                            severity="secondary"
                            text
                            size="small"
                            :loading="removingDesktop"
                            @click="removeWallpaper('desktop')"
                        />
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="wallpaper-card">
                    <div class="wallpaper-title">
                        <i class="pi pi-mobile"></i>
                        <span>Wallpaper celular</span>
                    </div>
                    <div class="wallpaper-preview is-mobile" :style="mobilePreviewStyle">
                        <span v-if="!mobilePreviewUrl" class="placeholder">Sem imagem</span>
                    </div>
                    <input
                        ref="mobileInput"
                        type="file"
                        class="hidden-file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        @change="onMobileSelected"
                    />
                    <div class="wallpaper-actions">
                        <Button
                            label="Escolher imagem"
                            icon="pi pi-upload"
                            size="small"
                            :loading="uploadingMobile"
                            @click="$refs.mobileInput.click()"
                        />
                        <Button
                            v-if="dados.wallpaper_mobile"
                            label="Remover"
                            icon="pi pi-trash"
                            severity="secondary"
                            text
                            size="small"
                            :loading="removingMobile"
                            @click="removeWallpaper('mobile')"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import IftaLabel from 'primevue/iftalabel';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

export default {
    name: 'ChatConfigForm',
    components: {
        IftaLabel,
        InputText,
        Button,
    },
    props: {
        userId: { type: [Number, String], default: null },
    },
    data() {
        return {
            dados: {
                pacote_midia_chat: 'R$ 0,00',
                wallpaper_desktop: null,
                wallpaper_mobile: null,
            },
            desktopLocalPreview: null,
            mobileLocalPreview: null,
            uploadingDesktop: false,
            uploadingMobile: false,
            removingDesktop: false,
            removingMobile: false,
        };
    },
    computed: {
        desktopPreviewUrl() {
            return this.desktopLocalPreview || this.dados.wallpaper_desktop;
        },
        mobilePreviewUrl() {
            return this.mobileLocalPreview || this.dados.wallpaper_mobile;
        },
        desktopPreviewStyle() {
            if (!this.desktopPreviewUrl) return {};
            return {
                backgroundImage: `url("${this.desktopPreviewUrl}")`,
            };
        },
        mobilePreviewStyle() {
            if (!this.mobilePreviewUrl) return {};
            return {
                backgroundImage: `url("${this.mobilePreviewUrl}")`,
            };
        },
    },
    beforeUnmount() {
        this.revokeLocal('desktop');
        this.revokeLocal('mobile');
    },
    methods: {
        dadosChat() {
            return this.dados;
        },
        preencherDados(dados) {
            this.dados = { ...this.dados, ...dados };
        },
        revokeLocal(type) {
            const key = type === 'desktop' ? 'desktopLocalPreview' : 'mobileLocalPreview';
            if (this[key]) {
                URL.revokeObjectURL(this[key]);
                this[key] = null;
            }
        },
        async onDesktopSelected(event) {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            await this.uploadWallpaper('desktop', file);
        },
        async onMobileSelected(event) {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            await this.uploadWallpaper('mobile', file);
        },
        async uploadWallpaper(type, file) {
            if (!this.userId) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Usuário não encontrado',
                    life: 3000,
                });
                return;
            }

            const loadingKey = type === 'desktop' ? 'uploadingDesktop' : 'uploadingMobile';
            const localKey = type === 'desktop' ? 'desktopLocalPreview' : 'mobileLocalPreview';
            const field = type === 'desktop' ? 'wallpaper_desktop' : 'wallpaper_mobile';

            this.revokeLocal(type);
            this[localKey] = URL.createObjectURL(file);
            this[loadingKey] = true;

            try {
                const form = new FormData();
                form.append('wallpaper', file);
                form.append('type', type);

                const { data } = await this.api.post(
                    `/users/${this.userId}/upload-chat-wallpaper`,
                    form,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );

                this.dados[field] = data.url;
                this.revokeLocal(type);
                this.$toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: type === 'desktop'
                        ? 'Wallpaper de computador atualizado'
                        : 'Wallpaper de celular atualizado',
                    life: 3000,
                });
            } catch (e) {
                this.revokeLocal(type);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Falha no upload do wallpaper',
                    life: 4000,
                });
            } finally {
                this[loadingKey] = false;
            }
        },
        async removeWallpaper(type) {
            if (!this.userId) return;
            const loadingKey = type === 'desktop' ? 'removingDesktop' : 'removingMobile';
            const field = type === 'desktop' ? 'wallpaper_desktop' : 'wallpaper_mobile';
            this[loadingKey] = true;
            try {
                const { data } = await this.api.delete(
                    `/users/${this.userId}/chat-wallpaper/${type}`
                );
                this.dados[field] = null;
                this.revokeLocal(type);
                this.$toast.add({
                    severity: 'success',
                    summary: 'Removido',
                    detail: data.message || 'Wallpaper removido',
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
    },
};
</script>

<style scoped lang="scss">
.hint {
    color: #999;
    font-size: 0.9rem;
    margin: 0.35rem 0 0;
    line-height: 1.45;
}

.wallpaper-card {
    background: #121212;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 1rem;
}

.wallpaper-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #f5cee1;
    margin-bottom: 0.75rem;
    font-weight: 600;
}

.wallpaper-preview {
    width: 100%;
    aspect-ratio: 16 / 10;
    border-radius: 10px;
    background: #0d0d0d center / cover no-repeat;
    border: 1px dashed #333;
    display: grid;
    place-items: center;
    margin-bottom: 0.75rem;

    &.is-mobile {
        aspect-ratio: 9 / 16;
        max-width: 220px;
        margin-left: auto;
        margin-right: auto;
    }
}

.placeholder {
    color: #666;
    font-size: 0.85rem;
}

.wallpaper-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
}

.hidden-file {
    display: none;
}
</style>
