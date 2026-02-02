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
                            <h2 class="success-title">Pagamento Confirmado!</h2>
                            <p class="success-subtitle">
                                Sua assinatura foi ativada com sucesso. Redirecionando...
                            </p>
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
            </div>
        </div>
    </div>
</template>

<script>
import { useCheckoutStore } from '@/stores/checkout';
import { useAuthStore } from '@/stores/auth';
import api from '@/axios/api';
import Button from 'primevue/button';

export default {
    name: 'CheckoutSuccessView',
    components: {
        Button
    },
    setup() {
        const authStore = useAuthStore();
        return { authStore };
    },
    data() {
        return {
            isProcessing: true,
            isChecking: false,
            error: '',
            paymentStatus: null
        }
    },
    computed: {
        // Parâmetros da URL
        urlParams() {
            return {
                capture_method: this.$route.query.capture_method,
                transaction_id: this.$route.query.transaction_id,
                transaction_nsu: this.$route.query.transaction_nsu,
                slug: this.$route.query.slug,
                order_nsu: this.$route.query.order_nsu,
                receipt_url: this.$route.query.receipt_url
            };
        }
    },
    methods: {
        // Formatar moeda
        formatCurrency(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        },

        // Obter nome do método de pagamento
        getPaymentMethodName(method) {
        // a
            const methods = {
                'credit_card': 'Cartão de Crédito',
                'pix': 'PIX',
                'boleto': 'Boleto'
            };
            return methods[method] || method || 'Não informado';
        },

        // Verificar status do pagamento
        async checkPaymentStatus() {
            if (!this.urlParams.order_nsu || !this.urlParams.transaction_nsu || !this.urlParams.slug) {
                console.log('Parâmetros da URL incompletos:', this.urlParams);
                this.isProcessing = false;
                return;
            }

            this.isChecking = true;
            this.error = '';

            try {
                console.log('Iniciando processamento do checkout success com parâmetros:', this.urlParams);

                // Primeiro: salvar dados no backend e consultar InfinitePay
                console.log('Fazendo requisição para o backend...');
                const backendResponse = await api.post('/assinaturas/processar-checkout-success', this.urlParams);

                console.log('Resposta do backend:', backendResponse.data);

                if (backendResponse.data.success) {
                    // Usar os dados retornados pelo backend
                    const infinitePayData = backendResponse.data.infinitepay_response;
                    const assinaturaData = backendResponse.data.assinatura;

                    // Mapear dados para o formato esperado pelo componente
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

                    console.log('Status do pagamento processado:', this.paymentStatus);

                    if (this.paymentStatus.paid) {
                        console.log('Pagamento confirmado com sucesso!');

                        // Atualizar localStorage com assinatura ativa
                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                        user.assinatura = true;
                        user.status_assinatura = 'aprovado';
                        user.status_assinatura_descricao = 'Assinatura Ativa';
                        localStorage.setItem('user', JSON.stringify(user));

                        // Disparar atualização do auth store para forçar reatividade
                        this.authStore.triggerUpdate();

                        // Atualizar store
                        const checkoutStore = useCheckoutStore();
                        checkoutStore.resetCheckout();

                        // Pequeno delay para garantir que as atualizações sejam processadas
                        console.log('Redirecionando para página inicial em 1 segundo...');
                        setTimeout(() => {
                            this.$router.push('/home');
                        }, 1000);

                    } else {
                        console.log('Pagamento ainda pendente ou não aprovado');
                        this.error = 'Pagamento ainda não foi confirmado pela InfinitePay. Tente novamente em alguns minutos.';
                    }

                } else {
                    throw new Error(backendResponse.data.message || 'Erro ao processar dados do checkout');
                }

            } catch (err) {
                console.error('Erro ao verificar status do pagamento:', err);

                if (err.response) {
                    console.error('Erro na resposta da API:', {
                        status: err.response.status,
                        data: err.response.data,
                        headers: err.response.headers
                    });

                    if (err.response.data?.infinitepay_error) {
                        console.error('Erro específico da InfinitePay:', err.response.data.infinitepay_error);
                    }

                    if (err.response.data?.infinitepay_exception) {
                        console.error('Exceção na InfinitePay:', err.response.data.infinitepay_exception);
                    }

                    this.error = err.response.data?.message || err.response.data?.error || 'Erro na comunicação com o servidor';
                } else if (err.request) {
                    console.error('Erro na requisição (sem resposta):', err.request);
                    this.error = 'Erro de conexão com o servidor';
                } else {
                    console.error('Erro geral:', err.message);
                    this.error = err.message;
                }
            } finally {
                this.isProcessing = false;
                this.isChecking = false;
            }
        },

        // Navegação
        goHome() {
            this.$router.push('/home');
        },

        goToCheckout() {
            this.$router.push('/checkout');
        },

        newPayment() {
            const checkoutStore = useCheckoutStore();
            checkoutStore.resetCheckout();
            this.$router.push('/checkout');
        }
    },

    // Verificar automaticamente ao montar o componente
    mounted() {
        // Simular delay para mostrar o estado de processamento
        setTimeout(() => {
            this.checkPaymentStatus();
        }, 2000);
    }
}
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
