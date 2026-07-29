<template>
    <Dialog
        :visible="visible"
        modal
        header="Galeria do chat"
        :style="{ width: '90vw', maxWidth: '720px' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <div v-if="loading" class="text-center p-4">
            <i class="pi pi-spin pi-spinner text-2xl" style="color:#f5cee1"></i>
        </div>
        <div v-else-if="items.length === 0" class="text-center text-color-secondary p-4">
            Nenhuma foto ou vídeo nesta conversa.
        </div>
        <div v-else class="gallery-grid">
            <div v-for="item in items" :key="item.id" class="gallery-item">
                <Image
                    v-if="item.type === 'image'"
                    :src="item.media_url"
                    preview
                    imageClass="gallery-media"
                />
                <video v-else :src="item.media_url" controls class="gallery-media" />
            </div>
        </div>
    </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import Image from 'primevue/image';

export default {
    name: 'ChatGalleryDialog',
    components: { Dialog, Image },
    props: {
        visible: Boolean,
        conversationId: { type: [Number, String], default: null },
    },
    emits: ['update:visible'],
    data() {
        return { items: [], loading: false };
    },
    watch: {
        visible(val) {
            if (val && this.conversationId) this.load();
        },
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
    },
};
</script>

<style scoped lang="scss">
.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
}

.gallery-media {
    width: 100%;
    height: 140px;
    object-fit: cover;
    border-radius: 8px;
    background: #1a1a1a;
}
</style>
