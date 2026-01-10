<template>
    <Dialog
        :visible="modelValue"
        modal
        header="Recibo da Assinatura"
        :style="{ width: '90vw', maxWidth: '800px' }"
        :closable="true"
        @update:visible="$emit('update:modelValue', $event)"
    >
        <div v-if="assinatura" class="recibo-content">
            <!-- Cabeçalho do Recibo -->
            <div class="recibo-header">
                <div class="row">
                    <div class="col-md-6">
                        <h5 class="mb-1">BecaLima007</h5>
                        <p class="text-200 mb-0">Sistema de Assinaturas</p>
                    </div>
                    <div class="col-md-6 text-end">
                        <h6 class="mb-1">Recibo #{{ assinatura.id }}</h6>
                        <p class="text-200 mb-0">{{ formatDateTime(new Date()) }}</p>
                    </div>
                </div>
            </div>

            <Divider />

            <!-- Detalhes da Assinatura -->
            <div class="recibo-details">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <strong class="text-300">Plano:</strong> 
                        <span class="text-500 ms-2">{{ getPlanoLabel(assinatura.plano) }}</span>
                    </div>
                    <div class="col-md-6">
                        <strong class="text-300">Tipo:</strong>
                        <span class="text-500 ms-2">{{ getTipoAssinaturaLabel(assinatura.tipo_assinatura) }}</span>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <strong class="text-300">Data de Início:</strong>
                        <span class="text-500 ms-2">{{ formatDate(assinatura.data_inicio) }}</span>
                    </div>
                    <div class="col-md-6">
                        <strong class="text-300">Data de Fim:</strong>
                        <span class="text-500 ms-2">{{ formatDate(assinatura.data_fim) }}</span>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <strong class="text-300">Método de Pagamento:</strong>
                        <span class="text-500 ms-2">{{ getPaymentMethodName(assinatura.capture_method) }}</span>
                    </div>
                    <div class="col-md-6">
                        <strong class="text-500">Status:</strong>
                        <Badge
                            :value="getStatusLabel(assinatura)"
                            :severity="getStatusSeverity(assinatura)"
                            class="ms-2"
                        />
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <strong class="text-300">Valor Pago:</strong>
                        <span class="text-500 ms-2">{{ formatCurrency(assinatura.paid_amount) }}</span>
                    </div>
                    <div class="col-md-6" v-if="assinatura.installments > 1">
                        <strong class="text-300">Parcelas:</strong>
                        <span class="text-500 ms-2">{{ assinatura.installments }}x</span>
                    </div>
                </div>

                <div class="row mb-3" v-if="assinatura.transaction_nsu">
                    <div class="col-md-12">
                        <strong class="text-300">NSU da Transação:</strong>
                        <span class="text-500 ms-2">{{ assinatura.transaction_nsu }}</span>
                    </div>
                </div>
            </div>

            <Divider />

            <!-- Link do Recibo Original -->
            <div v-if="assinatura.receipt_url" class="recibo-actions">
                <div class="text-center">
                    <Button
                        label="Ver Recibo Original"
                        icon="pi pi-external-link"
                        class="p-button-info"
                        @click="abrirReciboOriginal"
                    />
                </div>
            </div>

            <!-- Mensagem quando não há recibo -->
            <div v-else class="text-center text-500">
                <i class="pi pi-info-circle" style="font-size: 2rem;"></i>
                <p class="mt-2">Recibo não disponível</p>
            </div>
        </div>

        <div v-else class="text-center">
            <i class="pi pi-spinner pi-spin" style="font-size: 2rem;"></i>
            <p class="mt-2">Carregando...</p>
        </div>

        <template #footer>
            <Button
                label="Fechar"
                icon="pi pi-times"
                class="p-button-text"
                @click="$emit('update:modelValue', false)"
            />
        </template>
    </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Button from 'primevue/button';
import Badge from 'primevue/badge';

export default {
    name: 'ReciboDialog',
    components: {
        Dialog,
        Divider,
        Button,
        Badge
    },
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        assinatura: {
            type: Object,
            default: null
        }
    },
    emits: ['update:modelValue'],
    methods: {
        formatDate(dateString) {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        },

        formatDateTime(date) {
            return date.toLocaleString('pt-BR');
        },

        formatCurrency(value) {
            if (!value) return 'R$ 0,00';
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        },

        getPlanoLabel(plano) {
            const labels = {
                '1_mes': 'Assinatura - 1 Mês',
                '3_meses': 'Assinatura - 3 Meses',
                '6_meses': 'Assinatura - 6 Meses'
            };
            return labels[plano] || plano;
        },

        getTipoAssinaturaLabel(tipo) {
            const labels = {
                'mensal': 'Mensal',
                'trimestral': 'Trimestral',
                'semestral': 'Semestral'
            };
            return labels[tipo] || tipo;
        },

        getPaymentMethodName(method) {
            const methods = {
                'credit_card': 'Cartão de Crédito',
                'pix': 'PIX',
                'boleto': 'Boleto'
            };
            return methods[method] || method || 'Não informado';
        },

        getStatusLabel(assinatura) {
            const hoje = new Date();
            const dataFim = new Date(assinatura.data_fim);

            if (assinatura.status === 'aprovado' && dataFim >= hoje) {
                return 'Em andamento';
            } else if (assinatura.status === 'aprovado' && dataFim < hoje) {
                return 'Expirada';
            } else if (assinatura.status === 'pendente') {
                return 'Pendente';
            } else {
                return 'Recusada';
            }
        },

        getStatusSeverity(assinatura) {
            const status = this.getStatusLabel(assinatura);
            const severities = {
                'Em andamento': 'success',
                'Expirada': 'danger',
                'Pendente': 'warning',
                'Recusada': 'danger'
            };
            return severities[status] || 'secondary';
        },

        abrirReciboOriginal() {
            if (this.assinatura?.receipt_url) {
                window.open(this.assinatura.receipt_url, '_blank');
            }
        }
    }
}
</script>

<style scoped lang="scss">
.recibo-content {
    color: #000000;
    padding: 1rem;
    border-radius: 8px;
}

.recibo-header {
    margin-bottom: 1rem;
}

.recibo-details {
    margin-bottom: 1rem;

    .row {
        margin-bottom: 0.5rem;
    }

    strong {
        color: #333;
    }
}

.recibo-actions {
    margin-top: 1.5rem;
}

:deep(.p-dialog .p-dialog-header) {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}

:deep(.p-dialog .p-dialog-content) {
    background-color: #ffffff;
}

:deep(.p-dialog .p-dialog-footer) {
    background-color: #f8f9fa;
    border-top: 1px solid #dee2e6;
}

:deep(.p-badge) {
    font-size: 0.8rem;
}
</style>