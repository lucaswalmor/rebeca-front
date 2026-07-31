<template>
    <Card class="mb-2">
        <template #content>
            <div v-if="loading" class="gallery-grid">
                <div
                    v-for="n in skeletonCount"
                    :key="`skeleton-${n}`"
                    class="gallery-thumb gallery-skeleton-wrap"
                >
                    <Skeleton width="100%" height="100%" borderRadius="10px" />
                </div>
            </div>

            <div v-else-if="gridItems.length === 0" class="text-center p-5">
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

    <!-- Lightbox fullscreen (custom: Gallery do PrimeVue não dimensiona vídeo corretamente) -->
    <Teleport to="body">
        <div
            v-if="lightboxOpen"
            class="posts-lightbox"
            :class="{ 'is-visible': lightboxVisible }"
            @keydown.esc="closeLightbox"
        >
            <button type="button" class="posts-lightbox-close" title="Fechar" @click="closeLightbox">
                <i class="pi pi-times"></i>
            </button>

            <button
                v-if="lightboxItems.length > 1"
                type="button"
                class="posts-lightbox-nav is-prev"
                title="Anterior"
                @click="lightboxPrev"
            >
                <i class="pi pi-chevron-left"></i>
            </button>

            <div class="posts-lightbox-stage" @click.self="closeLightbox">
                <template v-if="currentLightboxItem">
                    <img
                        v-if="currentLightboxItem.tipo === 'image'"
                        :key="`img-${currentLightboxItem.key}`"
                        :src="currentLightboxItem.url"
                        :alt="currentLightboxItem.alt || 'Mídia'"
                        class="posts-lightbox-media"
                    />
                    <video
                        v-else
                        :key="`video-${currentLightboxItem.key}`"
                        :src="currentLightboxItem.url"
                        class="posts-lightbox-media is-video"
                        controls
                        playsinline
                        autoplay
                    />
                </template>
            </div>

            <button
                v-if="lightboxItems.length > 1"
                type="button"
                class="posts-lightbox-nav is-next"
                title="Próximo"
                @click="lightboxNext"
            >
                <i class="pi pi-chevron-right"></i>
            </button>

            <div v-if="lightboxItems.length > 1" class="posts-lightbox-thumbs">
                <button
                    v-for="(item, index) in lightboxItems"
                    :key="`lb-thumb-${item.key}`"
                    type="button"
                    class="posts-lightbox-thumb"
                    :class="{ 'is-active': index === lightboxIndex }"
                    @click="lightboxIndex = index"
                >
                    <img
                        v-if="item.tipo === 'image'"
                        :src="item.url"
                        alt=""
                        draggable="false"
                    />
                    <div v-else class="posts-lightbox-thumb-video">
                        <i class="fa-solid fa-film"></i>
                    </div>
                </button>
            </div>
        </div>
    </Teleport>

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
import { storeToRefs } from 'pinia';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Skeleton from 'primevue/skeleton';
import Botao from '@/components/ui/Botao.vue';
import { useAuthStore } from '@/stores/auth';

export default {
    name: 'PostsGaleria',
    components: {
        Card,
        Dialog,
        Skeleton,
        Botao,
    },
    props: {
        active: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const authStore = useAuthStore();
        const { updateTrigger } = storeToRefs(authStore);
        return { updateTrigger };
    },
    data() {
        return {
            posts: [],
            loading: false,
            loadedOnce: false,
            skeletonCount: 12,
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

            (this.posts || []).forEach((post) => {
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
        currentLightboxItem() {
            return this.lightboxItems[this.lightboxIndex] || null;
        },
    },
    watch: {
        active: {
            immediate: true,
            handler(isActive) {
                if (isActive) {
                    this.ensureLoaded();
                }
            },
        },
        updateTrigger() {
            // Login/logout muda o acesso: invalida cache e recarrega se a aba estiver aberta
            this.loadedOnce = false;
            this.posts = [];
            if (this.active) {
                this.ensureLoaded();
            }
        },
        lightboxOpen(isOpen) {
            document.body.style.overflow = isOpen ? 'hidden' : '';
            if (isOpen) {
                window.addEventListener('keydown', this.onLightboxKeydown);
            } else {
                window.removeEventListener('keydown', this.onLightboxKeydown);
            }
        },
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.onLightboxKeydown);
        document.body.style.overflow = '';
    },
    methods: {
        async ensureLoaded() {
            if (this.loadedOnce || this.loading) return;
            await this.fetchGallery();
        },
        async fetchGallery() {
            this.loading = true;
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const isAdminUser = user.is_admin === true || user.is_admin === 'true' || user.is_admin === 1;
                let url = isAdminUser ? '/posts/admin/all' : '/posts';
                const params = new URLSearchParams();
                params.append('page', '1');
                params.append('per_page', '200');
                url += '?' + params.toString();

                const response = await this.api.get(url);
                this.posts = response.data.data || [];
                this.loadedOnce = true;
            } catch (error) {
                console.error('Erro ao carregar galeria:', error);
                this.$toast?.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar a galeria',
                    life: 3000,
                });
            } finally {
                this.loading = false;
            }
        },
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
        lightboxPrev() {
            const total = this.lightboxItems.length;
            if (total <= 1) return;
            this.lightboxIndex = (this.lightboxIndex - 1 + total) % total;
        },
        lightboxNext() {
            const total = this.lightboxItems.length;
            if (total <= 1) return;
            this.lightboxIndex = (this.lightboxIndex + 1) % total;
        },
        onLightboxKeydown(event) {
            if (!this.lightboxOpen) return;
            if (event.key === 'Escape') this.closeLightbox();
            if (event.key === 'ArrowLeft') this.lightboxPrev();
            if (event.key === 'ArrowRight') this.lightboxNext();
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

.gallery-skeleton-wrap {
    cursor: default;
    pointer-events: none;

    &:hover {
        opacity: 1;
    }

    :deep(.p-skeleton) {
        width: 100% !important;
        height: 100% !important;
        background: #1f1f1f;
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

    video {
        pointer-events: none;
    }
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

.posts-lightbox {
    position: fixed;
    inset: 0;
    z-index: 12000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.92);
    opacity: 0;
    transition: opacity 0.2s ease;

    &.is-visible {
        opacity: 1;
    }
}

.posts-lightbox-close,
.posts-lightbox-nav {
    position: absolute;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
        background: rgba(245, 206, 225, 0.28);
        color: #f5cee1;
    }
}

.posts-lightbox-close {
    top: 1rem;
    right: 1rem;
}

.posts-lightbox-nav {
    top: 50%;
    transform: translateY(-50%);

    &.is-prev {
        left: 0.75rem;
    }

    &.is-next {
        right: 0.75rem;
    }
}

.posts-lightbox-stage {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem 4.5rem 1rem;
    min-height: 0;
}

.posts-lightbox-media {
    max-width: min(92vw, 1100px);
    max-height: min(78vh, calc(100vh - 10rem));
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 4px;

    &.is-video {
        width: min(96vw, 1200px);
        max-height: min(78vh, calc(100vh - 10rem));
        background: #000;
    }
}

.posts-lightbox-thumbs {
    display: flex;
    gap: 0.5rem;
    max-width: min(96vw, 900px);
    overflow-x: auto;
    padding: 0.75rem 1rem 1.25rem;
    scrollbar-width: thin;
}

.posts-lightbox-thumb {
    flex: 0 0 auto;
    width: 3.25rem;
    height: 3.25rem;
    padding: 0;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    background: #1a1a1a;
    cursor: pointer;
    line-height: 0;

    &.is-active {
        border-color: #f5cee1;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
}

.posts-lightbox-thumb-video {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: #f5cee1;
    background: #1a1a1a;
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
