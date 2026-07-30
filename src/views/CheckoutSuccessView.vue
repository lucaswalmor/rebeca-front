<template>
    <div class="checkout-return">
        <div class="checkout-return__glow checkout-return__glow--a" aria-hidden="true"></div>
        <div class="checkout-return__glow checkout-return__glow--b" aria-hidden="true"></div>
        <div class="checkout-return__grain" aria-hidden="true"></div>

        <div class="checkout-return__stage">
            <p class="checkout-return__brand">BecaLima007</p>

            <!-- Processando -->
            <div v-if="isProcessing" class="checkout-return__block" key="processing">
                <div class="checkout-return__pulse" aria-hidden="true">
                    <span></span>
                </div>
                <h1 class="checkout-return__title">Confirmando seu pagamento</h1>
                <p class="checkout-return__lead">
                    Estamos validando com a InfinitePay. Isso leva só alguns segundos.
                </p>
            </div>

            <!-- Aprovado -->
            <div v-else-if="paymentStatus?.paid" class="checkout-return__block is-success" key="success">
                <div class="checkout-return__mark" aria-hidden="true">
                    <svg viewBox="0 0 52 52" class="checkout-return__check">
                        <circle cx="26" cy="26" r="24" fill="none" />
                        <path fill="none" d="M14.5 27.5 L22.5 35 L37.5 17" />
                    </svg>
                </div>
                <h1 class="checkout-return__title">Pagamento confirmado</h1>
                <p class="checkout-return__lead">{{ successSubtitle }}</p>

                <dl v-if="hasDetails" class="checkout-return__meta">
                    <div v-if="displayAmount" class="checkout-return__meta-row">
                        <dt>Valor</dt>
                        <dd>{{ displayAmount }}</dd>
                    </div>
                    <div v-if="paymentStatus.capture_method" class="checkout-return__meta-row">
                        <dt>Método</dt>
                        <dd>{{ getPaymentMethodName(paymentStatus.capture_method) }}</dd>
                    </div>
                    <div v-if="paymentTypeLabel" class="checkout-return__meta-row">
                        <dt>Produto</dt>
                        <dd>{{ paymentTypeLabel }}</dd>
                    </div>
                </dl>

                <p class="checkout-return__hint">Redirecionando automaticamente…</p>
            </div>

            <!-- Pendente -->
            <div v-else-if="paymentStatus && !paymentStatus.paid" class="checkout-return__block" key="pending">
                <div class="checkout-return__status-icon is-pending" aria-hidden="true">
                    <i class="pi pi-hourglass"></i>
                </div>
                <h1 class="checkout-return__title">Ainda estamos confirmando</h1>
                <p class="checkout-return__lead">
                    O pagamento pode levar alguns minutos para aparecer. Você pode verificar de novo.
                </p>

                <dl v-if="displayAmount" class="checkout-return__meta">
                    <div class="checkout-return__meta-row">
                        <dt>Valor</dt>
                        <dd>{{ displayAmount }}</dd>
                    </div>
                </dl>

                <div class="checkout-return__actions">
                    <button
                        type="button"
                        class="btn-primary"
                        :disabled="isChecking"
                        @click="checkPaymentStatus"
                    >
                        <i :class="isChecking ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"></i>
                        Verificar novamente
                    </button>
                    <button type="button" class="btn-ghost" @click="goHome">
                        Voltar ao início
                    </button>
                </div>
            </div>

            <!-- Erro -->
            <div v-else-if="error" class="checkout-return__block" key="error">
                <div class="checkout-return__status-icon is-error" aria-hidden="true">
                    <i class="pi pi-exclamation-circle"></i>
                </div>
                <h1 class="checkout-return__title">Não foi possível confirmar</h1>
                <p class="checkout-return__lead">{{ error }}</p>

                <div class="checkout-return__actions">
                    <button
                        type="button"
                        class="btn-primary"
                        :disabled="isChecking"
                        @click="checkPaymentStatus"
                    >
                        <i :class="isChecking ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"></i>
                        Tentar novamente
                    </button>
                    <button type="button" class="btn-ghost" @click="goHome">
                        Voltar ao início
                    </button>
                </div>
            </div>

            <!-- Sem params -->
            <div v-else class="checkout-return__block" key="empty">
                <div class="checkout-return__status-icon" aria-hidden="true">
                    <i class="pi pi-sparkles"></i>
                </div>
                <h1 class="checkout-return__title">Confirmação de pagamento</h1>
                <p class="checkout-return__lead">
                    Esta página aparece depois que você finaliza um pagamento na InfinitePay.
                </p>
                <div class="checkout-return__actions">
                    <button type="button" class="btn-primary" @click="goHome">
                        Ir para o início
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useCheckoutStore } from '@/stores/checkout';
import { useAuthStore } from '@/stores/auth';
import api from '@/axios/api';

export default {
    name: 'CheckoutSuccessView',
    setup() {
        const authStore = useAuthStore();
        return { authStore };
    },
    data() {
        return {
            isProcessing: true,
            isChecking: false,
            error: '',
            paymentStatus: null,
            isPostPurchase: false,
            isChatMediaPurchase: false,
        };
    },
    computed: {
        successSubtitle() {
            if (this.isChatMediaPurchase) {
                return 'Seus envios de foto e vídeo no chat foram liberados.';
            }
            if (this.isPostPurchase) {
                return 'O conteúdo exclusivo já está disponível para você.';
            }
            return 'Sua assinatura foi ativada. Bem-vinda de volta.';
        },
        paymentTypeLabel() {
            if (this.isChatMediaPurchase) return 'Pacote de mídia do chat';
            if (this.isPostPurchase) return 'Conteúdo exclusivo';
            return 'Assinatura';
        },
        displayAmount() {
            const cents = this.paymentStatus?.paid_amount || this.paymentStatus?.amount;
            if (!cents) return null;
            return this.formatCurrency(Number(cents) / 100);
        },
        hasDetails() {
            return !!(this.displayAmount || this.paymentStatus?.capture_method);
        },
        urlParams() {
            return {
                capture_method: this.$route.query.capture_method,
                transaction_id: this.$route.query.transaction_id,
                transaction_nsu: this.$route.query.transaction_nsu,
                slug: this.$route.query.slug,
                order_nsu: this.$route.query.order_nsu,
                receipt_url: this.$route.query.receipt_url,
            };
        },
    },
    methods: {
        formatCurrency(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(value);
        },
        getPaymentMethodName(method) {
            const methods = {
                credit_card: 'Cartão de crédito',
                pix: 'PIX',
                boleto: 'Boleto',
            };
            return methods[method] || method || 'Não informado';
        },
        async checkPaymentStatus() {
            if (!this.urlParams.order_nsu || !this.urlParams.transaction_nsu || !this.urlParams.slug) {
                this.isProcessing = false;
                return;
            }

            this.isChecking = true;
            this.error = '';

            try {
                const backendResponse = await api.post('/assinaturas/processar-checkout-success', this.urlParams);

                if (backendResponse.data.success) {
                    const infinitePayData = backendResponse.data.infinitepay_response;
                    const assinaturaData = backendResponse.data.assinatura;
                    this.isPostPurchase = backendResponse.data.type === 'post_compra'
                        || (this.urlParams.order_nsu || '').startsWith('post-');

                    this.isChatMediaPurchase = backendResponse.data.type === 'chat_media'
                        || (this.urlParams.order_nsu || '').startsWith('chatmedia-')
                        || (this.urlParams.order_nsu || '').startsWith('chataudio-');

                    this.paymentStatus = {
                        paid: assinaturaData.status === 'aprovado',
                        amount: infinitePayData?.amount || (assinaturaData.paid_amount * 100) || 0,
                        paid_amount: infinitePayData?.paid_amount || (assinaturaData.paid_amount * 100) || 0,
                        installments: infinitePayData?.installments || assinaturaData.installments || 1,
                        capture_method: assinaturaData.capture_method || this.urlParams.capture_method,
                        receipt_url: assinaturaData.receipt_url || this.urlParams.receipt_url,
                        transaction_nsu: assinaturaData.transaction_nsu || this.urlParams.transaction_nsu,
                        order_nsu: assinaturaData.order_nsu || this.urlParams.order_nsu,
                    };

                    if (this.paymentStatus.paid) {
                        if (this.isChatMediaPurchase) {
                            const user = JSON.parse(localStorage.getItem('user') || '{}');
                            if (typeof assinaturaData.media_credits === 'number') {
                                user.chat_media_credits = assinaturaData.media_credits;
                            }
                            if (typeof assinaturaData.audio_credits === 'number') {
                                user.chat_audio_credits = assinaturaData.audio_credits;
                            }
                            localStorage.setItem('user', JSON.stringify(user));
                        }

                        if (!this.isPostPurchase && !this.isChatMediaPurchase) {
                            const user = JSON.parse(localStorage.getItem('user') || '{}');
                            user.assinatura = true;
                            user.status_assinatura = 'aprovado';
                            user.status_assinatura_descricao = 'Assinatura Ativa';
                            localStorage.setItem('user', JSON.stringify(user));
                        }

                        this.authStore.triggerUpdate();
                        useCheckoutStore().resetCheckout();

                        const destination = this.isChatMediaPurchase ? '/messages' : '/home';
                        setTimeout(() => this.$router.push(destination), 2800);
                    } else {
                        this.error = 'Pagamento ainda não foi confirmado pela InfinitePay. Tente novamente em alguns minutos.';
                    }
                } else {
                    throw new Error(backendResponse.data.message || 'Erro ao processar dados do checkout');
                }
            } catch (err) {
                if (err.response) {
                    this.error = err.response.data?.message || err.response.data?.error || 'Erro na comunicação com o servidor';
                } else if (err.request) {
                    this.error = 'Erro de conexão com o servidor';
                } else {
                    this.error = err.message;
                }
            } finally {
                this.isProcessing = false;
                this.isChecking = false;
            }
        },
        goHome() {
            this.$router.push('/home');
        },
        goToCheckout() {
            this.$router.push('/checkout');
        },
    },
    mounted() {
        setTimeout(() => {
            this.checkPaymentStatus();
        }, 900);
    },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Manrope:wght@400;500;600&display=swap');

.checkout-return {
    --blush: #f5cee1;
    --rose: #761c49;
    --ink: #f8eef3;
    --muted: rgba(248, 238, 243, 0.62);
    --line: rgba(245, 206, 225, 0.22);
    --bg: #0a0608;

    position: relative;
    isolation: isolate;
    min-height: 100vh;
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: 2rem 1.25rem;
    overflow: hidden;
    background:
        radial-gradient(120% 80% at 50% -10%, rgba(118, 28, 73, 0.45), transparent 55%),
        radial-gradient(80% 60% at 100% 100%, rgba(245, 206, 225, 0.08), transparent 50%),
        var(--bg);
    color: var(--ink);
    font-family: 'Manrope', system-ui, sans-serif;
}

.checkout-return__glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
}

.checkout-return__glow--a {
    width: min(420px, 70vw);
    height: min(420px, 70vw);
    top: 8%;
    left: -8%;
    background: rgba(118, 28, 73, 0.55);
    animation: drift 12s ease-in-out infinite alternate;
}

.checkout-return__glow--b {
    width: min(360px, 60vw);
    height: min(360px, 60vw);
    right: -6%;
    bottom: 5%;
    background: rgba(245, 206, 225, 0.18);
    animation: drift 14s ease-in-out infinite alternate-reverse;
}

.checkout-return__grain {
    position: absolute;
    inset: 0;
    z-index: 0;
    opacity: 0.12;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.checkout-return__stage {
    position: relative;
    z-index: 1;
    width: min(440px, 100%);
    text-align: center;
    animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.checkout-return__brand {
    margin: 0 0 2.25rem;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(2.4rem, 8vw, 3.4rem);
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1;
    color: var(--blush);
}

.checkout-return__block {
    animation: rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.checkout-return__title {
    margin: 0 0 0.75rem;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(1.75rem, 5vw, 2.15rem);
    font-weight: 500;
    line-height: 1.15;
    color: var(--ink);
}

.checkout-return__lead {
    margin: 0 auto 1.75rem;
    max-width: 28ch;
    font-size: 0.98rem;
    line-height: 1.55;
    color: var(--muted);
    font-weight: 400;
}

.checkout-return__hint {
    margin: 1.5rem 0 0;
    font-size: 0.82rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(245, 206, 225, 0.55);
}

.checkout-return__pulse {
    width: 64px;
    height: 64px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    border: 1px solid var(--line);
    display: grid;
    place-items: center;
}

.checkout-return__pulse span {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--blush);
    animation: breathe 1.4s ease-in-out infinite;
}

.checkout-return__mark {
    width: 72px;
    height: 72px;
    margin: 0 auto 1.35rem;
}

.checkout-return__check {
    width: 72px;
    height: 72px;
}

.checkout-return__check circle {
    stroke: rgba(245, 206, 225, 0.35);
    stroke-width: 1.5;
    animation: draw-circle 0.6s ease forwards;
}

.checkout-return__check path {
    stroke: var(--blush);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    animation: draw-check 0.45s 0.35s ease forwards;
}

.checkout-return__status-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1.35rem;
    border-radius: 50%;
    border: 1px solid var(--line);
    display: grid;
    place-items: center;
    color: var(--blush);
    font-size: 1.5rem;
}

.checkout-return__status-icon.is-pending {
    color: #f0c27a;
}

.checkout-return__status-icon.is-error {
    color: #f0a0a8;
}

.checkout-return__meta {
    margin: 0 auto 0.5rem;
    padding: 1rem 0;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    max-width: 320px;
    text-align: left;
}

.checkout-return__meta-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.45rem 0;
    font-size: 0.9rem;
}

.checkout-return__meta-row dt {
    color: var(--muted);
    font-weight: 400;
}

.checkout-return__meta-row dd {
    margin: 0;
    color: var(--ink);
    font-weight: 500;
    text-align: right;
}

.checkout-return__actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.75rem;
    align-items: stretch;
}

.btn-primary,
.btn-ghost {
    appearance: none;
    border: none;
    border-radius: 999px;
    padding: 0.85rem 1.25rem;
    font-family: inherit;
    font-size: 0.92rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: background-color 0.25s ease, color 0.25s ease, transform 0.2s ease, opacity 0.2s ease;
}

.btn-primary {
    background: var(--blush);
    color: var(--rose);
}

.btn-primary:hover:not(:disabled) {
    background: var(--rose);
    color: var(--blush);
    transform: translateY(-1px);
}

.btn-primary:disabled {
    opacity: 0.65;
    cursor: wait;
}

.btn-ghost {
    background: transparent;
    color: var(--blush);
    border: 1px solid var(--line);
}

.btn-ghost:hover {
    border-color: var(--blush);
    background: rgba(245, 206, 225, 0.06);
}

@keyframes rise {
    from {
        opacity: 0;
        transform: translateY(18px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes breathe {
    0%, 100% {
        transform: scale(0.85);
        opacity: 0.55;
    }
    50% {
        transform: scale(1.15);
        opacity: 1;
    }
}

@keyframes drift {
    from {
        transform: translate3d(0, 0, 0);
    }
    to {
        transform: translate3d(24px, -18px, 0);
    }
}

@keyframes draw-circle {
    from {
        stroke-dasharray: 150;
        stroke-dashoffset: 150;
    }
    to {
        stroke-dasharray: 150;
        stroke-dashoffset: 0;
    }
}

@keyframes draw-check {
    to {
        stroke-dashoffset: 0;
    }
}

@media (max-width: 480px) {
    .checkout-return {
        padding: 1.5rem 1rem;
    }

    .checkout-return__brand {
        margin-bottom: 1.75rem;
    }
}
</style>
