<template>
    <div class="checkout-container">
        <div class="p-grid">
            <div class="p-col-12 p-md-8 p-offset-md-2">
                <div class="card checkout-card">
                    <h2 class="text-center mb-4">
                        <i class="pi pi-shopping-cart"></i>
                        Configurar Checkout de Pagamento
                    </h2>

                    <!-- Configurações Básicas -->
                    <div class="card mb-4">
                        <h5>
                            <i class="pi pi-cog"></i>
                            Configurações Básicas
                        </h5>

                        <div class="p-fluid p-formgrid p-grid">
                            <div class="p-field p-col-12 p-md-6">
                                <label for="handle">InfiniteTag (Handle) *</label>
                                <InputText
                                    id="handle"
                                    v-model="checkoutStore.checkoutData.handle"
                                    placeholder="Digite seu InfiniteTag (ex: seuusuario)"
                                    :class="{ 'p-invalid': validationErrors.handle }"
                                />
                                <small v-if="validationErrors.handle" class="p-error">
                                    {{ validationErrors.handle }}
                                </small>
                                <small class="p-help">
                                    Seu nome de usuário no App InfinitePay (sem o @)
                                </small>
                            </div>

                            <div class="p-field p-col-12 p-md-6">
                                <label for="orderNsu">Número do Pedido (Order NSU)</label>
                                <InputText
                                    id="orderNsu"
                                    v-model="checkoutStore.checkoutData.order_nsu"
                                    placeholder="Digite um código único para este pedido"
                                />
                                <small class="p-help">
                                    Opcional - Identificador único do pedido no seu sistema
                                </small>
                            </div>
                        </div>
                    </div>

                    <!-- Itens do Pedido -->
                    <div class="card mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5>
                                <i class="pi pi-list"></i>
                                Itens do Pedido
                            </h5>
                            <Button
                                label="Adicionar Item"
                                icon="pi pi-plus"
                                @click="checkoutStore.addItem()"
                                class="p-button-sm p-button-outlined"
                            />
                        </div>

                        <div v-for="(item, index) in checkoutStore.checkoutData.items" :key="index" class="item-card mb-3">
                            <div class="p-fluid p-formgrid p-grid">
                                <div class="p-field p-col-12 p-md-5">
                                    <label :for="`description-${index}`">Descrição *</label>
                                    <InputText
                                        :id="`description-${index}`"
                                        v-model="item.description"
                                        placeholder="Nome do produto/serviço"
                                        :class="{ 'p-invalid': validationErrors[`item-${index}-description`] }"
                                    />
                                </div>

                                <div class="p-field p-col-12 p-md-2">
                                    <label :for="`quantity-${index}`">Quantidade *</label>
                                    <InputNumber
                                        :id="`quantity-${index}`"
                                        v-model="item.quantity"
                                        :min="1"
                                        :max="999"
                                        :class="{ 'p-invalid': validationErrors[`item-${index}-quantity`] }"
                                    />
                                </div>

                                <div class="p-field p-col-12 p-md-3">
                                    <label :for="`price-${index}`">Preço (R$) *</label>
                                    <InputNumber
                                        :id="`price-${index}`"
                                        v-model="item.price"
                                        mode="currency"
                                        currency="BRL"
                                        locale="pt-BR"
                                        :min="0"
                                        :max="999999"
                                        :class="{ 'p-invalid': validationErrors[`item-${index}-price`] }"
                                    />
                                </div>

                                <div class="p-field p-col-12 p-md-2 d-flex align-items-end">
                                    <Button
                                        v-if="checkoutStore.checkoutData.items.length > 1"
                                        label="Remover"
                                        icon="pi pi-trash"
                                        @click="checkoutStore.removeItem(index)"
                                        class="p-button-sm p-button-danger p-button-outlined"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- Total -->
                        <div class="total-section">
                            <div class="total-amount">
                                <strong>Total: {{ formatCurrency(checkoutStore.calculateTotal()) }}</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Dados do Cliente (Opcional) -->
                    <div class="card mb-4">
                        <h5>
                            <i class="pi pi-user"></i>
                            Dados do Cliente
                            <small class="text-muted">(Opcional)</small>
                        </h5>

                        <div class="p-fluid p-formgrid p-grid">
                            <div class="p-field p-col-12 p-md-4">
                                <label for="customerName">Nome</label>
                                <InputText
                                    id="customerName"
                                    v-model="checkoutStore.checkoutData.customer.name"
                                    placeholder="Nome completo do cliente"
                                />
                            </div>

                            <div class="p-field p-col-12 p-md-4">
                                <label for="customerEmail">E-mail</label>
                                <InputText
                                    id="customerEmail"
                                    v-model="checkoutStore.checkoutData.customer.email"
                                    placeholder="email@exemplo.com"
                                />
                            </div>

                            <div class="p-field p-col-12 p-md-4">
                                <label for="customerPhone">Telefone</label>
                                <InputText
                                    id="customerPhone"
                                    v-model="checkoutStore.checkoutData.customer.phone_number"
                                    placeholder="(11) 99999-9999"
                                    v-mask="'(##) #####-####'"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Endereço de Entrega (Opcional) -->
                    <div class="card mb-4">
                        <h5>
                            <i class="pi pi-map-marker"></i>
                            Endereço de Entrega
                            <small class="text-muted">(Opcional)</small>
                        </h5>

                        <div class="p-fluid p-formgrid p-grid">
                            <div class="p-field p-col-12 p-md-2">
                                <label for="cep">CEP</label>
                                <InputText
                                    id="cep"
                                    v-model="checkoutStore.checkoutData.address.cep"
                                    placeholder="00000-000"
                                    v-mask="'#####-###'"
                                />
                            </div>

                            <div class="p-field p-col-12 p-md-6">
                                <label for="street">Rua</label>
                                <InputText
                                    id="street"
                                    v-model="checkoutStore.checkoutData.address.street"
                                    placeholder="Nome da rua"
                                />
                            </div>

                            <div class="p-field p-col-12 p-md-4">
                                <label for="neighborhood">Bairro</label>
                                <InputText
                                    id="neighborhood"
                                    v-model="checkoutStore.checkoutData.address.neighborhood"
                                    placeholder="Nome do bairro"
                                />
                            </div>

                            <div class="p-field p-col-12 p-md-2">
                                <label for="number">Número</label>
                                <InputText
                                    id="number"
                                    v-model="checkoutStore.checkoutData.address.number"
                                    placeholder="123"
                                />
                            </div>

                            <div class="p-field p-col-12 p-md-4">
                                <label for="complement">Complemento</label>
                                <InputText
                                    id="complement"
                                    v-model="checkoutStore.checkoutData.address.complement"
                                    placeholder="Apto 45, Bloco A"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Webhook URL (Opcional) -->
                    <div class="card mb-4">
                        <h5>
                            <i class="pi pi-link"></i>
                            URL de Webhook
                            <small class="text-muted">(Opcional)</small>
                        </h5>

                        <div class="p-field">
                            <InputText
                                v-model="checkoutStore.checkoutData.webhook_url"
                                placeholder="https://seusite.com/webhook/infinitepay"
                            />
                            <small class="p-help">
                                URL para receber notificações automáticas sobre o status do pagamento
                            </small>
                        </div>
                    </div>

                    <!-- Mensagem de Erro -->
                    <div v-if="checkoutStore.error" class="alert alert-danger mb-4">
                        <i class="pi pi-exclamation-triangle"></i>
                        {{ checkoutStore.error }}
                    </div>

                    <!-- Botões de Ação -->
                    <div class="d-flex justify-content-between">
                        <Button
                            label="Limpar Tudo"
                            icon="pi pi-refresh"
                            @click="resetForm"
                            class="p-button-secondary"
                        />

                        <Button
                            label="Gerar Link de Pagamento"
                            icon="pi pi-check"
                            @click="generatePaymentLink"
                            :loading="checkoutStore.isLoading"
                            class="p-button-success"
                        />
                    </div>

                    <!-- Link Gerado -->
                    <div v-if="checkoutStore.paymentLink" class="card mt-4 payment-link-card">
                        <h5 class="text-success">
                            <i class="pi pi-check-circle"></i>
                            Link de Pagamento Gerado!
                        </h5>

                        <div class="p-field">
                            <label>Link do Checkout:</label>
                            <div class="d-flex">
                                <InputText
                                    :value="checkoutStore.paymentLink"
                                    readonly
                                    class="flex-grow-1"
                                />
                                <Button
                                    label="Copiar"
                                    icon="pi pi-copy"
                                    @click="copyToClipboard(checkoutStore.paymentLink)"
                                    class="p-button-outlined ml-2"
                                />
                            </div>
                        </div>

                        <div class="d-flex gap-2 mt-3">
                            <Button
                                label="Abrir no Navegador"
                                icon="pi pi-external-link"
                                @click="openPaymentLink"
                                class="p-button-primary"
                            />
                            <Button
                                label="Compartilhar"
                                icon="pi pi-share-alt"
                                @click="sharePaymentLink"
                                class="p-button-outlined"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useCheckoutStore } from '@/stores/checkout';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';

const checkoutStore = useCheckoutStore();
const toast = useToast();

const validationErrors = reactive({});

// Formatar moeda
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

// Validar formulário
const validateForm = () => {
    const errors = {};

    // Validar handle
    if (!checkoutStore.checkoutData.handle.trim()) {
        errors.handle = 'InfiniteTag é obrigatório';
    }

    // Validar itens
    checkoutStore.checkoutData.items.forEach((item, index) => {
        if (!item.description.trim()) {
            errors[`item-${index}-description`] = 'Descrição é obrigatória';
        }
        if (item.quantity < 1) {
            errors[`item-${index}-quantity`] = 'Quantidade deve ser maior que 0';
        }
        if (item.price <= 0) {
            errors[`item-${index}-price`] = 'Preço deve ser maior que 0';
        }
    });

    // Validar email se fornecido
    if (checkoutStore.checkoutData.customer.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutStore.checkoutData.customer.email)) {
        errors.customerEmail = 'E-mail inválido';
    }

    Object.assign(validationErrors, errors);
    return Object.keys(errors).length === 0;
};

// Gerar link de pagamento
const generatePaymentLink = async () => {
    if (!validateForm()) {
        toast.add({
            severity: 'error',
            summary: 'Erro de Validação',
            detail: 'Por favor, corrija os erros no formulário',
            life: 5000
        });
        return;
    }

    try {
        await checkoutStore.createPaymentLink();
        toast.add({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'Link de pagamento gerado com sucesso',
            life: 5000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.message || 'Erro ao gerar link de pagamento',
            life: 5000
        });
    }
};

// Limpar formulário
const resetForm = () => {
    checkoutStore.resetCheckout();
    Object.keys(validationErrors).forEach(key => {
        delete validationErrors[key];
    });
};

// Copiar para área de transferência
const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.add({
            severity: 'success',
            summary: 'Copiado!',
            detail: 'Link copiado para a área de transferência',
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível copiar o link',
            life: 3000
        });
    }
};

// Abrir link no navegador
const openPaymentLink = () => {
    if (checkoutStore.paymentLink) {
        window.open(checkoutStore.paymentLink, '_blank');
    }
};

// Compartilhar link
const sharePaymentLink = async () => {
    if (navigator.share && checkoutStore.paymentLink) {
        try {
            await navigator.share({
                title: 'Link de Pagamento',
                text: 'Confira este link de pagamento',
                url: checkoutStore.paymentLink
            });
        } catch (error) {
            copyToClipboard(checkoutStore.paymentLink);
        }
    } else {
        copyToClipboard(checkoutStore.paymentLink);
    }
};
</script>

<style scoped>
.checkout-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem 1rem;
}

.checkout-card {
    border: none;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    background: white;
    padding: 2rem;
}

.card {
    border: none;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
}

.card h5 {
    color: #495057;
    font-weight: 600;
    margin-bottom: 1.5rem;
}

.item-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1rem;
}

.total-section {
    background: #e3f2fd;
    border: 1px solid #bbdefb;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
    margin-top: 1rem;
}

.total-amount {
    font-size: 1.2rem;
    color: #1976d2;
}

.payment-link-card {
    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
    border: 2px solid #4caf50 !important;
}

.payment-link-card h5 {
    color: #2e7d32 !important;
}

.alert-danger {
    background: #ffebee;
    border: 1px solid #f44336;
    color: #c62828;
    border-radius: 8px;
    padding: 1rem;
}

.text-center {
    text-align: center;
}

.text-muted {
    color: #6c757d;
    font-weight: normal;
}

.mb-4 {
    margin-bottom: 1.5rem !important;
}

.mb-3 {
    margin-bottom: 1rem !important;
}

.mt-3 {
    margin-top: 1rem !important;
}

.mt-4 {
    margin-top: 1.5rem !important;
}

.ml-2 {
    margin-left: 0.5rem !important;
}

.d-flex {
    display: flex !important;
}

.justify-content-between {
    justify-content: space-between !important;
}

.justify-content-center {
    justify-content: center !important;
}

.align-items-center {
    align-items: center !important;
}

.align-items-end {
    align-items: flex-end !important;
}

.flex-grow-1 {
    flex-grow: 1 !important;
}

.gap-2 {
    gap: 0.5rem !important;
}

.p-field {
    margin-bottom: 1.5rem;
}

.p-help {
    color: #6c757d;
    font-size: 0.875rem;
}

.p-error {
    color: #dc3545;
    font-size: 0.875rem;
}

@media (max-width: 768px) {
    .checkout-container {
        padding: 1rem 0.5rem;
    }

    .checkout-card {
        padding: 1rem;
    }

    .d-flex {
        flex-direction: column;
    }

    .d-flex > * {
        margin-bottom: 0.5rem;
    }

    .d-flex > *:last-child {
        margin-bottom: 0;
    }
}
</style>
