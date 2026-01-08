<template>
    <div class="success-container">
        <div class="p-grid">
            <div class="p-col-12 p-md-8 p-offset-md-2">
                <div class="success-card">
                    <!-- Status de Processamento -->
                    <div v-if="isProcessing" class="processing-section">
                        <div class="text-center">
                            <div class="spinner-container">
                                <i class="pi pi-spin pi-spinner spinner-icon"></i>
                            </div>
                            <h3 class="mt-3">Processando Pagamento...</h3>
                            <p class="text-muted">Aguarde enquanto verificamos o status do seu pagamento.</p>
                        </div>
                    </div>

                    <!-- Pagamento Aprovado -->
                    <div v-else-if="paymentStatus?.paid" class="success-section">
                        <div class="text-center">
                            <div class="success-icon">
                                <i class="pi pi-check-circle"></i>
                            </div>
                            <h2 class="success-title">Pagamento Aprovado!</h2>
                            <p class="success-subtitle">
                                Seu pagamento foi processado com sucesso.
                            </p>
                        </div>

                        <!-- Detalhes do Pagamento -->
                        <div class="payment-details">
                            <div class="detail-row">
                                <span class="label">Valor Pago:</span>
                                <span class="value">{{ formatCurrency(paymentStatus.paid_amount / 100) }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Valor Original:</span>
                                <span class="value">{{ formatCurrency(paymentStatus.amount / 100) }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Método de Pagamento:</span>
                                <span class="value">{{ getPaymentMethodName(paymentStatus.capture_method) }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Parcelas:</span>
                                <span class="value">{{ paymentStatus.installments }}</span>
                            </div>
                            <div v-if="paymentStatus.receipt_url" class="detail-row">
                                <span class="label">Comprovante:</span>
                                <a
                                    :href="paymentStatus.receipt_url"
                                    target="_blank"
                                    class="value receipt-link"
                                >
                                    Visualizar Comprovante
                                    <i class="pi pi-external-link"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Ações -->
                        <div class="actions-section">
                            <Button
                                label="Voltar ao Início"
                                icon="pi pi-home"
                                @click="goHome"
                                class="p-button-primary mr-2"
                            />
                            <Button
                                label="Novo Pagamento"
                                icon="pi pi-plus"
                                @click="newPayment"
                                class="p-button-outlined"
                            />
                        </div>
                    </div>

                    <!-- Pagamento Pendente ou Falhou -->
                    <div v-else-if="paymentStatus && !paymentStatus.paid" class="pending-section">
                        <div class="text-center">
                            <div class="pending-icon">
                                <i class="pi pi-clock"></i>
                            </div>
                            <h2 class="pending-title">Pagamento Pendente</h2>
                            <p class="pending-subtitle">
                                Seu pagamento ainda não foi confirmado. Isso pode levar alguns minutos.
                            </p>
                        </div>

                        <!-- Detalhes -->
                        <div class="payment-details">
                            <div v-if="paymentStatus.amount" class="detail-row">
                                <span class="label">Valor:</span>
                                <span class="value">{{ formatCurrency(paymentStatus.amount / 100) }}</span>
                            </div>
                        </div>

                        <!-- Ações -->
                        <div class="actions-section">
                            <Button
                                label="Verificar Novamente"
                                icon="pi pi-refresh"
                                @click="checkPaymentStatus"
                                :loading="isChecking"
                                class="p-button-primary mr-2"
                            />
                            <Button
                                label="Voltar ao Checkout"
                                icon="pi pi-arrow-left"
                                @click="goToCheckout"
                                class="p-button-outlined"
                            />
                        </div>
                    </div>

                    <!-- Erro ao Verificar Status -->
                    <div v-else-if="error" class="error-section">
                        <div class="text-center">
                            <div class="error-icon">
                                <i class="pi pi-exclamation-triangle"></i>
                            </div>
                            <h2 class="error-title">Erro ao Verificar Pagamento</h2>
                            <p class="error-subtitle">{{ error }}</p>
                        </div>

                        <!-- Ações -->
                        <div class="actions-section">
                            <Button
                                label="Tentar Novamente"
                                icon="pi pi-refresh"
                                @click="checkPaymentStatus"
                                class="p-button-primary mr-2"
                            />
                            <Button
                                label="Voltar ao Checkout"
                                icon="pi pi-arrow-left"
                                @click="goToCheckout"
                                class="p-button-outlined"
                            />
                        </div>
                    </div>

                    <!-- Sem parâmetros de URL -->
                    <div v-else class="no-params-section">
                        <div class="text-center">
                            <div class="info-icon">
                                <i class="pi pi-info-circle"></i>
                            </div>
                            <h2 class="info-title">Página de Confirmação</h2>
                            <p class="info-subtitle">
                                Esta página é exibida após o processamento do pagamento.
                            </p>
                        </div>

                        <!-- Ações -->
                        <div class="actions-section">
                            <Button
                                label="Ir para Checkout"
                                icon="pi pi-shopping-cart"
                                @click="goToCheckout"
                                class="p-button-primary"
                            />
                        </div>
                    </div>
                </div>

                <!-- Debug Info (apenas em desenvolvimento) -->
                <div v-if="isDevelopment && (paymentStatus || error)" class="debug-section mt-4">
                    <div class="card">
                        <h6>Informações de Debug</h6>
                        <pre>{{ JSON.stringify({ paymentStatus, error, urlParams }, null, 2) }}</pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCheckoutStore } from '@/stores/checkout';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';

const route = useRoute();
const router = useRouter();
const checkoutStore = useCheckoutStore();
const toast = useToast();

const isProcessing = ref(true);
const isChecking = ref(false);
const error = ref('');

// Estado computado para verificar se está em desenvolvimento
const isDevelopment = computed(() => {
    return import.meta.env.DEV;
});

// Parâmetros da URL
const urlParams = computed(() => {
    return {
        order_nsu: route.query.order_nsu,
        transaction_nsu: route.query.transaction_nsu,
        slug: route.query.slug,
        success: route.query.success,
        status: route.query.status
    };
});

// Status do pagamento
const paymentStatus = computed(() => {
    return checkoutStore.paymentStatus;
});

// Formatar moeda
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

// Obter nome do método de pagamento
const getPaymentMethodName = (method) => {
    const methods = {
        'credit_card': 'Cartão de Crédito',
        'pix': 'PIX',
        'boleto': 'Boleto'
    };
    return methods[method] || method || 'Não informado';
};

// Verificar status do pagamento
const checkPaymentStatus = async () => {
    if (!urlParams.value.order_nsu || !urlParams.value.transaction_nsu || !urlParams.value.slug) {
        isProcessing.value = false;
        return;
    }

    isChecking.value = true;
    error.value = '';

    try {
        await checkoutStore.checkPaymentStatus(
            urlParams.value.order_nsu,
            urlParams.value.transaction_nsu,
            urlParams.value.slug
        );

        if (paymentStatus.value?.paid) {
            toast.add({
                severity: 'success',
                summary: 'Pagamento Confirmado!',
                detail: 'Seu pagamento foi processado com sucesso.',
                life: 5000
            });
        }

    } catch (err) {
        error.value = err.message;
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível verificar o status do pagamento.',
            life: 5000
        });
    } finally {
        isProcessing.value = false;
        isChecking.value = false;
    }
};

// Navegação
const goHome = () => {
    router.push('/');
};

const goToCheckout = () => {
    router.push('/checkout');
};

const newPayment = () => {
    checkoutStore.resetCheckout();
    router.push('/checkout');
};

// Verificar automaticamente ao montar o componente
onMounted(() => {
    // Simular delay para mostrar o estado de processamento
    setTimeout(() => {
        checkPaymentStatus();
    }, 2000);
});
</script>

<style scoped>
.success-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem 1rem;
}

.success-card {
    border: none;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    background: white;
    padding: 3rem 2rem;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

/* Seções de Status */
.processing-section,
.success-section,
.pending-section,
.error-section,
.no-params-section {
    text-align: center;
}

/* Spinner */
.spinner-container {
    display: inline-block;
    width: 80px;
    height: 80px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

.spinner-icon {
    font-size: 2rem;
    color: #667eea;
}

/* Ícones de Status */
.success-icon {
    font-size: 5rem;
    color: #4caf50;
    margin-bottom: 1rem;
}

.pending-icon {
    font-size: 5rem;
    color: #ff9800;
    margin-bottom: 1rem;
}

.error-icon {
    font-size: 5rem;
    color: #f44336;
    margin-bottom: 1rem;
}

.info-icon {
    font-size: 5rem;
    color: #2196f3;
    margin-bottom: 1rem;
}

/* Títulos */
.success-title {
    color: #2e7d32;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.pending-title {
    color: #e65100;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.error-title {
    color: #c62828;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.info-title {
    color: #1565c0;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

/* Subtítulos */
.success-subtitle,
.pending-subtitle,
.error-subtitle,
.info-subtitle {
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 2rem;
}

/* Detalhes do Pagamento */
.payment-details {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 1.5rem;
    margin: 2rem 0;
    text-align: left;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e9ecef;
}

.detail-row:last-child {
    border-bottom: none;
}

.label {
    font-weight: 600;
    color: #495057;
}

.value {
    color: #212529;
    font-weight: 500;
}

.receipt-link {
    color: #007bff !important;
    text-decoration: none;
}

.receipt-link:hover {
    text-decoration: underline !important;
}

/* Ações */
.actions-section {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
}

/* Debug */
.debug-section .card {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
}

.debug-section h6 {
    color: #6c757d;
    margin-bottom: 1rem;
}

.debug-section pre {
    background: #ffffff;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 1rem;
    font-size: 0.875rem;
    overflow-x: auto;
}

/* Responsividade */
@media (max-width: 768px) {
    .success-container {
        padding: 1rem 0.5rem;
    }

    .success-card {
        padding: 2rem 1rem;
    }

    .payment-details {
        padding: 1rem;
    }

    .actions-section {
        flex-direction: column;
        align-items: center;
    }

    .actions-section .p-button {
        width: 100%;
        max-width: 300px;
    }
}

/* Animações */
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Cards */
.card {
    border: none;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Texto */
.text-center {
    text-align: center;
}

.text-muted {
    color: #6c757d;
}

.mt-3 {
    margin-top: 1rem;
}

.mt-4 {
    margin-top: 1.5rem;
}

.mr-2 {
    margin-right: 0.5rem;
}
</style>
