<template>
    <div class="mb-5 user-settings-page">
        <Header />
        <div class="container px-6 settings-content">
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
                                <div
                                    class="menu-item"
                                    :class="{ 'menu-item-active': activeMenu === 'notificacoes' }"
                                    @click="activeMenu = 'notificacoes'"
                                >
                                    <i class="pi pi-bell me-2"></i>
                                    <span>Notificações</span>
                                </div>
                                <div
                                    class="menu-item menu-item-logout"
                                    @click="handleLogout"
                                >
                                    <i class="pi pi-sign-out me-2"></i>
                                    <span>Sair da conta</span>
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

                        <div class="avatar-section mb-4">
                            <div class="avatar-preview-wrap">
                                <Avatar
                                    :image="avatarPreview || userData.path_img_avatar || defaultAvatar"
                                    shape="circle"
                                    size="xlarge"
                                    class="avatar-preview"
                                />
                            </div>
                            <div class="avatar-actions">
                                <p class="avatar-hint">
                                    Esta foto aparece para a Beca na lista de conversas e no chat.
                                </p>
                                <input
                                    ref="avatarInput"
                                    type="file"
                                    class="hidden-file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    @change="onAvatarSelected"
                                />
                                <Botao
                                    texto="Escolher foto"
                                    icone="pi pi-camera"
                                    tema="rosa"
                                    tamanho="pequeno"
                                    :carregando="uploadingAvatar"
                                    @click="$refs.avatarInput.click()"
                                />
                                <Botao
                                    v-if="selectedAvatarFile"
                                    texto="Salvar foto"
                                    icone="pi pi-check"
                                    tema="rosa"
                                    tamanho="pequeno"
                                    :carregando="uploadingAvatar"
                                    @click="saveAvatar"
                                />
                                <Botao
                                    v-if="selectedAvatarFile"
                                    texto="Cancelar"
                                    icone="pi pi-times"
                                    tema="rosa"
                                    tipo="texto"
                                    tamanho="pequeno"
                                    :desabilitado="uploadingAvatar"
                                    @click="cancelAvatarSelect"
                                />
                            </div>
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
                                            <Botao
                                                icone="pi pi-eye"
                                                tema="azul"
                                                tipo="texto"
                                                tamanho="pequeno"
                                                @click="visualizarRecibo(slotProps.data)"
                                                title="Visualizar Recibo"
                                            />
                                        </template>
                                    </Column>
                                </DataTable>
                            </template>
                        </Card>
                    </div>

                    <!-- Notificações -->
                    <div v-show="activeMenu === 'notificacoes'">
                        <div class="col-md-12 text-300 mb-3">
                            <h4>Notificações</h4>
                        </div>

                        <Card class="notifications-card">
                            <template #content>
                                <div class="notification-row">
                                    <div class="notification-copy">
                                        <p class="notification-title">Novos posts por e-mail</p>
                                        <p class="notification-hint">
                                            Receba um e-mail sempre que a Becalima007 publicar um novo post.
                                            Disponível para assinantes com plano ativo.
                                        </p>
                                    </div>
                                    <ToggleSwitch
                                        v-model="notifyNewPostsEmail"
                                        :disabled="savingNotifyPreference"
                                        @update:modelValue="salvarPreferenciaNotificacao"
                                    />
                                </div>
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
import Botao from '@/components/ui/Botao.vue';
import Badge from 'primevue/badge';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import ToggleSwitch from 'primevue/toggleswitch';
import { performLogout } from '@/utils/logout';

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
        Botao,
        Badge,
        Card,
        Avatar,
        ToggleSwitch,
    },
    data() {
        return {
            activeMenu: 'dados',
            userData: {
                id: null,
                name: '',
                email: '',
                apelido: '',
                telefone: '',
                path_img_avatar: null,
            },
            defaultAvatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
            selectedAvatarFile: null,
            avatarPreview: null,
            uploadingAvatar: false,
            notifyNewPostsEmail: false,
            savingNotifyPreference: false,
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
    beforeUnmount() {
        this.revokeAvatarPreview();
    },
    methods: {
        async carregarDadosUsuario() {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (!user.id) {
                    this.$router.push('/home');
                    return;
                }

                this.userData = {
                    id: user.id,
                    name: user.nome && user.sobrenome ? `${user.nome} ${user.sobrenome}` : '',
                    email: user.email || '',
                    apelido: user.apelido || '',
                    telefone: user.telefone || '',
                    path_img_avatar: user.path_img_avatar || null,
                };
                this.notifyNewPostsEmail = !!user.notify_new_posts_email;

                // Atualiza preferências a partir da API (fonte da verdade)
                try {
                    const { data } = await this.api.get(`/users/${user.id}`, { skipLoading: true });
                    const fresh = data.data || data;
                    if (fresh?.path_img_avatar) {
                        this.userData.path_img_avatar = fresh.path_img_avatar;
                    }
                    if (typeof fresh?.notify_new_posts_email === 'boolean') {
                        this.notifyNewPostsEmail = fresh.notify_new_posts_email;
                    }
                    localStorage.setItem('user', JSON.stringify({
                        ...user,
                        path_img_avatar: this.userData.path_img_avatar,
                        notify_new_posts_email: this.notifyNewPostsEmail,
                    }));
                } catch {
                    // mantém localStorage
                }
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar dados do usuário',
                    life: 3000
                });
                this.userData = {
                    id: null,
                    name: '',
                    email: '',
                    apelido: '',
                    telefone: '',
                    path_img_avatar: null,
                };
            }
        },

        async salvarPreferenciaNotificacao(value) {
            if (!this.userData.id) return;

            const previous = !value;
            this.savingNotifyPreference = true;
            try {
                await this.api.patch(`/users/${this.userData.id}`, {
                    notify_new_posts_email: !!value,
                });

                this.notifyNewPostsEmail = !!value;
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({
                    ...user,
                    notify_new_posts_email: !!value,
                }));

                this.$toast.add({
                    severity: 'success',
                    summary: 'Preferência salva',
                    detail: value
                        ? 'Você receberá e-mails quando houver novos posts.'
                        : 'Notificações por e-mail desativadas.',
                    life: 3000,
                });
            } catch (e) {
                this.notifyNewPostsEmail = previous;
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Não foi possível salvar a preferência',
                    life: 3500,
                });
            } finally {
                this.savingNotifyPreference = false;
            }
        },

        revokeAvatarPreview() {
            if (this.avatarPreview) {
                URL.revokeObjectURL(this.avatarPreview);
                this.avatarPreview = null;
            }
        },

        onAvatarSelected(event) {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Arquivo inválido',
                    detail: 'Selecione uma imagem (JPG, PNG, WEBP ou GIF).',
                    life: 3000,
                });
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Arquivo grande',
                    detail: 'A foto deve ter no máximo 2MB.',
                    life: 3000,
                });
                return;
            }

            this.revokeAvatarPreview();
            this.selectedAvatarFile = file;
            this.avatarPreview = URL.createObjectURL(file);
        },

        cancelAvatarSelect() {
            this.selectedAvatarFile = null;
            this.revokeAvatarPreview();
        },

        async saveAvatar() {
            if (!this.selectedAvatarFile || !this.userData.id) return;

            this.uploadingAvatar = true;
            try {
                const form = new FormData();
                form.append('avatar', this.selectedAvatarFile);

                const { data } = await this.api.post(
                    `/users/${this.userData.id}/upload-avatar`,
                    form,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );

                const url = data.url || data.data?.path_img_avatar;
                this.userData.path_img_avatar = url;
                this.cancelAvatarSelect();

                const user = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({
                    ...user,
                    path_img_avatar: url,
                }));

                this.$toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Foto de perfil atualizada!',
                    life: 3000,
                });
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Não foi possível salvar a foto',
                    life: 3500,
                });
            } finally {
                this.uploadingAvatar = false;
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
        },

        async handleLogout() {
            await performLogout({ toast: this.$toast, router: this.$router });
        },
    }
}
</script>

<style scoped lang="scss">
.settings-content {
    margin-top: 1.5rem;
}

.avatar-section {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
    padding: 1rem;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    background: #121212;
}

.avatar-preview-wrap {
    flex-shrink: 0;
}

.avatar-preview {
    width: 5.5rem !important;
    height: 5.5rem !important;
}

.avatar-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.55rem;
}

.avatar-hint {
    margin: 0;
    color: #999;
    font-size: 0.85rem;
    line-height: 1.4;
    max-width: 22rem;
}

.notifications-card {
    :deep(.p-card-body),
    :deep(.p-card-content) {
        background-color: #121212;
        border-radius: 10px;
    }
}

.notification-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.25rem;
}

.notification-copy {
    min-width: 0;
}

.notification-title {
    margin: 0 0 0.35rem;
    color: #fff;
    font-weight: 600;
    font-size: 1rem;
}

.notification-hint {
    margin: 0;
    color: #999;
    font-size: 0.875rem;
    line-height: 1.45;
}

.hidden-file {
    display: none;
}

@media (max-width: 768px) {
    .settings-content {
        margin-top: 0.75rem;
        padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
    }

    .avatar-section {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .avatar-actions {
        align-items: center;
    }

    .notification-row {
        flex-direction: column;
        align-items: flex-start;
    }
}

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

    &.menu-item-logout {
        color: #ef4444;
        margin-top: 0.5rem;
        border-top: 1px solid #2a2a2a;

        &:hover {
            color: #f87171;
            background-color: #1a1a1a;
        }
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