<template>
    <div class="mb-5 profile-page">
        <Header />
        <div class="container px-6 settings-content">
            <div class="row">
                <div class="col-12 text-center text-white">
                    <h3>Configurar Perfil</h3>
                </div>
            </div>

            <Divider />

            <div class="row">
                <div class="col-md-3 mb-4">
                    <Card class="profile-menu-card">
                        <template #content>
                            <div class="profile-menu">
                                <div
                                    class="menu-item"
                                    :class="{ 'menu-item-active': activeMenu === 'perfil' }"
                                    @click="activeMenu = 'perfil'"
                                >
                                    <i class="pi pi-user me-2"></i>
                                    <span>Editar Perfil</span>
                                </div>
                                <div
                                    class="menu-item"
                                    :class="{ 'menu-item-active': activeMenu === 'post' }"
                                    @click="activeMenu = 'post'"
                                >
                                    <i class="pi pi-plus-circle me-2"></i>
                                    <span>Criar Post</span>
                                </div>
                                <div
                                    class="menu-item"
                                    :class="{ 'menu-item-active': activeMenu === 'chat' }"
                                    @click="activeMenu = 'chat'"
                                >
                                    <i class="pi pi-comments me-2"></i>
                                    <span>Configurar chat</span>
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

                <div class="col-md-9">
                    <div v-show="activeMenu === 'perfil'">
                        <AssinaturaForm ref="assinaturaFormRef" />

                        <Divider />

                        <SocialForm ref="socialFormRef" />

                        <Divider />

                        <SobreForm ref="sobreFormRef" />

                        <Divider />

                        <div class="row d-flex justify-content-end">
                            <div class="col-md-3">
                                <Button label="Salvar" severity="primary" class="w-full" @click="salvar" :loading="loading" />
                            </div>
                        </div>
                    </div>

                    <div v-show="activeMenu === 'post'">
                        <CreatePostForm ref="createPostFormRef" @post-created="handlePostCreated" />
                    </div>

                    <div v-show="activeMenu === 'chat'">
                        <ChatConfigForm ref="chatConfigFormRef" :user-id="userId" />

                        <Divider />

                        <div class="row d-flex justify-content-end">
                            <div class="col-md-3">
                                <Button
                                    label="Salvar pacote"
                                    severity="primary"
                                    class="w-full"
                                    @click="salvarChat"
                                    :loading="loadingChat"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import AssinaturaForm from '@/components/forms/profile/AssinaturaForm.vue';
import SocialForm from '@/components/forms/profile/SocialForm.vue';
import SobreForm from '@/components/forms/profile/SobreForm.vue';
import CreatePostForm from '@/components/forms/profile/CreatePostForm.vue';
import ChatConfigForm from '@/components/forms/profile/ChatConfigForm.vue';
import Divider from 'primevue/divider';
import Button from 'primevue/button';
import Card from 'primevue/card';
import { performLogout } from '@/utils/logout';

export default {
    name: 'Profile',
    components: {
        Header,
        AssinaturaForm,
        SocialForm,
        SobreForm,
        CreatePostForm,
        ChatConfigForm,
        Divider,
        Button,
        Card,
    },
    data() {
        return {
            dadosFormulario: null,
            loading: false,
            loadingChat: false,
            userId: null,
            activeMenu: 'perfil',
        };
    },
    async mounted() {
        await this.carregarDadosUsuario();
    },
    methods: {
        async carregarDadosUsuario() {
            try {
                this.loading = true;
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                this.userId = user.id;

                if (!this.userId) {
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Usuário não encontrado',
                        life: 3000,
                    });
                    this.$router.push('/home');
                    return;
                }

                const response = await this.api.get(`/users/${this.userId}`);
                const userData = response.data.data;

                if (this.$refs.assinaturaFormRef && userData) {
                    this.$refs.assinaturaFormRef.preencherDados({
                        assinatura_mensal: this.formatarMoeda(userData.valor_assinatura_mensal),
                        desconto_trimestral: userData.valor_desconto_trimestral || 0,
                        desconto_semestral: userData.valor_desconto_semestral || 0,
                        valor_trimestral: this.formatarMoeda(userData.valor_assinatura_trimestral),
                        valor_semestral: this.formatarMoeda(userData.valor_assinatura_semestral),
                    });
                }

                if (this.$refs.socialFormRef && userData) {
                    this.$refs.socialFormRef.preencherDados({
                        instagram: userData.instagram || '',
                        telegram: userData.telegram || '',
                        whatsapp: userData.whatsapp || '',
                        x_twitter: userData.x_twitter || '',
                        tiktok: userData.tiktok || '',
                        facebook: userData.facebook || '',
                        privacy: userData.privacy || '',
                    });
                }

                if (this.$refs.sobreFormRef && userData) {
                    this.$refs.sobreFormRef.preencherDados({
                        sobre: userData.sobre || '',
                    });
                }

                if (this.$refs.chatConfigFormRef && userData) {
                    this.$refs.chatConfigFormRef.preencherDados({
                        pacote_midia_chat: this.formatarMoeda(userData.valor_pacote_midia_chat),
                        pacote_audio_chat: this.formatarMoeda(userData.valor_pacote_audio_chat),
                        wallpaper_desktop: userData.chat_wallpaper_desktop || null,
                        wallpaper_mobile: userData.chat_wallpaper_mobile || null,
                    });
                }
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar dados do usuário',
                    life: 3000,
                });
            } finally {
                this.loading = false;
            }
        },
        formatarMoeda(valor) {
            if (!valor || valor === 0) return 'R$ 0,00';
            return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
        },
        async salvar() {
            try {
                this.loading = true;
                const dadosAssinatura = this.$refs.assinaturaFormRef.dadosAssinatura();
                const dadosSocial = this.$refs.socialFormRef.dados;
                const dadosSobre = this.$refs.sobreFormRef.dados;

                const valorMensal = this.converterValorFormatado(dadosAssinatura.assinatura_mensal);
                const valorTrimestral = this.converterValorFormatado(dadosAssinatura.valor_trimestral);
                const valorSemestral = this.converterValorFormatado(dadosAssinatura.valor_semestral);

                const dadosParaSalvar = {
                    valor_assinatura_mensal: valorMensal,
                    valor_assinatura_trimestral: valorTrimestral,
                    valor_assinatura_semestral: valorSemestral,
                    valor_desconto_trimestral: dadosAssinatura.desconto_trimestral,
                    valor_desconto_semestral: dadosAssinatura.desconto_semestral,
                    instagram: dadosSocial.instagram,
                    telegram: dadosSocial.telegram,
                    whatsapp: dadosSocial.whatsapp,
                    x_twitter: dadosSocial.x_twitter,
                    tiktok: dadosSocial.tiktok,
                    facebook: dadosSocial.facebook,
                    privacy: dadosSocial.privacy,
                    sobre: dadosSobre.sobre,
                };

                await this.api.put(`/users/${this.userId}`, dadosParaSalvar);

                this.$toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Perfil atualizado com sucesso!',
                    life: 3000,
                });
            } catch (error) {
                let errorMessage = 'Erro ao salvar dados';
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                }
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: errorMessage,
                    life: 3000,
                });
            } finally {
                this.loading = false;
            }
        },
        async salvarChat() {
            try {
                this.loadingChat = true;
                const dadosChat = this.$refs.chatConfigFormRef.dadosChat();
                const valorPacoteMidia = this.converterValorFormatado(dadosChat.pacote_midia_chat);
                const valorPacoteAudio = this.converterValorFormatado(dadosChat.pacote_audio_chat);

                await this.api.put(`/users/${this.userId}`, {
                    valor_pacote_midia_chat: valorPacoteMidia,
                    valor_pacote_audio_chat: valorPacoteAudio,
                });

                this.$toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Configurações do chat salvas!',
                    life: 3000,
                });
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error.response?.data?.message || 'Erro ao salvar chat',
                    life: 3000,
                });
            } finally {
                this.loadingChat = false;
            }
        },
        converterValorFormatado(valorFormatado) {
            if (!valorFormatado || valorFormatado === '') return null;
            const valorLimpo = valorFormatado
                .replace(/R\$\s*/g, '')
                .replace(/\./g, '')
                .replace(',', '.');
            const numero = parseFloat(valorLimpo);
            return isNaN(numero) ? null : numero;
        },
        handlePostCreated() {
            this.$toast.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Post criado com sucesso!',
                life: 3000,
            });
        },
        async handleLogout() {
            await performLogout({ toast: this.$toast, router: this.$router });
        },
    },
};
</script>

<style scoped lang="scss">
.settings-content {
    margin-top: 1.5rem;
}

@media (max-width: 768px) {
    .settings-content {
        margin-top: 0.75rem;
        padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
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
</style>
