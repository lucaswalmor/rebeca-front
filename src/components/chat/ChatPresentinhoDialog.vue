<template>
    <Dialog
        :visible="visible"
        modal
        header="Presentinho"
        :style="{ width: '28rem', maxWidth: '95vw' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <div class="gift-body">
            <div class="gift-icon" aria-hidden="true">
                <i class="pi pi-gift"></i>
            </div>
            <p class="gift-lead">
                Quer deixar um presentinho especial pra Beca?
            </p>
            <p class="gift-sub">
                Escolha um valor com carinho — cada gesto faz a diferença e ela vai ficar muito feliz.
            </p>

            <div class="gift-amount">{{ formatPrice(valor) }}</div>

            <Slider
                v-model="valor"
                :min="50"
                :max="50000"
                :step="20"
                class="gift-slider w-full"
            />

            <div class="gift-range">
                <span>R$ 50</span>
                <span>R$ 50.000</span>
            </div>
        </div>

        <template #footer>
            <Button label="Agora não" text @click="$emit('update:visible', false)" />
            <Button
                class="confirm-btn"
                label="Presentear"
                icon="pi pi-heart"
                :loading="loading"
                @click="confirmar"
            />
        </template>
    </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Slider from 'primevue/slider';

export default {
    name: 'ChatPresentinhoDialog',
    components: { Dialog, Button, Slider },
    props: {
        visible: Boolean,
        conversationId: { type: [Number, String], required: true },
    },
    emits: ['update:visible'],
    data() {
        return {
            loading: false,
            valor: 50,
        };
    },
    watch: {
        visible(val) {
            if (val) this.valor = 50;
        },
    },
    methods: {
        formatPrice(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(Number(value || 0));
        },
        async confirmar() {
            if (this.valor < 50 || this.valor > 50000) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Valor inválido',
                    detail: 'Escolha um valor entre R$ 50 e R$ 50.000.',
                    life: 3500,
                });
                return;
            }

            this.loading = true;
            try {
                const { data } = await this.api.post(
                    `/chat/conversations/${this.conversationId}/presentinhos`,
                    { valor: this.valor }
                );

                if (!data?.link) {
                    throw new Error(data?.message || 'Link de pagamento não gerado');
                }

                window.location.href = data.link;
            } catch (e) {
                const errors = e.response?.data?.errors;
                const validationMsg = errors?.valor?.[0];
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: validationMsg
                        || e.response?.data?.message
                        || e.message
                        || 'Não foi possível gerar o presentinho',
                    life: 4000,
                });
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped lang="scss">
.gift-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
    color: #ddd;
    padding: 0.25rem 0 0.5rem;
}

.gift-icon {
    width: 3.2rem;
    height: 3.2rem;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(245, 206, 225, 0.15);
    color: #f5cee1;
    font-size: 1.4rem;
}

.gift-lead {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    color: #fce7f3;
    line-height: 1.35;
}

.gift-sub {
    margin: 0;
    font-size: 0.9rem;
    color: #aaa;
    line-height: 1.45;
    max-width: 22rem;
}

.gift-amount {
    margin-top: 0.35rem;
    font-size: 1.85rem;
    font-weight: 700;
    color: #f5cee1;
    letter-spacing: 0.02em;
}

.gift-slider {
    margin-top: 0.5rem;
}

.gift-range {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #888;
}

.confirm-btn {
    background: #f5cee1 !important;
    border-color: #f5cee1 !important;
    color: #761c49 !important;
}

:deep(.gift-slider .p-slider-range) {
    background: #f5cee1;
}

:deep(.gift-slider .p-slider-handle) {
    border-color: #f5cee1;
    background: #f5cee1;
}
</style>
