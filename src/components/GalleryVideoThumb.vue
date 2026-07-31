<template>
    <div ref="root" class="gallery-thumb-video">
        <div v-if="!ready" class="gallery-video-skeleton">
            <Skeleton width="100%" height="100%" borderRadius="10px" />
        </div>
        <video
            ref="videoEl"
            muted
            playsinline
            preload="metadata"
            class="gallery-thumb-media"
            :class="{ 'is-ready': ready }"
            @loadedmetadata="onReady"
            @error="onError"
        />
        <i v-if="ready" class="fa-solid fa-play gallery-play-icon"></i>
    </div>
</template>

<script>
import Skeleton from 'primevue/skeleton';

export default {
    name: 'GalleryVideoThumb',
    components: { Skeleton },
    props: {
        url: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            shouldLoad: false,
            ready: false,
            observer: null,
        };
    },
    watch: {
        url() {
            this.unload();
            if (this.shouldLoad) this.$nextTick(() => this.loadSrc());
        },
        shouldLoad(load) {
            if (load) this.$nextTick(() => this.loadSrc());
            else this.unload();
        },
    },
    mounted() {
        this.observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry) return;
                this.shouldLoad = entry.isIntersecting;
            },
            {
                root: null,
                rootMargin: '240px 0px',
                threshold: 0.01,
            }
        );
        if (this.$refs.root) {
            this.observer.observe(this.$refs.root);
        }
    },
    beforeUnmount() {
        this.observer?.disconnect();
        this.observer = null;
        this.unload();
    },
    methods: {
        loadSrc() {
            const video = this.$refs.videoEl;
            if (!video || !this.url) return;
            if (video.getAttribute('src') === this.url) return;
            this.ready = false;
            video.src = this.url;
            video.load();
        },
        unload() {
            this.ready = false;
            const video = this.$refs.videoEl;
            if (!video) return;
            video.removeAttribute('src');
            video.load();
        },
        onReady() {
            this.ready = true;
        },
        onError() {
            this.ready = false;
        },
    },
};
</script>

<style scoped lang="scss">
.gallery-thumb-video {
    width: 100%;
    height: 100%;
    position: relative;
    background: #000;

    video {
        pointer-events: none;
        opacity: 0;

        &.is-ready {
            opacity: 1;
        }
    }
}

.gallery-video-skeleton {
    position: absolute;
    inset: 0;
    z-index: 1;

    :deep(.p-skeleton) {
        width: 100% !important;
        height: 100% !important;
        background: #1f1f1f;
    }
}

.gallery-thumb-media {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
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
    z-index: 2;
}
</style>
