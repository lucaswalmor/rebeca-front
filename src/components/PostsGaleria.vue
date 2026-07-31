<template>
    <Card class="mb-2">
        <template #content>
            <div v-if="gridItems.length === 0" class="text-center p-5">
                <i class="fa-solid fa-images fa-3x text-white mb-3" style="opacity: 0.5;"></i>
                <p class="text-white">Ainda não há mídias na galeria.</p>
            </div>

            <div v-else class="gallery-grid">
                <div
                    v-for="(item, index) in gridItems"
                    :key="item.key"
                    class="gallery-thumb"
                    @click="onThumbClick(item, index)"
                >
                    <template v-if="item.kind === 'media'">
                        <img
                            v-if="item.tipo === 'image'"
                            :src="item.url"
                            :alt="item.alt"
                            class="gallery-thumb-media"
                            loading="lazy"
                        />
                        <div v-else class="gallery-thumb-video">
                            <video
                                :src="item.url"
                                muted
                                preload="metadata"
                                class="gallery-thumb-media"
                            />
                            <i class="fa-solid fa-play gallery-play-icon"></i>
                        </div>
                    </template>
                    <div v-else class="gallery-thumb-locked">
                        <i class="fa-solid fa-lock"></i>
                    </div>
                </div>
            </div>
        </template>
    </Card>

    <!-- Lightbox PrimeVue Gallery (apenas mídias liberadas) -->
    <Gallery
        v-if="lightboxOpen"
        fullscreen
        v-model:activeIndex="lightboxIndex"
        class="posts-gallery-lightbox"
        :class="lightboxVisible ? 'is-visible' : 'is-hidden'"
        @update:fullscreen="onFullscreenChange"
    >
        <GalleryBackdrop />
        <GalleryPrev>
            <ChevronLeft />
        </GalleryPrev>
        <GalleryNext>
            <ChevronRight />
        </GalleryNext>
        <GalleryHeader class="justify-end gap-0.5">
            <GalleryZoomIn>
                <SearchPlus />
            </GalleryZoomIn>
            <GalleryZoomOut>
                <SearchMinus />
            </GalleryZoomOut>
            <button type="button" class="p-gallery-action" @click="closeLightbox">
                <Times />
            </button>
        </GalleryHeader>
        <GalleryContent>
            <GalleryItem v-for="(item, index) in lightboxItems" :key="item.key">
                <img
                    v-if="item.tipo === 'image'"
                    :src="item.url"
                    :alt="item.alt || `imagem-${index + 1}`"
                    class="lightbox-media"
                    :class="lightboxVisible ? 'is-ready' : 'is-entering'"
                />
                <video
                    v-else
                    :src="item.url"
                    controls
                    class="lightbox-media lightbox-video"
                    :class="lightboxVisible ? 'is-ready' : 'is-entering'"
                />
            </GalleryItem>
        </GalleryContent>
        <GalleryFooter>
            <GalleryThumbnail>
                <GalleryThumbnailContent>
                    <GalleryThumbnailItem
                        v-for="(item, index) in lightboxItems"
                        :key="`thumb-${item.key}`"
                        :index="index"
                    >
                        <img
                            v-if="item.tipo === 'image'"
                            draggable="false"
                            :src="item.url"
                            class="h-full w-full object-cover"
                        />
                        <div v-else class="thumb-video-placeholder">
                            <i class="fa-solid fa-film"></i>
                        </div>
                    </GalleryThumbnailItem>
                </GalleryThumbnailContent>
            </GalleryThumbnail>
        </GalleryFooter>
    </Gallery>

    <!-- Modal de conteúdo bloqueado -->
    <Dialog
        v-model:visible="unlockDialogVisible"
        modal
        header="Conteúdo exclusivo"
        :style="{ width: 'min(92vw, 28rem)' }"
        :pt="{
            root: { class: 'unlock-dialog' },
            header: { style: { background: '#121212', color: '#fff', borderBottom: '1px solid #2a2a2a' } },
            content: { style: { background: '#121212' } },
            headerActions: { style: { color: '#f5cee1' } }
        }"
    >
        <div v-if="lockedPost" class="unlock-panel">
            <i class="fa-solid fa-lock unlock-lock"></i>

            <template v-if="lockedNeedsSubscription">
                <p class="unlock-title">Este conteúdo é exclusivo para assinantes</p>
                <p class="unlock-message">Assine agora para ver a prévia e desbloquear conteúdos</p>
            </template>
            <template v-else>
                <p class="unlock-title">Clique em desbloquear para liberar o conteúdo</p>
                <div class="unlock-meta">
                    <span v-if="lockedPost.media_count">
                        <i class="fa-solid fa-film me-1"></i>{{ lockedPost.media_count }}
                    </span>
                    <span class="unlock-price">{{ formatPreco(lockedPost.preco) }}</span>
                </div>
                <Botao
                    :texto="`Desbloquear conteúdo — ${formatPreco(lockedPost.preco)}`"
                    icone="pi pi-lock-open"
                    tema="rosa"
                    :bloco="true"
                    :carregando="buyingPostId === lockedPost.id"
                    @click="comprarPost(lockedPost)"
                />
            </template>
        </div>
    </Dialog>
</template>

<script>
import { nextTick } from 'vue';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Gallery from 'primevue/gallery';
import GalleryBackdrop from 'primevue/gallerybackdrop';
import GalleryContent from 'primevue/gallerycontent';
import GalleryItem from 'primevue/galleryitem';
import GalleryPrev from 'primevue/galleryprev';
import GalleryNext from 'primevue/gallerynext';
import GalleryHeader from 'primevue/galleryheader';
import GalleryFooter from 'primevue/galleryfooter';
import GalleryThumbnail from 'primevue/gallerythumbnail';
import GalleryThumbnailContent from 'primevue/gallerythumbnailcontent';
import GalleryThumbnailItem from 'primevue/gallerythumbnailitem';
import GalleryZoomIn from 'primevue/galleryzoomin';
import GalleryZoomOut from 'primevue/galleryzoomout';
import ChevronLeft from '@primeicons/vue/chevron-left';
import ChevronRight from '@primeicons/vue/chevron-right';
import SearchMinus from '@primeicons/vue/search-minus';
import SearchPlus from '@primeicons/vue/search-plus';
import Times from '@primeicons/vue/times';
import Botao from '@/components/ui/Botao.vue';

export default {
    name: 'PostsGaleria',
    components: {
        Card,
        Dialog,
        Botao,
        Gallery,
        GalleryBackdrop,
        GalleryContent,
        GalleryItem,
        GalleryPrev,
        GalleryNext,
        GalleryHeader,
        GalleryFooter,
        GalleryThumbnail,
        GalleryThumbnailContent,
        GalleryThumbnailItem,
        GalleryZoomIn,
        GalleryZoomOut,
        ChevronLeft,
        ChevronRight,
        SearchMinus,
        SearchPlus,
        Times,
    },
    props: {
        conteudos: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            lightboxOpen: false,
            lightboxVisible: false,
            lightboxIndex: 0,
            unlockDialogVisible: false,
            lockedPost: null,
            lockedNeedsSubscription: false,
            buyingPostId: null,
        };
    },
    computed: {
        isAdmin() {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.is_admin === true || user.is_admin === 'true' || user.is_admin === 1;
        },
        gridItems() {
            const items = [];

            (this.conteudos || []).forEach((post) => {
                if (!post) return;

                if (this.hasFullAccess(post)) {
                    this.normalizeMedia(this.getFullMedia(post)).forEach((media, idx) => {
                        items.push({
                            key: `media-${post.id}-${idx}-${media.url}`,
                            kind: 'media',
                            ...media,
                            post,
                        });
                    });
                    return;
                }

                if (post.has_preview_access) {
                    this.normalizeMedia(post.media || []).forEach((media, idx) => {
                        items.push({
                            key: `preview-${post.id}-${idx}-${media.url}`,
                            kind: 'media',
                            ...media,
                            post,
                        });
                    });
                    items.push({
                        key: `locked-${post.id}`,
                        kind: 'locked',
                        post,
                        needsSubscription: false,
                    });
                    return;
                }

                items.push({
                    key: `locked-${post.id}`,
                    kind: 'locked',
                    post,
                    needsSubscription: true,
                });
            });

            return items;
        },
        lightboxItems() {
            return this.gridItems.filter((item) => item.kind === 'media');
        },
    },
    methods: {
        hasFullAccess(post) {
            if (this.isAdmin) return true;
            return post.has_full_access === true || post.is_locked === false;
        },
        getFullMedia(post) {
            const media = post.media || post.image || [];
            if ((!media || media.length === 0) && post.preview) {
                return Array.isArray(post.preview) ? post.preview : [post.preview];
            }
            return media;
        },
        normalizeMedia(media) {
            if (!media || media.length === 0) return [];

            if (typeof media[0] === 'string') {
                return media.map((url, index) => ({
                    url,
                    tipo: 'image',
                    alt: `Mídia ${index + 1}`,
                }));
            }

            return media.map((item, index) => ({
                url: item.url || item,
                tipo: item.tipo || 'image',
                alt: item.alt || `Mídia ${index + 1}`,
            }));
        },
        formatPreco(preco) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(Number(preco || 0));
        },
        onThumbClick(item) {
            if (item.kind === 'locked') {
                this.openUnlockDialog(item);
                return;
            }

            const lightboxIndex = this.lightboxItems.findIndex((m) => m.key === item.key);
            if (lightboxIndex >= 0) {
                this.openLightbox(lightboxIndex);
            }
        },
        openUnlockDialog(item) {
            this.lockedPost = item.post;
            this.lockedNeedsSubscription = item.needsSubscription === true;
            this.unlockDialogVisible = true;
        },
        openLightbox(index) {
            this.lightboxIndex = index;
            this.lightboxOpen = true;
            nextTick(() => {
                requestAnimationFrame(() => {
                    this.lightboxVisible = true;
                });
            });
        },
        closeLightbox() {
            if (!this.lightboxOpen) return;
            this.lightboxVisible = false;
            setTimeout(() => {
                this.lightboxOpen = false;
            }, 200);
        },
        onFullscreenChange(value) {
            if (!value) this.closeLightbox();
        },
        async comprarPost(post) {
            if (!post?.id || this.isAdmin) return;

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const isLoggedIn = !!localStorage.getItem('token') && !!user.id;
            const hasAssinatura = user.assinatura === true || user.assinatura === 'true' || user.assinatura === 1;
            const status = user.status_assinatura;

            if (!isLoggedIn) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Login necessário',
                    detail: 'Faça login para comprar este conteúdo',
                    life: 3000,
                });
                return;
            }

            if (!hasAssinatura || status !== 'aprovado') {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Assinatura necessária',
                    detail: 'Você precisa de uma assinatura ativa para comprar conteúdos',
                    life: 3000,
                });
                return;
            }

            try {
                this.buyingPostId = post.id;
                const response = await this.api.post(`/posts/${post.id}/comprar`);
                if (response.data.success && response.data.link) {
                    window.location.href = response.data.link;
                } else {
                    throw new Error(response.data.message || 'Não foi possível gerar o link de pagamento');
                }
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.response?.data?.message || error.message || 'Erro ao iniciar compra',
                    life: 4000,
                });
            } finally {
                this.buyingPostId = null;
            }
        },
    },
};
</script>

<style scoped lang="scss">
:deep(.p-card-body),
:deep(.p-card-content) {
    background-color: #121212;
    border-radius: 10px;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
}

@media (min-width: 768px) {
    .gallery-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 0.65rem;
    }
}

@media (min-width: 1200px) {
    .gallery-grid {
        grid-template-columns: repeat(5, 1fr);
    }
}

.gallery-thumb {
    aspect-ratio: 1;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    background: #000;
    position: relative;
    transition: opacity 0.2s ease;

    &:hover {
        opacity: 0.85;
    }
}

.gallery-thumb-media {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.gallery-thumb-video {
    width: 100%;
    height: 100%;
    position: relative;
}

.gallery-play-icon {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f5cee1;
    font-size: 1.1rem;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
    pointer-events: none;
}

.gallery-thumb-locked {
    width: 100%;
    height: 100%;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f5cee1;
    font-size: 1.5rem;
}

.posts-gallery-lightbox {
    transition: opacity 0.2s ease;

    &.is-visible {
        opacity: 1;
    }

    &.is-hidden {
        opacity: 0;
    }
}

.lightbox-media {
    max-width: min(92vw, 1100px);
    max-height: 75vh;
    object-fit: contain;
    transition: transform 0.3s ease, filter 0.3s ease;

    &.is-entering {
        transform: scale(0.9);
        filter: blur(12px);
    }

    &.is-ready {
        transform: scale(1);
        filter: blur(0);
    }
}

.lightbox-video {
    background: #000;
}

.thumb-video-placeholder {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    background: #1a1a1a;
    color: #f5cee1;
}

.unlock-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.5rem 0.25rem 0.75rem;
    text-align: center;
}

.unlock-lock {
    font-size: 2.25rem;
    color: #f5cee1;
}

.unlock-title {
    margin: 0;
    color: #fff;
    font-weight: 700;
    font-size: 1rem;
}

.unlock-message {
    margin: 0;
    color: #999;
    font-size: 0.9rem;
}

.unlock-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #fff;
    font-size: 0.95rem;
}

.unlock-price {
    font-weight: 700;
    color: #f5cee1;
}
</style>
