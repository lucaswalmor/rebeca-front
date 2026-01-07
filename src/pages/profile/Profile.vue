<template>
    <div class="mb-5">
        <Header />
        <div class="container px-6 mt-6">
            <div class="row">
                <div class="col-12 text-center text-white">
                    <h3>Configurar Perfil</h3>
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
                            </div>
                        </template>
                    </Card>
                </div>

                <!-- Conteúdo -->
                <div class="col-md-9">
                    <!-- Formulário de Editar Perfil -->
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

                    <!-- Formulário de Criar Post -->
                    <div v-show="activeMenu === 'post'">
                        <CreatePostForm ref="createPostFormRef" @post-created="handlePostCreated" />
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
import Divider from 'primevue/divider';
import Button from 'primevue/button';
import Card from 'primevue/card';

export default {
    name: 'Profile',
    components: {
        Header,
        AssinaturaForm,
        SocialForm,
        SobreForm,
        CreatePostForm,
        Divider,
        Button,
        Card
    },
    data() {
        return {
            dadosFormulario: null,
            loading: false,
            userId: null,
            activeMenu: 'perfil'
        }
    },
    computed: {
        /**
         * Computed que acessa os dados do formulário filho via ref
         */
        dadosDoFormulario() {
            return this.$refs.assinaturaFormRef?.dados || null;
        }
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
                        life: 3000
                    });
                    this.$router.push('/');
                    return;
                }

                const response = await this.api.get(`/users/${this.userId}`);
                const userData = response.data.data;

                // Preencher formulário de assinatura
                if (this.$refs.assinaturaFormRef && userData) {
                    this.$refs.assinaturaFormRef.preencherDados({
                        assinatura_mensal: this.formatarMoeda(userData.valor_assinatura_mensal),
                        desconto_trimestral: userData.valor_desconto_trimestral || 0,
                        desconto_semestral: userData.valor_desconto_semestral || 0,
                        valor_trimestral: this.formatarMoeda(userData.valor_assinatura_trimestral),
                        valor_semestral: this.formatarMoeda(userData.valor_assinatura_semestral)
                    });
                }

                // Preencher formulário de redes sociais
                if (this.$refs.socialFormRef && userData) {
                    this.$refs.socialFormRef.preencherDados({
                        instagram: userData.instagram || '',
                        telegram: userData.telegram || '',
                        whatsapp: userData.whatsapp || '',
                        x_twitter: userData.x_twitter || '',
                        tiktok: userData.tiktok || '',
                        facebook: userData.facebook || '',
                        privacy: userData.privacy || ''
                    });
                }

                // Preencher formulário sobre
                if (this.$refs.sobreFormRef && userData) {
                    this.$refs.sobreFormRef.preencherDados({
                        sobre: userData.sobre || ''
                    });
                }
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar dados do usuário',
                    life: 3000
                });
            } finally {
                this.loading = false;
            }
        },
        formatarMoeda(valor) {
            if (!valor || valor === 0) return 'R$ 0,00';
            return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
        },
        // Salva os dados do formulário
        async salvar() {
            try {
                this.loading = true;
                const dadosAssinatura = this.$refs.assinaturaFormRef.dadosAssinatura();
                const dadosSocial = this.$refs.socialFormRef.dados;
                const dadosSobre = this.$refs.sobreFormRef.dados;

                // Converter valores formatados para números
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
                    sobre: dadosSobre.sobre
                };

                await this.api.put(`/users/${this.userId}`, dadosParaSalvar);

                this.$toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Perfil atualizado com sucesso!',
                    life: 3000
                });
            } catch (error) {
                let errorMessage = 'Erro ao salvar dados';
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
            } finally {
                this.loading = false;
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
                life: 3000
            });
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
</style>
