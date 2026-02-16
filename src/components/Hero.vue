<template>
    <Card class="text-white">
        <template #title>
            <div class="relative">
                <div class="w-full banner-container" @mouseenter="showBannerOverlay = isAdmin()" @mouseleave="showBannerOverlay = false">
                    <img :src="dados.path_img_banner || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'" alt="Capa do perfil">
                    <div v-if="showBannerOverlay" class="image-overlay" @click="openBannerDialog">
                        <i class="fa-solid fa-camera fa-2x"></i>
                    </div>
                </div>
                <div class="absolute avatar avatar-container" @mouseenter="showAvatarOverlay = isAdmin()" @mouseleave="showAvatarOverlay = false">
                    <img
                        :src="dados.path_img_avatar || 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'"
                        alt="Avatar"
                        class="avatar-image"
                    />
                    <div v-if="showAvatarOverlay" class="image-overlay avatar-overlay" @click="openAvatarDialog">
                        <i class="fa-solid fa-camera fa-lg"></i>
                    </div>
                </div>
            </div>
        </template>
        <template #content>
            <div class="mt-5 p-3">
                <div class="row">
                    <div class="d-flex flex-column">
                        <div class="d-flex justify-content-between">
                            <div class="d-flex flex-column">
                                <p class="font-bold text-white">{{ dados.nome }} {{ dados.sobrenome }}</p>
                                <p class="text-white">@{{ dados.apelido }}</p>
                                <Badge
                                    v-if="!userState.isAdmin && userState.isLoggedIn"
                                    :value="statusAssinaturaUsuario"
                                    :severity="getStatusSeverity(statusAssinaturaUsuario)"
                                    :class="getBadgeClasses(statusAssinaturaUsuario)"
                                />
                            </div>
                        </div>
                        <p class="text-white">
                            {{ dados.sobre }}
                        </p>
                    </div>
                </div>

                <div class="row mt-3">
                    <div class="social-buttons d-flex flex-wrap">
                        <a v-if="dados.instagram" :href="dados.instagram" target="_blank" class="social-button instagram" aria-label="Instagram">
                            <i class="fa-brands fa-instagram"></i>
                        </a>
                        <a v-if="dados.telegram" :href="dados.telegram" target="_blank" class="social-button telegram" aria-label="Telegram">
                            <i class="fa-brands fa-telegram"></i>
                        </a>
                        <a v-if="dados.whatsapp" :href="'https://wa.me/' + dados.whatsapp.replace(/\D/g, '')" target="_blank" class="social-button whatsapp" aria-label="WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i>
                        </a>
                        <a v-if="dados.x_twitter" :href="dados.x_twitter" target="_blank" class="social-button x-twitter" aria-label="X (Twitter)">
                            <i class="fa-brands fa-x-twitter"></i>
                        </a>
                        <a v-if="dados.tiktok" :href="dados.tiktok" target="_blank" class="social-button tiktok" aria-label="TikTok">
                            <i class="fa-brands fa-tiktok"></i>
                        </a>
                        <a v-if="dados.facebook" :href="dados.facebook" target="_blank" class="social-button facebook" aria-label="Facebook">
                            <i class="fa-brands fa-facebook"></i>
                        </a>
                        <a v-if="dados.privacy" :href="dados.privacy" target="_blank" class="social-button privacy" aria-label="Privacy">
                            <i class="fa-solid fa-lock"></i>
                        </a>
                    </div>
                </div>

                <div v-if="shouldShowSubscriptionButtons" class="row mt-3">
                    <span class="text-white font-bold">Assinatura</span>

                    <div class="p-2 d-flex flex-wrap gap-2">
                        <Button
                            severity="primary"
                            class="d-flex justify-content-between align-items-center w-full"
                            @click="gerarLinkPagamento('1_mes')"
                            :loading="loadingPagamento"
                        >
                            <span class="ms-4 font-bold">1 mês</span>
                            <span class="me-4 font-bold">{{ valorMensal }}</span>
                        </Button>
                        <Button
                            severity="primary"
                            class="d-flex justify-content-between align-items-center w-full"
                            @click="gerarLinkPagamento('3_meses')"
                            :loading="loadingPagamento"
                        >
                            <span class="ms-4 font-bold">3 meses</span>
                            <span class="me-4 font-bold">{{ valorTrimestral }}</span>
                        </Button>
                        <Button
                            severity="primary"
                            class="d-flex justify-content-between align-items-center w-full"
                            @click="gerarLinkPagamento('6_meses')"
                            :loading="loadingPagamento"
                        >
                            <span class="ms-4 font-bold">6 meses</span>
                            <span class="me-4 font-bold">{{ valorSemestral }}</span>
                        </Button>
                    </div>
                </div>

                <!-- Botão para dashboard da enquete (apenas para admin) -->
                <div v-if="isAdmin()" class="row mt-3">
                    <span class="text-white font-bold">Administração</span>

                    <div class="p-2 d-flex flex-wrap gap-2">
                        <Button
                            severity="warning"
                            class="d-flex justify-content-center align-items-center w-full"
                            @click="irParaDashboardEnquete"
                        >
                            <i class="pi pi-chart-bar me-2"></i>
                            <span class="font-bold">Dashboard Enquete Chat</span>
                        </Button>
                    </div>
                </div>

            </div>
        </template>
    </Card>

    <!-- Dialog para alterar banner -->
    <Dialog
        v-model:visible="showBannerDialog"
        modal
        header="Alterar Banner"
        :style="{ width: '30rem' }"
        :closable="true"
    >
        <div class="mb-4">
            <FileUpload
                mode="basic"
                accept="image/*"
                :maxFileSize="5000000"
                @select="onBannerSelect"
                chooseLabel="Selecionar Imagem"
                class="w-full"
            />
        </div>
        <div v-if="previewBanner" class="mb-4">
            <img :src="previewBanner" alt="Preview" class="preview-image" />
        </div>
        <div class="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" @click="closeBannerDialog" />
            <Button label="Salvar" severity="primary" @click="saveBanner" :disabled="!previewBanner" />
        </div>
    </Dialog>

    <!-- Dialog para alterar avatar -->
    <Dialog
        v-model:visible="showAvatarDialog"
        modal
        header="Alterar Avatar"
        :style="{ width: '30rem' }"
        :closable="true"
    >
        <div class="mb-4">
            <FileUpload
                mode="basic"
                accept="image/*"
                :maxFileSize="5000000"
                @select="onAvatarSelect"
                chooseLabel="Selecionar Imagem"
                class="w-full"
            />
        </div>
        <div v-if="previewAvatar" class="mb-4 d-flex justify-content-center">
            <Avatar :image="previewAvatar" shape="circle" size="xlarge" />
        </div>
        <div class="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" @click="closeAvatarDialog" />
            <Button label="Salvar" severity="primary" @click="saveAvatar" :disabled="!previewAvatar" />
        </div>
    </Dialog>

    <!-- Dialog de login para assinatura -->
    <LoginDialog
        :model-value="showLoginDialog"
        :show-subscription-message="true"
        @update:model-value="showLoginDialog = $event"
        @open-register="openRegisterDialog"
        @logged-in="handleLoggedIn"
    />

    <!-- Dialog de cadastro -->
    <RegisterDialog
        v-model="showRegisterDialog"
        @open-login="openLoginDialog"
        @registered="handleLoggedIn"
    />

</template>

<script>
import Card from 'primevue/card';
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import FileUpload from 'primevue/fileupload';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import LoginDialog from './dialogs/user/Login.vue';
import RegisterDialog from './dialogs/user/Register.vue';
import { Menu } from 'primevue';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { statusAssinatura } from '@/utils/global';

export default {
    name: 'Hero',
    props: {
        userData: {
            type: Object,
            default: null
        }
    },
    components: {
        Card,
        SelectButton,
        Button,
        Dialog,
        FileUpload,
        Avatar,
        Badge,
        LoginDialog,
        RegisterDialog,
        Menu
    },
    data() {
        return {
            dados: {
                nome: '',
                sobrenome: '',
                apelido: '',
                sobre: '',
                instagram: '',
                tiktok: '',
                facebook: '',
                telegram: '',
                whatsapp: '',
                x_twitter: '',
                privacy: '',
                path_img_banner: '', // Mantido hardcoded
                path_img_avatar: null // Mantido hardcoded
            },
            statusAssinaturaUsuario: 'Sem Assinatura',
            userState: {
                isLoggedIn: false,
                isAdmin: false,
                hasAssinatura: false
            },
            items: [
                {
                    label: 'Refresh',
                    icon: 'pi pi-refresh'
                },
                {
                    label: 'Export',
                    icon: 'pi pi-upload'
                }
            ],
            loading: false,
            showBannerOverlay: false,
            showAvatarOverlay: false,
            showBannerDialog: false,
            showAvatarDialog: false,
            previewBanner: null,
            previewAvatar: null,
            selectedBannerFile: null,
            selectedAvatarFile: null,
            loadingPagamento: false,
            showLoginDialog: false,
            showRegisterDialog: false
        }
    },
    setup() {
        const authStore = useAuthStore();
        const { updateTrigger } = storeToRefs(authStore);
        return { authStore, updateTrigger };
    },
    mounted() {
        this.preencherDados();
        this.updateUserState();
        // Escutar mudanças no localStorage
        window.addEventListener('storage', this.handleStorageChange);
    },
    beforeUnmount() {
        window.removeEventListener('storage', this.handleStorageChange);
    },
    computed: {
        hasActiveSubscription() {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.assinatura === true;
        },
        valorMensal() {
            if (!this.userData || !this.userData.valor_assinatura_mensal) {
                return 'R$ 0,00';
            }
            return this.formatarMoeda(this.userData.valor_assinatura_mensal);
        },
        valorTrimestral() {
            if (!this.userData || !this.userData.valor_assinatura_trimestral) {
                return 'R$ 0,00';
            }
            const valorBase = parseFloat(this.userData.valor_assinatura_trimestral);
            const descontoPercentual = parseFloat(this.userData.valor_desconto_trimestral || 0) / 100;
            const valorFinal = valorBase * (1 - descontoPercentual);
            return this.formatarMoeda(valorFinal);
        },
        valorSemestral() {
            if (!this.userData || !this.userData.valor_assinatura_semestral) {
                return 'R$ 0,00';
            }
            const valorBase = parseFloat(this.userData.valor_assinatura_semestral);
            const descontoPercentual = parseFloat(this.userData.valor_desconto_semestral || 0) / 100;
            const valorFinal = valorBase * (1 - descontoPercentual);
            return this.formatarMoeda(valorFinal);
        },
        shouldShowSubscriptionButtons() {
            // Não mostrar botões para administradores
            if (this.isAdmin()) {
                return false;
            }

            // Se usuário estiver deslogado, mostrar botões
            if (!this.userState.isLoggedIn) {
                return true;
            }

            // Se usuário estiver logado mas não tiver assinatura ativa, mostrar botões
            if (this.userState.isLoggedIn && !this.userState.hasAssinatura) {
                return true;
            }

            // Verificação adicional pelo status da assinatura
            if (this.statusAssinatura() !== 'aprovado') {
                return true;
            }

            return false;
        }
    },
    watch: {
        userData: {
            handler() {
                this.preencherDados();
            },
            deep: true,
            immediate: true
        },
        updateTrigger: {
            handler() {
                // Quando há mudanças na autenticação, atualizar estado do usuário
                this.updateUserState();
                this.carregarStatusAssinaturaUsuario();
            },
            immediate: true
        }
    },
    methods: {
        preencherDados() {
            if (!this.userData) {
                return;
            }

            // Preencher dados do perfil público (becaLima007)
            this.dados.nome = this.userData.nome || '';
            this.dados.sobrenome = this.userData.sobrenome || '';
            this.dados.apelido = this.userData.apelido || '';
            this.dados.sobre = this.userData.sobre || '';
            this.dados.instagram = this.userData.instagram || '';
            this.dados.tiktok = this.userData.tiktok || '';
            this.dados.facebook = this.userData.facebook || '';
            this.dados.telegram = this.userData.telegram || '';
            this.dados.whatsapp = this.userData.whatsapp || '';
            this.dados.x_twitter = this.userData.x_twitter || '';
            this.dados.privacy = this.userData.privacy || '';
            // Preencher imagens do backend
            this.dados.path_img_banner = this.userData.path_img_banner || '';
            this.dados.path_img_avatar = this.userData.path_img_avatar || null;

            // Carregar status da assinatura do usuário logado
            this.carregarStatusAssinaturaUsuario();
        },
        carregarStatusAssinaturaUsuario() {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                this.statusAssinaturaUsuario = user.status_assinatura_descricao || 'Sem Assinatura';
            } catch (error) {
                console.error('Erro ao carregar status da assinatura:', error);
                this.statusAssinaturaUsuario = 'Sem Assinatura';
            }
        },
        updateUserState() {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                this.userState = {
                    isLoggedIn: !!user.id && !!localStorage.getItem('token'),
                    isAdmin: user.is_admin === true || user.is_admin === 'true' || user.is_admin === 1,
                    hasAssinatura: user.assinatura === true || user.assinatura === 'true' || user.assinatura === 1
                };
            } catch (error) {
                console.error('Erro ao atualizar estado do usuário:', error);
                this.userState = {
                    isLoggedIn: false,
                    isAdmin: false,
                    hasAssinatura: false
                };
            }
        },
        handleStorageChange(event) {
            // Atualizar estado quando localStorage mudar
            if (event.key === 'user' || event.key === 'token') {
                this.updateUserState();
                this.carregarStatusAssinaturaUsuario();
            }
        },
        getStatusSeverity(status) {
            const severities = {
                'Assinatura Ativa': 'success',
                'Assinatura À Vencer': 'warning',
                'Assinatura Vencida': 'danger',
                'PENDENTE': 'warning',
                'Sem Assinatura': 'secondary'
            };
            return severities[status] || 'secondary';
        },
        getBadgeClasses(status) {
            const baseClasses = 'mt-2 mb-3';

            if (status === 'Assinatura Pendente') {
                return `${baseClasses} badge-pendente`;
            }

            return baseClasses;
        },
        formatarMoeda(valor) {
            if (!valor || valor === 0) return 'R$ 0,00';
            return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
        },
        toggle(event) {
            this.$refs.menu.toggle(event);
        },
        navigateTo(path) {
            this.$router.push(path);
        },
        openBannerDialog() {
            this.showBannerDialog = true;
            this.previewBanner = null;
            this.selectedBannerFile = null;
        },
        closeBannerDialog() {
            this.showBannerDialog = false;
            this.previewBanner = null;
            this.selectedBannerFile = null;
        },
        openAvatarDialog() {
            this.showAvatarDialog = true;
            this.previewAvatar = null;
            this.selectedAvatarFile = null;
        },
        closeAvatarDialog() {
            this.showAvatarDialog = false;
            this.previewAvatar = null;
            this.selectedAvatarFile = null;
        },
        onBannerSelect(event) {
            const file = event.files[0];
            if (file) {
                this.selectedBannerFile = file;
                // Criar URL local para preview
                this.previewBanner = URL.createObjectURL(file);
            }
        },
        onAvatarSelect(event) {
            const file = event.files[0];
            if (file) {
                this.selectedAvatarFile = file;
                // Criar URL local para preview
                this.previewAvatar = URL.createObjectURL(file);
            }
        },
        async saveBanner() {
            if (!this.selectedBannerFile) {
                return;
            }

            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const userId = user.id;

                if (!userId) {
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Usuário não encontrado',
                        life: 3000
                    });
                    return;
                }

                const formData = new FormData();
                formData.append('banner', this.selectedBannerFile);

                const response = await this.api.post(`/users/${userId}/upload-banner`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // Atualizar a imagem do banner com a URL retornada
                this.dados.path_img_banner = response.data.url;
                this.closeBannerDialog();

                this.$toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Banner atualizado com sucesso!',
                    life: 3000
                });
            } catch (error) {
                let errorMessage = 'Erro ao atualizar banner';
                if (error.response && error.response.data) {
                    if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    }
                }
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: errorMessage,
                    life: 3000
                });
            }
        },
        async saveAvatar() {
            if (!this.selectedAvatarFile) {
                return;
            }

            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const userId = user.id;

                if (!userId) {
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Usuário não encontrado',
                        life: 3000
                    });
                    return;
                }

                const formData = new FormData();
                formData.append('avatar', this.selectedAvatarFile);

                const response = await this.api.post(`/users/${userId}/upload-avatar`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // Atualizar a imagem do avatar com a URL retornada
                this.dados.path_img_avatar = response.data.url;
                this.closeAvatarDialog();

                this.$toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Avatar atualizado com sucesso!',
                    life: 3000
                });
            } catch (error) {
                let errorMessage = 'Erro ao atualizar avatar';
                if (error.response && error.response.data) {
                    if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    }
                }
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: errorMessage,
                    life: 3000
                });
            }
        },
        async gerarLinkPagamento(plano) {

            if (!this.userState.isLoggedIn) {
                // Se não estiver logado, mostrar dialog de login necessário
                this.showLoginDialog = true;
                return;
            }

            if (!this.userData) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Dados do usuário não carregados',
                    life: 3000
                });
                return;
            }

            // Calcular valor baseado no plano
            let valorCalculado = 0;
            switch (plano) {
                case '1_mes':
                    valorCalculado = parseFloat(this.userData.valor_assinatura_mensal || 0);
                    break;
                case '3_meses':
                    const valorTrimestralBase = parseFloat(this.userData.valor_assinatura_trimestral || 0);
                    const descontoTrimestralPercentual = parseFloat(this.userData.valor_desconto_trimestral || 0) / 100;
                    valorCalculado = valorTrimestralBase * (1 - descontoTrimestralPercentual);
                    break;
                case '6_meses':
                    const valorSemestralBase = parseFloat(this.userData.valor_assinatura_semestral || 0);
                    const descontoSemestralPercentual = parseFloat(this.userData.valor_desconto_semestral || 0) / 100;
                    valorCalculado = valorSemestralBase * (1 - descontoSemestralPercentual);
                    break;
            }

            if (!valorCalculado || valorCalculado <= 0) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: `Valor da assinatura ${plano} não definido ou inválido: ${valorCalculado}`,
                    life: 3000
                });
                return;
            }

            this.loadingPagamento = true;

            try {
                console.log('Enviando dados para gerar link:', { plano, valorCalculado });

                const response = await this.api.post('/assinaturas/gerar-link-pagamento', {
                    plano: plano,
                    valor: valorCalculado
                });

                console.log('Resposta recebida:', response);

                if (response.data.success && response.data.link) {
                    // Redirecionar para o link de pagamento
                    window.location.href = response.data.link;
                } else {
                    throw new Error('Link de pagamento não gerado');
                }

            } catch (error) {
                let errorMessage = 'Erro ao gerar link de pagamento';

                if (error.response && error.response.data) {
                    if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    }
                }

                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: errorMessage,
                    life: 5000
                });
            } finally {
                this.loadingPagamento = false;
            }
        },
        openRegisterDialog() {
            this.showLoginDialog = false;
            this.showRegisterDialog = true;
        },
        openLoginDialog() {
            this.showRegisterDialog = false;
            this.showLoginDialog = true;
        },
        handleLoggedIn() {
            this.updateUserState();
            this.carregarStatusAssinaturaUsuario();
        },
        irParaDashboardEnquete() {
            this.$router.push('/admin/enquete');
        }
    }
}
</script>

<style scoped lang="scss">
:deep(.p-card) {
    border-radius: 10px;
    padding: 0 !important;
}

:deep(.p-card-body) {
    background-color: #121212;
    border-radius: 10px;
}

:deep(.p-card-content) {
    background-color: #121212;
    border-radius: 30px 0;
}

.avatar-image {
    border: 3px solid #121212;
    height: 6rem;
    width: 6rem;
    border-radius: 50%;
    object-fit: cover;
    object-position: center;
    display: block;
}

img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 10px 0 0 0;
}

.avatar {
    left: 30px;
    top: 110px;
}

.social-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 1rem;
    text-decoration: none;
    color: #ffffff;
    background-color: #1e1e1e;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: background-color 0.15s ease-out, border-color 0.15s ease-out, transform 0.1s ease-out;
    margin-right: 0.4rem;
}

.social-button i {
    font-size: 1.1rem;
}

.social-button:hover {
    transform: translateY(-1px);
    background-color: #252525;
    border-color: rgba(255, 255, 255, 0.2);
}

.social-button:active {
    transform: translateY(0);
}

.social-button.instagram {
    color: #e1306c;
}

.social-button.telegram {
    color: #29b6f6;
}

.social-button.whatsapp {
    color: #25d366;
}

.social-button.x-twitter {
    color: #ffffff;
}

.social-button.tiktok {
    color: #ffffff;
}

.social-button.facebook {
    color: #1877f2;
}

.social-button.privacy {
    color: #ffffff;
}

.image-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 10px;
    border-radius: 999px;
    background-color: #1e1e1e;
    border: 1px solid rgba(255, 255, 255, 0.08);
    text-decoration: none;
    transition: background-color 0.15s ease-out, border-color 0.15s ease-out, transform 0.1s ease-out;
}

.image-button img {
    max-height: 18px;
    width: auto;
    display: block;
}

.image-button:hover {
    transform: translateY(-1px);
    background-color: #252525;
    border-color: rgba(255, 255, 255, 0.2);
}

.image-button:active {
    transform: translateY(0);
}

.banner-container,
.avatar-container {
    position: relative;
    cursor: pointer;
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px 0 0 0;
    transition: background-color 0.2s ease;
}

.image-overlay:hover {
    background-color: rgba(0, 0, 0, 0.7);
}

.image-overlay i {
    color: #ffffff;
}

.avatar-overlay {
    border-radius: 50%;
    width: 6rem !important;
    height: 6rem !important;
    top: -15px !important;
    left: -15px !important;
}

.preview-image {
    width: 100%;
    max-height: 300px;
    object-fit: cover;
    border-radius: 8px;
}

/* Customização da badge PENDENTE */
:deep(.badge-pendente) {
    color: #c2185b !important; /* Rosa escuro */
    font-weight: 600;
}
</style>