<template>
    <div class="offer-card" :class="{ mine }">
        <div class="offer-icon" aria-hidden="true">
            <i class="pi pi-gift"></i>
        </div>
        <div class="offer-title">Presentinho</div>
        <div class="offer-amount">{{ formatPrice(payload.valor) }}</div>
        <div class="offer-text">
            A Beca pediu um presentinho especial neste valor.
        </div>

        <button
            v-if="!isAdminUser"
            type="button"
            class="offer-btn"
            :disabled="loading"
            @click="pagar"
        >
            <i :class="loading ? 'pi pi-spin pi-spinner' : 'pi pi-heart'"></i>
            {{ loading ? 'Abrindo…' : 'Dar presentinho' }}
        </button>
        <div v-else class="offer-admin-hint">
            Aguardando o cliente pagar
        </div>
    </div>
</template>

<script>
import { isAdmin } from '@/utils/global';

export default {
    name: 'ChatPresentinhoOfferCard',
    props: {
        payload: { type: Object, required: true },
        messageId: { type: [Number, String], required: true },
        conversationId: { type: [Number, String], required: true },
        mine: { type: Boolean, default: false },
    },
    data() {
        return {
            loading: false,
        };
    },
    computed: {
        isAdminUser() {
            return isAdmin();
        },
    },
    methods: {
        formatPrice(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(Number(value || 0));
        },
        async pagar() {
            if (this.loading) return;
            this.loading = true;
            try {
                const { data } = await this.api.post(
                    `/chat/conversations/${this.conversationId}/presentinhos`,
                    { offer_message_id: this.messageId }
                );

                if (!data?.link) {
                    throw new Error(data?.message || 'Link de pagamento não gerado');
                }

                window.location.href = data.link;
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || e.message || 'Não foi possível abrir o pagamento',
                    life: 4000,
                });
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped lang="scss">
.offer-card {
    box-sizing: border-box;
    width: 100%;
    min-width: 210px;
    max-width: 280px;
    padding: 1.05rem 1rem 1rem;
    border-radius: 16px;
    border: 1px solid rgba(245, 206, 225, 0.55);
    background:
        radial-gradient(120% 90% at 50% -10%, rgba(245, 206, 225, 0.22), transparent 55%),
        linear-gradient(160deg, rgba(117, 28, 73, 0.5), rgba(30, 10, 20, 0.8));
    color: #fce7f3;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.55rem;
}

.offer-icon {
    flex-shrink: 0;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #fce7f3, #f5cee1);
    color: #761c49;
    font-size: 1.15rem;
}

.offer-title {
    flex-shrink: 0;
    margin: 0;
    padding: 0;
    font-weight: 700;
    font-size: 0.72rem;
    line-height: 1.2;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #f9a8d4;
}

.offer-amount {
    flex-shrink: 0;
    margin: 0;
    padding: 0.15rem 0 0;
    font-size: clamp(1.15rem, 4.5vw, 1.45rem);
    font-weight: 800;
    line-height: 1.2;
    color: #fff;
    word-break: break-word;
    overflow-wrap: anywhere;
}

.offer-text {
    flex-shrink: 0;
    margin: 0;
    padding: 0;
    font-size: 0.84rem;
    line-height: 1.4;
    color: rgba(252, 231, 243, 0.9);
    max-width: 15rem;
}

.offer-btn {
    flex-shrink: 0;
    margin-top: 0.25rem;
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    border: none;
    border-radius: 999px;
    padding: 0.7rem 0.85rem;
    background: #f5cee1;
    color: #761c49;
    font-weight: 700;
    font-size: 0.9rem;
    line-height: 1.2;
    cursor: pointer;

    &:hover:not(:disabled) {
        background: #f9a8d4;
    }

    &:disabled {
        opacity: 0.7;
        cursor: wait;
    }
}

.offer-admin-hint {
    flex-shrink: 0;
    margin: 0.15rem 0 0;
    font-size: 0.75rem;
    line-height: 1.3;
    color: #f9a8d4;
}
</style>
