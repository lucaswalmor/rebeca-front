<template>
    <div class="mb-5">
        <Header />
        <div class="container px-6 mt-6">
            <div class="row">
                <div class="col-12 text-center text-white">
                    <h3>Minha Conta</h3>
                </div>
            </div>

            <Divider />

            <div class="row">
                <!-- Menu Lateral -->
                <div class="col-md-3 mb-4">
                    <Card class="profile-menu-card">
                        <template #content>
                            <div class="profile-menu">
                                <div
                                    class="menu-item"
                                    :class="{ 'menu-item-active': activeMenu === 'dados' }"
                                    @click="activeMenu = 'dados'"
                                >
                                    <i class="pi pi-user me-2"></i>
                                    <span>Dados Pessoais</span>
                                </div>
                                <div
                                    class="menu-item"
                                    :class="{ 'menu-item-active': activeMenu === 'assinaturas' }"
                                    @click="activeMenu = 'assinaturas'"
                                >
                                    <i class="pi pi-credit-card me-2"></i>
                                    <span>Minhas Assinaturas</span>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>

                <!-- Conteúdo -->
                <div class="col-md-9">
                    <!-- Dados Pessoais -->
                    <div v-show="activeMenu === 'dados'">
                        <div class="col-md-12 text-300">
                            <h4>Dados Pessoais</h4>
                        </div>

                        <!-- Nome Completo -->
                        <div class="col-md-12 mb-3">
                            <IftaLabel>
                                <InputText id="name" v-model="userData.name" class="w-full" size="small" disabled />
                                <label for="name">Nome Completo</label>
                            </IftaLabel>
                        </div>

                        <!-- Email -->
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <IftaLabel>
                                    <InputText id="email" v-model="userData.email" class="w-full" size="small" disabled />
                                    <label for="email">Email</label>
                                </IftaLabel>
                            </div>
                            <div class="col-md-6">
                                <IftaLabel>
                                    <InputText id="apelido" v-model="userData.apelido" class="w-full" size="small" disabled />
                                    <label for="apelido">Apelido</label>
                                </IftaLabel>
                            </div>
                        </div>

                        <!-- Telefone -->
                        <div class="col-md-6 mb-3">
                            <IftaLabel>
                                <InputText id="telefone" v-model="userData.telefone" class="w-full" size="small" disabled />
                                <label for="telefone">Telefone</label>
                            </IftaLabel>
                        </div>
                    </div>

                    <!-- Assinaturas -->
                    <div v-show="activeMenu === 'assinaturas'">
                        <Card>
                            <template #title>
                                <h4>Minhas Assinaturas</h4>
                            </template>
                            <template #content>
                                <DataTable
                                    :value="assinaturas"
                                    :loading="loading"
                                    paginator
                                    :rows="10"
                                    :rowsPerPageOptions="[5, 10, 25]"
                                    tableStyle="min-width: 50rem"
                                    class="assinaturas-table"
                                >
                                    <template #empty>
                                        <div class="text-center py-4">
                                            <i class="pi pi-info-circle text-500" style="font-size: 2rem;"></i>
                                            <p class="text-500 mt-2">Nenhuma assinatura encontrada</p>
                                        </div>
                                    </template>

                                    <Column field="data_inicio" header="Data Início" style="width: 12%">
                                        <template #body="slotProps">
                                            {{ formatDate(slotProps.data.data_inicio) }}
                                        </template>
                                    </Column>

                                    <Column field="data_fim" header="Data Fim" style="width: 12%">
                                        <template #body="slotProps">
                                            {{ formatDate(slotProps.data.data_fim) }}
                                        </template>
                                    </Column>

                                    <Column field="plano" header="Plano" style="width: 15%">
                                        <template #body="slotProps">
                                            <Badge
                                                :value="getPlanoLabel(slotProps.data.plano)"
                                                :severity="getPlanoSeverity(slotProps.data.plano)"
                                            />
                                        </template>
                                    </Column>

                                    <Column field="status" header="Status" style="width: 12%">
                                        <template #body="slotProps">
                                            <Badge
                                                :value="getStatusLabel(slotProps.data)"
                                                :severity="getStatusSeverity(slotProps.data)"
                                            />
                                        </template>
                                    </Column>

                                    <Column field="capture_method" header="Pagamento" style="width: 15%">
                                        <template #body="slotProps">
                                            <span class="payment-method">
                                                <i :class="getPaymentIcon(slotProps.data.capture_method)" class="me-2"></i>
                                                {{ getPaymentMethodName(slotProps.data.capture_method) }}
                                            </span>
                                        </template>
                                    </Column>

                                    <Column field="tipo_assinatura" header="Tipo" style="width: 12%">
                                        <template #body="slotProps">
                                            <Badge
                                                :value="getTipoAssinaturaLabel(slotProps.data.tipo_assinatura)"
                                                severity="info"
                                            />
                                        </template>
                                    </Column>

                                    <Column header="Ações" style="width: 10%">
                                        <template #body="slotProps">
                                            <Button
                                                icon="pi pi-eye"
                                                class="p-button-rounded p-button-info p-button-text"
                                                @click="visualizarRecibo(slotProps.data)"
                                                title="Visualizar Recibo"
                                            />
                                        </template>
                                    </Column>
                                </DataTable>
                            </template>
                        </Card>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dialog do Recibo -->
        <ReciboDialog
            :model-value="showReciboDialog"
            :assinatura="selectedAssinatura"
            @update:model-value="showReciboDialog = $event"
        />
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import ReciboDialog from '@/components/dialogs/users/Recibo.vue';
import Divider from 'primevue/divider';
import IftaLabel from 'primevue/iftalabel';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Card from 'primevue/card';

export default {
    name: 'UserSettings',
    components: {
        Header,
        ReciboDialog,
        Divider,
        IftaLabel,
        InputText,
        DataTable,
        Column,
        Button,
        Badge,
        Card
    },
    data() {
        return {
            activeMenu: 'dados',
            userData: {
                name: '',
                email: '',
                apelido: '',
                telefone: ''
            },
            assinaturas: [],
            loading: false,
            showReciboDialog: false,
            selectedAssinatura: null
        }
    },
    async mounted() {
        await this.carregarDadosUsuario();
        await this.carregarAssinaturas();
    },
    methods: {
        carregarDadosUsuario() {
            try {
                // Usar dados já disponíveis no localStorage (vêm do login)
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (!user.id) {
                    this.$router.push('/');
                    return;
                }

                // Concatenar nome + sobrenome e usar campos corretos
                this.userData = {
                    name: user.nome && user.sobrenome ? `${user.nome} ${user.sobrenome}` : '',
                    email: user.email || '',
                    apelido: user.apelido || '',
                    telefone: user.telefone || ''
                };
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar dados do usuário',
                    life: 3000
                });
                this.userData = {
                    name: '',
                    email: '',
                    apelido: '',
                    telefone: ''
                };
            }
        },

        async carregarAssinaturas() {
            try {
                this.loading = true;
                const response = await this.api.get('/assinaturas/minhas-assinaturas');
                this.assinaturas = response.data.data || [];
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar assinaturas',
                    life: 3000
                });
            } finally {
                this.loading = false;
            }
        },

        visualizarRecibo(assinatura) {
            this.selectedAssinatura = assinatura;
            this.showReciboDialog = true;
        },

        formatDate(dateString) {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        },

        getPlanoLabel(plano) {
            const labels = {
                '1_mes': '1 Mês',
                '3_meses': '3 Meses',
                '6_meses': '6 Meses'
            };
            return labels[plano] || plano;
        },

        getPlanoSeverity(plano) {
            const severities = {
                '1_mes': 'info',
                '3_meses': 'warning',
                '6_meses': 'success'
            };
            return severities[plano] || 'secondary';
        },

        getStatusLabel(assinatura) {
            const hoje = new Date();
            const dataFim = new Date(assinatura.data_fim);

            if (assinatura.status === 'aprovado' && dataFim >= hoje) {
                return 'Ativa';
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

        getPaymentMethodName(method) {
            const methods = {
                'credit_card': 'Cartão de Crédito',
                'pix': 'PIX',
                'boleto': 'Boleto'
            };
            return methods[method] || method || 'Não informado';
        },

        getPaymentIcon(method) {
            const icons = {
                'credit_card': 'pi pi-credit-card',
                'pix': 'pi pi-qrcode',
                'boleto': 'pi pi-file-pdf'
            };
            return icons[method] || 'pi pi-question-circle';
        },

        getTipoAssinaturaLabel(tipo) {
            const labels = {
                'mensal': 'Mensal',
                'trimestral': 'Trimestral',
                'semestral': 'Semestral'
            };
            return labels[tipo] || tipo;
        }
    }
}
</script>

<style scoped lang="scss">
.profile-menu-card {
    :deep(.p-card-body) {
        background-color: #121212;
        border-radius: 10px;
    }

    :deep(.p-card-content) {
        padding: 0;
    }
}

.profile-menu {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.menu-item {
    padding: 1rem;
    cursor: pointer;
    color: #888888;
    transition: all 0.3s;
    border-left: 3px solid transparent;

    &:hover {
        background-color: #1a1a1a;
        color: #ffffff;
    }

    &.menu-item-active {
        background-color: #1a1a1a;
        color: #f5cee1;
        border-left-color: #f5cee1;
    }

    i {
        font-size: 1.1rem;
    }
}

.assinaturas-table {
    :deep(.p-datatable-tbody > tr > td) {
        background-color: #1a1a1a;
        color: #ffffff;
        border-color: #333;
    }

    :deep(.p-datatable-thead > tr > th) {
        background-color: #121212;
        color: #ffffff;
        border-color: #333;
    }

    :deep(.p-paginator) {
        background-color: #121212;
        color: #ffffff;
        border-color: #333;
    }
}

.payment-method {
    display: flex;
    align-items: center;
    color: #ffffff;
}
</style>