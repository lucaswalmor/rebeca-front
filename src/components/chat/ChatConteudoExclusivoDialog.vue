<template>
    <Dialog
        :visible="visible"
        modal
        header="Conteúdo exclusivo"
        :style="{ width: '30rem', maxWidth: '95vw' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <div class="exclusive-body">
            <p class="lead">
                Peça uma imagem ou um vídeo feito sob encomenda pra Beca.
            </p>
            <p class="sub">
                Depois do pagamento, combinem o envio aqui no chat.
            </p>

            <div class="type-grid">
                <button
                    type="button"
                    class="type-card"
                    :class="{ active: tipo === 'image', disabled: !imagePrice }"
                    :disabled="!imagePrice"
                    @click="tipo = 'image'"
                >
                    <i class="pi pi-image"></i>
                    <span class="type-title">Imagem exclusiva</span>
                    <span class="type-price">{{ formatPrice(imagePrice) }}</span>
                </button>

                <button
                    type="button"
                    class="type-card"
                    :class="{ active: tipo === 'video', disabled: !videoPrice }"
                    :disabled="!videoPrice"
                    @click="tipo = 'video'"
                >
                    <i class="pi pi-video"></i>
                    <span class="type-title">Vídeo exclusivo</span>
                    <span class="type-price">{{ formatPrice(videoPrice) }}</span>
                    <span class="type-note">Duração máxima: 1 minuto</span>
                </button>
            </div>

            <p v-if="tipo === 'video'" class="video-hint">
                O vídeo exclusivo tem até <strong>1 minuto</strong> de duração.
            </p>

            <p v-if="!imagePrice && !videoPrice" class="empty-hint">
                Os valores ainda não foram configurados pela Beca.
            </p>
        </div>

        <template #footer>
            <Botao texto="Cancelar" tipo="texto" tema="amarelo" @click="$emit('update:visible', false)" />
            <Botao
                texto="Comprar e combinar"
                icone="pi pi-star"
                tema="amarelo"
                :carregando="loading"
                :desabilitado="!canBuy"
                @click="confirmar"
            />
        </template>
    </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import Botao from '@/components/ui/Botao.vue';

export default {
    name: 'ChatConteudoExclusivoDialog',
    components: { Dialog, Botao },
    props: {
        visible: Boolean,
        conversationId: { type: [Number, String], required: true },
        imagePrice: { type: [Number, String], default: null },
        videoPrice: { type: [Number, String], default: null },
    },
    emits: ['update:visible'],
    data() {
        return {
            loading: false,
            tipo: 'image',
        };
    },
    computed: {
        canBuy() {
            if (this.tipo === 'video') return Number(this.videoPrice) >= 1.01;
            return Number(this.imagePrice) >= 1.01;
        },
    },
    watch: {
        visible(val) {
            if (!val) return;
            if (Number(this.imagePrice) >= 1.01) this.tipo = 'image';
            else if (Number(this.videoPrice) >= 1.01) this.tipo = 'video';
            else this.tipo = 'image';
        },
    },
    methods: {
        formatPrice(value) {
            const n = Number(value);
            if (!Number.isFinite(n) || n <= 0) return 'Indisponível';
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(n);
        },
        async confirmar() {
            if (!this.canBuy) return;

            this.loading = true;
            try {
                const { data } = await this.api.post(
                    `/chat/conversations/${this.conversationId}/conteudo-exclusivo`,
                    { tipo: this.tipo }
                );

                if (!data?.link) {
                    throw new Error(data?.message || 'Link de pagamento não gerado');
                }

                window.location.href = data.link;
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || e.message || 'Não foi possível gerar o pedido',
                    life: 4000,
                });
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped lang="scss">
.exclusive-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    color: #ddd;
}

.lead {
    margin: 0;
    font-size: 1.02rem;
    font-weight: 600;
    color: #fef3c7;
    line-height: 1.35;
}

.sub {
    margin: 0;
    font-size: 0.88rem;
    color: #aaa;
    line-height: 1.45;
}

.type-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.7rem;
    margin-top: 0.25rem;
}

.type-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    padding: 0.95rem 0.7rem;
    border-radius: 12px;
    border: 1px solid #333;
    background: #161616;
    color: #ddd;
    cursor: pointer;
    text-align: center;
    transition: border-color 0.15s ease, background 0.15s ease;

    i {
        font-size: 1.35rem;
        color: #fbbf24;
    }

    &.active {
        border-color: #fbbf24;
        background: rgba(251, 191, 36, 0.1);
    }

    &.disabled,
    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
}

.type-title {
    font-size: 0.85rem;
    font-weight: 600;
}

.type-price {
    font-size: 0.95rem;
    font-weight: 700;
    color: #fde68a;
}

.type-note {
    font-size: 0.72rem;
    color: #999;
}

.video-hint {
    margin: 0;
    font-size: 0.84rem;
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.08);
    border: 1px solid rgba(251, 191, 36, 0.25);
    border-radius: 8px;
    padding: 0.55rem 0.7rem;
}

.empty-hint {
    margin: 0;
    font-size: 0.85rem;
    color: #f87171;
}

@media (max-width: 520px) {
    .type-grid {
        grid-template-columns: 1fr;
    }
}
</style>
