<template>
    <Dialog
        :visible="visible"
        modal
        header="Comprar créditos do chat"
        :style="{ width: '32rem', maxWidth: '95vw' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <div class="checkout-body">
            <p class="intro">
                Escolha o tipo de pacote e a quantidade. Cada pacote dá
                <strong>{{ selectedCreditsPerPack }} envios</strong>. Os créditos não expiram.
            </p>

            <div class="type-grid">
                <button
                    type="button"
                    class="type-card"
                    :class="{ active: packageType === 'media', disabled: !mediaPrice }"
                    :disabled="!mediaPrice"
                    @click="packageType = 'media'"
                >
                    <i class="pi pi-images"></i>
                    <span class="type-title">Fotos / Vídeos</span>
                    <span class="type-meta">{{ creditsPerPack }} envios · {{ formatPrice(mediaPrice) }}</span>
                    <span class="type-balance">Seus créditos: {{ mediaCredits }}</span>
                </button>

                <button
                    type="button"
                    class="type-card"
                    :class="{ active: packageType === 'audio', disabled: !audioUnitPrice }"
                    :disabled="!audioUnitPrice"
                    @click="packageType = 'audio'"
                >
                    <i class="pi pi-microphone"></i>
                    <span class="type-title">Áudios</span>
                    <span class="type-meta">{{ audioCreditsPerPack }} envios · {{ formatPrice(audioUnitPrice) }}</span>
                    <span class="type-balance">Seus créditos: {{ audioCredits }}</span>
                </button>
            </div>

            <p v-if="!selectedPrice" class="warn">
                Este pacote ainda não foi configurado pela Rebeca.
            </p>

            <div v-else class="qty-row">
                <div>
                    <div class="qty-label">Quantidade de pacotes</div>
                    <div class="qty-hint">Mínimo 1 · sem limite prático</div>
                </div>
                <div class="qty-controls">
                    <button type="button" class="qty-btn" :disabled="quantity <= 1" @click="decQty">−</button>
                    <span class="qty-value">{{ quantity }}</span>
                    <button type="button" class="qty-btn" :disabled="quantity >= 99" @click="incQty">+</button>
                </div>
            </div>

            <div v-if="selectedPrice" class="summary">
                <div class="summary-line credits-highlight">
                    <span>Créditos neste pedido</span>
                    <strong>{{ totalCredits }}</strong>
                </div>
                <div class="summary-line total">
                    <span>Total</span>
                    <strong>{{ formatPrice(totalPrice) }}</strong>
                </div>
            </div>
        </div>

        <template #footer>
            <Botao texto="Cancelar" tipo="texto" tema="rosa" @click="$emit('update:visible', false)" />
            <Botao
                texto="Gerar pagamento"
                icone="pi pi-credit-card"
                tema="rosa"
                :carregando="loading"
                :desabilitado="!canPay"
                @click="gerarLink"
            />
        </template>
    </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import Botao from '@/components/ui/Botao.vue';

export default {
    name: 'ChatMediaUnlockDialog',
    components: { Dialog, Botao },
    props: {
        visible: Boolean,
        mediaCredits: { type: Number, default: 0 },
        audioCredits: { type: Number, default: 0 },
        creditsPerPack: { type: Number, default: 5 },
        audioCreditsPerPack: { type: Number, default: 5 },
        price: { type: [Number, String], default: null },
        audioPrice: { type: [Number, String], default: null },
        initialPackage: { type: String, default: 'media' },
    },
    emits: ['update:visible'],
    data() {
        return {
            loading: false,
            packageType: 'media',
            quantity: 1,
        };
    },
    computed: {
        mediaPrice() {
            const n = Number(this.price);
            return Number.isFinite(n) && n > 0 ? n : null;
        },
        audioUnitPrice() {
            const n = Number(this.audioPrice);
            return Number.isFinite(n) && n > 0 ? n : null;
        },
        selectedPrice() {
            return this.packageType === 'audio' ? this.audioUnitPrice : this.mediaPrice;
        },
        selectedCreditsPerPack() {
            return this.packageType === 'audio' ? this.audioCreditsPerPack : this.creditsPerPack;
        },
        totalCredits() {
            return this.selectedCreditsPerPack * this.quantity;
        },
        totalPrice() {
            return (this.selectedPrice || 0) * this.quantity;
        },
        canPay() {
            return Boolean(this.selectedPrice) && this.quantity >= 1;
        },
    },
    watch: {
        visible(val) {
            if (val) {
                this.quantity = 1;
                const preferred = this.initialPackage === 'audio' ? 'audio' : 'media';
                if (preferred === 'audio' && this.audioUnitPrice) {
                    this.packageType = 'audio';
                } else if (this.mediaPrice) {
                    this.packageType = 'media';
                } else if (this.audioUnitPrice) {
                    this.packageType = 'audio';
                } else {
                    this.packageType = preferred;
                }
            }
        },
    },
    methods: {
        formatPrice(value) {
            if (value == null) return '—';
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
        },
        incQty() {
            if (this.quantity < 99) this.quantity += 1;
        },
        decQty() {
            if (this.quantity > 1) this.quantity -= 1;
        },
        async gerarLink() {
            if (!this.canPay) return;
            this.loading = true;
            try {
                const { data } = await this.api.post('/chat/media-package/gerar-link', {
                    package_type: this.packageType,
                    quantity: this.quantity,
                });
                if (data.success && data.link) {
                    window.location.href = data.link;
                    return;
                }
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: data.message || 'Não foi possível gerar o link',
                    life: 3000,
                });
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Erro ao gerar pagamento',
                    life: 4000,
                });
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped lang="scss">
.checkout-body {
    color: #ddd;
    line-height: 1.5;
}

.intro {
    margin: 0 0 1rem;
}

.type-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.65rem;
    margin-bottom: 1rem;
}

.type-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    text-align: left;
    padding: 0.85rem;
    border-radius: 12px;
    border: 1px solid #333;
    background: #161616;
    color: #ccc;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;

    i {
        color: #f5cee1;
        font-size: 1.1rem;
        margin-bottom: 0.15rem;
    }

    &.active {
        border-color: #f5cee1;
        background: #1f1520;
    }

    &.disabled,
    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
}

.type-title {
    font-weight: 600;
    color: #fff;
}

.type-meta,
.type-balance {
    font-size: 0.8rem;
    color: #999;
}

.qty-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 0;
    border-top: 1px solid #2a2a2a;
}

.qty-label {
    font-weight: 600;
    color: #fff;
}

.qty-hint {
    font-size: 0.78rem;
    color: #888;
}

.qty-controls {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
}

.qty-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 1px solid #444;
    background: #1a1a1a;
    color: #fff;
    cursor: pointer;
    font-size: 1.1rem;
    line-height: 1;

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
}

.qty-value {
    min-width: 1.5rem;
    text-align: center;
    font-weight: 700;
    color: #fff;
}

.summary {
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid #2a2a2a;
}

.summary-line {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.4rem;
    color: #bbb;

    &.credits-highlight {
        color: #f5cee1;
        font-size: 1.15rem;
        font-weight: 600;
        margin-bottom: 0.65rem;

        strong {
            color: #f5cee1;
            font-size: 1.35rem;
            font-weight: 700;
        }
    }

    &.total {
        color: #fff;
        font-size: 1.05rem;
        margin-top: 0.35rem;
    }
}

.warn {
    color: #f5cee1;
}

@media (max-width: 520px) {
    .type-grid {
        grid-template-columns: 1fr;
    }
}
</style>
