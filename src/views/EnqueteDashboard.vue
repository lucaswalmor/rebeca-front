<template>
    <div class="p-4 container">
        <div class="text-center mb-4">
            <h1 class="text-3xl font-bold mb-2">Dashboard Enquete Chat</h1>
            <p class="text-gray-600">Estatísticas e participação dos usuários na enquete</p>
        </div>

        <!-- Cards de Estatísticas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <!-- Total de Usuários -->
            <Card class="bg-blue-50 border-blue-200">
                <template #content>
                    <div class="text-center">
                        <i class="pi pi-users text-4xl text-blue-600 mb-2"></i>
                        <h3 class="text-lg font-semibold text-blue-800">Total de Usuários</h3>
                        <p class="text-3xl font-bold text-blue-900">{{ estatisticas.total_usuarios }}</p>
                    </div>
                </template>
            </Card>

            <!-- Usuários que Votaram -->
            <Card class="bg-green-50 border-green-200">
                <template #content>
                    <div class="text-center">
                        <i class="pi pi-check-circle text-4xl text-green-600 mb-2"></i>
                        <h3 class="text-lg font-semibold text-green-800">Votaram</h3>
                        <p class="text-3xl font-bold text-green-900">{{ estatisticas.usuarios_votaram }}</p>
                    </div>
                </template>
            </Card>

            <!-- Porcentagem de Votação -->
            <Card class="bg-purple-50 border-purple-200">
                <template #content>
                    <div class="text-center">
                        <i class="pi pi-percentage text-4xl text-purple-600 mb-2"></i>
                        <h3 class="text-lg font-semibold text-purple-800">Taxa de Participação</h3>
                        <p class="text-3xl font-bold text-purple-900">{{ estatisticas.porcentagem_votacao }}%</p>
                    </div>
                </template>
            </Card>

            <!-- Usuários que Faltam Votar -->
            <Card class="bg-orange-50 border-orange-200">
                <template #content>
                    <div class="text-center">
                        <i class="pi pi-clock text-4xl text-orange-600 mb-2"></i>
                        <h3 class="text-lg font-semibold text-orange-800">Faltam Votar</h3>
                        <p class="text-3xl font-bold text-orange-900">{{ estatisticas.usuarios_faltam }}</p>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Cards de Votos -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <!-- Votos Positivos -->
            <Card class="bg-emerald-50 border-emerald-200">
                <template #content>
                    <div class="text-center">
                        <i class="pi pi-thumbs-up text-4xl text-emerald-600 mb-2"></i>
                        <h3 class="text-lg font-semibold text-emerald-800">Votos "Sim"</h3>
                        <p class="text-3xl font-bold text-emerald-900">{{ estatisticas.votos_positivos }}</p>
                    </div>
                </template>
            </Card>

            <!-- Votos Negativos -->
            <Card class="bg-red-50 border-red-200">
                <template #content>
                    <div class="text-center">
                        <i class="pi pi-thumbs-down text-4xl text-red-600 mb-2"></i>
                        <h3 class="text-lg font-semibold text-red-800">Votos "Não"</h3>
                        <p class="text-3xl font-bold text-red-900">{{ estatisticas.votos_negativos }}</p>
                    </div>
                </template>
            </Card>
        </div>

        <!-- DataTable -->
        <Card>
            <template #header>
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-bold">Lista de Usuários</h2>
                    <Button
                        label="Atualizar"
                        icon="pi pi-refresh"
                        @click="carregarDados"
                        :loading="loading"
                        severity="secondary"
                    />
                </div>
            </template>

            <template #content>
                <DataTable
                    :value="usuarios"
                    :loading="loading"
                    paginator
                    :rows="10"
                    :rowsPerPageOptions="[5, 10, 25, 50]"
                    tableStyle="min-width: 50rem"
                    class="p-datatable-sm"
                >
                    <Column field="apelido" header="Apelido" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            <span class="font-medium">{{ slotProps.data.apelido }}</span>
                        </template>
                    </Column>

                    <Column field="votou" header="Status" sortable style="min-width: 10rem">
                        <template #body="slotProps">
                            <Tag
                                :value="slotProps.data.votou ? 'Votou' : 'Não votou'"
                                :severity="slotProps.data.votou ? 'success' : 'warning'"
                                :icon="slotProps.data.votou ? 'pi pi-check' : 'pi pi-clock'"
                            />
                        </template>
                    </Column>

                    <template #empty>
                        <div class="text-center py-4">
                            <i class="pi pi-info-circle text-4xl text-gray-400 mb-2"></i>
                            <p class="text-gray-500">Nenhum usuário encontrado</p>
                        </div>
                    </template>
                </DataTable>
            </template>
        </Card>
    </div>
</template>

<script>
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

export default {
    name: 'EnqueteDashboard',
    components: {
        Card,
        DataTable,
        Column,
        Button,
        Tag
    },
    data() {
        return {
            loading: false,
            estatisticas: {
                total_usuarios: 0,
                usuarios_votaram: 0,
                usuarios_faltam: 0,
                porcentagem_votacao: 0,
                porcentagem_faltam: 0,
                votos_positivos: 0,
                votos_negativos: 0
            },
            usuarios: []
        }
    },
    async mounted() {
        await this.carregarDados();
    },
    methods: {
        async carregarDados() {
            try {
                this.loading = true;

                const response = await this.api.get('/chat-enquete/dashboard');
                const { estatisticas, usuarios } = response.data.data;

                this.estatisticas = estatisticas;
                this.usuarios = usuarios;

            } catch (error) {
                console.error('Erro ao carregar dados do dashboard:', error);
                this.$toast?.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar dados do dashboard',
                    life: 3000
                });
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>

<style scoped>
:deep(.p-card) {
    border-radius: 12px;
}

:deep(.p-card .p-card-body) {
    padding: 1.5rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.75rem 1rem;
}
</style>