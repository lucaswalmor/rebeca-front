<template>
    <div class="success-page">
        <div class="container">
            <div class="success-card">
                <!-- Ícone de sucesso -->
                <div class="success-icon">
                    <i class="pi pi-check-circle"></i>
                </div>

                <!-- Título -->
                <h1 class="success-title">Pagamento Realizado com Sucesso!</h1>

                <!-- Mensagem -->
                <p class="success-message">
                    Obrigado por assinar! Sua assinatura foi ativada e você já pode aproveitar todos os benefícios.
                </p>

                <!-- Detalhes do pagamento (se houver) -->
                <div v-if="paymentDetails" class="payment-details">
                    <div class="detail-item">
                        <span class="label">Plano:</span>
                        <span class="value">{{ paymentDetails.plano }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Valor:</span>
                        <span class="value">{{ formatCurrency(paymentDetails.valor) }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Data:</span>
                        <span class="value">{{ formatDate(new Date()) }}</span>
                    </div>
                </div>

                <!-- Ações -->
                <div class="actions">
                    <Button
                        label="Voltar ao Perfil"
                        icon="pi pi-home"
                        @click="goToProfile"
                        class="p-button-primary"
                    />
                    <Button
                        label="Explorar Conteúdo"
                        icon="pi pi-search"
                        @click="goToHome"
                        class="p-button-outlined"
                    />
                </div>

                <!-- Nota adicional -->
                <div class="note">
                    <p>
                        <i class="pi pi-info-circle"></i>
                        Você recebeu um e-mail de confirmação com os detalhes da sua assinatura.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';

const route = useRoute();
const router = useRouter();
const paymentDetails = ref(null);

// Formatar moeda
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

// Formatar data
const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// Navegação
const goToProfile = () => {
    router.push('/');
};

const goToHome = () => {
    router.push('/');
};

// Verificar se há parâmetros de URL para exibir detalhes
onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Se houver parâmetros de sucesso, extrair informações
    if (urlParams.has('success') || urlParams.has('order_nsu')) {
        // Tentar extrair informações do localStorage ou parâmetros
        const plano = urlParams.get('plano');
        const valor = urlParams.get('valor');

        if (plano && valor) {
            paymentDetails.value = {
                plano: plano === '1_mes' ? '1 Mês' :
                       plano === '3_meses' ? '3 Meses' : '6 Meses',
                valor: parseFloat(valor)
            };
        }
    }
});
</script>

<style scoped>
.success-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
}

.container {
    max-width: 600px;
    width: 100%;
}

.success-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    padding: 3rem 2rem;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.success-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #4caf50, #66bb6a, #81c784);
}

.success-icon {
    font-size: 4rem;
    color: #4caf50;
    margin-bottom: 1.5rem;
    animation: successPulse 2s ease-in-out infinite;
}

.success-title {
    color: #2e7d32;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;
}

.success-message {
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 2rem;
    line-height: 1.6;
}

.payment-details {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    text-align: left;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e9ecef;
}

.detail-item:last-child {
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

.actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    justify-content: center;
}

.note {
    background: #e8f5e8;
    border: 1px solid #c8e6c9;
    border-radius: 8px;
    padding: 1rem;
    color: #2e7d32;
}

.note p {
    margin: 0;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.note i {
    color: #4caf50;
}

/* Animações */
@keyframes successPulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.8;
    }
}

/* Responsividade */
@media (max-width: 768px) {
    .success-card {
        padding: 2rem 1.5rem;
    }

    .success-title {
        font-size: 2rem;
    }

    .success-message {
        font-size: 1rem;
    }

    .actions {
        flex-direction: column;
    }

    .actions .p-button {
        width: 100%;
        max-width: 300px;
    }
}

/* Estilos dos botões PrimeVue */
:deep(.p-button) {
    border-radius: 25px;
    padding: 0.75rem 2rem;
    font-weight: 600;
    transition: all 0.3s ease;
}

:deep(.p-button-primary) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
}

:deep(.p-button-primary:hover) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

:deep(.p-button-outlined) {
    border: 2px solid #667eea;
    color: #667eea;
}

:deep(.p-button-outlined:hover) {
    background: #667eea;
    border-color: #667eea;
    transform: translateY(-2px);
}
</style>
