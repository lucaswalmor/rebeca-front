<template>
    <Dialog
        :visible="visible"
        modal
        header="Galeria do chat"
        dismissableMask
        :style="{ width: 'min(92vw, 640px)' }"
        contentClass="chat-gallery-dialog-content"
        @update:visible="$emit('update:visible', $event)"
    >
        <div v-if="loading" class="gallery-state">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Carregando mídias...</span>
        </div>

        <div v-else-if="items.length === 0" class="gallery-state is-empty">
            Nenhuma foto ou vídeo nesta conversa.
        </div>

        <div v-else class="gallery-grid">
            <button
                v-for="item in items"
                :key="item.id"
                type="button"
                class="gallery-thumb"
                :title="item.type === 'video' ? 'Abrir vídeo' : 'Ampliar foto'"
                @click="openPreview(item)"
            >
                <img
                    v-if="item.type === 'image'"
                    :src="item.media_url"
                    alt="Mídia do chat"
                    class="gallery-thumb-media"
                    loading="lazy"
                />
                <template v-else>
                    <video
                        :src="item.media_url"
                        class="gallery-thumb-media"
                        muted
                        preload="metadata"
                        playsinline
                    />
                    <span class="gallery-play" aria-hidden="true">
                        <i class="pi pi-play"></i>
                    </span>
                </template>
            </button>
        </div>
    </Dialog>

    <Teleport to="body">
        <div
            v-if="showPreview && previewItem"
            class="chat-lightbox"
            @click.self="closePreview"
        >
            <button type="button" class="chat-lightbox-close" title="Fechar" @click="closePreview">
                <i class="pi pi-times"></i>
            </button>
            <img
                v-if="previewItem.type === 'image'"
                :src="previewItem.media_url"
                alt="Pré-visualização"
                class="chat-lightbox-img"
            />
            <video
                v-else
                :src="previewItem.media_url"
                class="chat-lightbox-img is-video"
                controls
                playsinline
                autoplay
            />
        </div>
    </Teleport>
</template>

<script>
import Dialog from 'primevue/dialog';

export default {
    name: 'ChatGalleryDialog',
    components: { Dialog },
    props: {
        visible: Boolean,
        conversationId: { type: [Number, String], default: null },
    },
    emits: ['update:visible'],
    data() {
        return {
            items: [],
            loading: false,
            showPreview: false,
            previewItem: null,
        };
    },
    watch: {
        visible(val) {
            if (val && this.conversationId) this.load();
            if (!val) this.closePreview();
        },
    },
    beforeUnmount() {
        this.closePreview();
    },
    methods: {
        async load() {
            this.loading = true;
            try {
                const { data } = await this.api.get(`/chat/conversations/${this.conversationId}/gallery`);
                this.items = data.data || data || [];
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Não foi possível carregar a galeria',
                    life: 3000,
                });
            } finally {
                this.loading = false;
            }
        },
        openPreview(item) {
            this.previewItem = item;
            this.showPreview = true;
            document.body.style.overflow = 'hidden';
        },
        closePreview() {
            this.showPreview = false;
            this.previewItem = null;
            document.body.style.overflow = '';
        },
    },
};
</script>

<style scoped lang="scss">
.gallery-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    min-height: 160px;
    color: #f5cee1;
    font-size: 0.95rem;

    &.is-empty {
        color: #999;
    }

    i {
        font-size: 1.6rem;
    }
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
    gap: 0.65rem;
}

.gallery-thumb {
    position: relative;
    aspect-ratio: 1;
    width: 100%;
    padding: 0;
    border: 1px solid rgba(245, 206, 225, 0.18);
    border-radius: 10px;
    overflow: hidden;
    background: #121212;
    cursor: zoom-in;
    line-height: 0;
    transition: transform 0.18s ease, border-color 0.18s ease;

    &:hover {
        transform: translateY(-1px);
        border-color: #f5cee1;
    }
}

.gallery-thumb-media {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}

.gallery-play {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(0, 0, 0, 0.35);
    color: #f5cee1;
    font-size: 1.25rem;
    pointer-events: none;
}
</style>

<style lang="scss">
.chat-gallery-dialog-content {
    background: #0d0d0d !important;
    max-height: min(70vh, 560px);
    overflow-y: auto;
}

.chat-lightbox .is-video {
    width: min(96vw, 1200px);
    max-height: 90vh;
    background: #000;
}
</style>
