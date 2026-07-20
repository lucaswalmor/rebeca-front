<template>
    <div class="p-4 d-flex justify-content-center align-items-center flex-column container">
        <div class="md:w-7 sm:w-full">
            <Hero :user-data="userData" />

            <Menu
                :totalPostagens="postsCount.total || 0"
            />

            <Content :conteudos="conteudos" />

            <div v-if="loadingMore" class="text-center p-3">
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #f5cee1;"></i>
            </div>
        </div>
        <ScrollTop />

        <!-- Dialog da enquete sobre chat -->
        <Dialog
            v-model:visible="showChatEnqueteDialog"
            modal
            header="Enquete: Chat em Tempo Real"
            :style="{ width: '30rem' }"
            :closable="false"
            :dismissableMask="false"
            :closeOnEscape="false"
        >
            <div class="text-center">
                <div class="mb-4">
                    <i class="pi pi-comments text-4xl text-primary mb-3"></i>
                    <h3 class="text-xl font-semibold mb-2">Gostaria de um chat para conversar comigo em tempo real?</h3>
                    <p class="text-gray-600">Sua opinião é muito importante para melhorar o site!</p>
                </div>

                <div class="flex flex-column gap-3">
                    <Button
                        label="Sim, gostaria muito!"
                        icon="pi pi-thumbs-up"
                        class="w-full p-button-success"
                        @click="votarEnquete(true)"
                        :loading="voting"
                    />
                    <Button
                        label="Não, obrigado"
                        icon="pi pi-thumbs-down"
                        class="w-full p-button-danger"
                        @click="votarEnquete(false)"
                        :loading="voting"
                    />
                </div>

                <div class="mt-3 text-sm text-gray-500">
                    <i class="pi pi-info-circle"></i>
                    Você só verá esta enquete uma vez.
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script>
import Hero from '@/components/Hero.vue';
import Menu from '@/components/Menu.vue';
import Content from '@/views/Content.vue';
import ScrollTop from 'primevue/scrolltop';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

export default {
    name: 'Main',
    components: {
        Hero,
        Menu,
        Content,
        ScrollTop,
        Dialog,
        Button
    },
        data() {
            return {
                conteudos: [],
                loading: false,
                loadingMore: false,
                postsCount: {
                    total: 0
                },
                userData: null,
                currentPage: 1,
                hasMore: false,
                canLoadMore: false,
                showChatEnqueteDialog: false,
                voting: false,
                hasCheckedVoteStatus: false
            }
        },
    setup() {
        const authStore = useAuthStore();
        const { updateTrigger } = storeToRefs(authStore);
        return { authStore, updateTrigger };
    },
    async mounted() {
        await this.carregarContagens();
        await this.carregarPosts();

        // Verificar se deve mostrar dialog da enquete após carregar conteúdo
        await this.verificarDialogEnquete();

        // Adicionar listener de scroll para infinite scroll
        window.addEventListener('scroll', this.handleScroll);
    },
    watch: {
        // Observar mudanças na store para recarregar posts após login/logout
        updateTrigger(newVal, oldVal) {
            // Quando o trigger muda, recarregar dados e verificar enquete
            this.handleAuthChange();
        }
    },
    beforeUnmount() {
        // Remover listeners
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        async carregarContagens() {
            try {
                const response = await this.api.get('/users/apelido/becaLima007');
                if (response.data.data) {
                    this.userData = response.data.data;
                    if (response.data.data.posts_count) {
                        this.postsCount = response.data.data.posts_count;
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar contagens:', error);
            }
        },

        async carregarPosts(loadMore = false) {
            try {
                if (loadMore) {
                    this.loadingMore = true;
                } else {
                    this.loading = true;
                }
                
                // Verificar se o usuário está logado e é admin
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const isAdmin = user.is_admin === true;
                const hasAssinatura = user.assinatura === true;
                
                // Admin e assinantes têm acesso total (paginação de 50 em 50).
                // Visitantes e usuários sem assinatura ficam limitados a 5 posts.
                const acessoTotal = isAdmin || hasAssinatura;
                const perPage = (!user.id || !acessoTotal) ? 5 : 50;
                
                // Se for admin, usar rota especial que retorna todos os posts (ativos e inativos)
                // Caso contrário, usar rota pública que retorna apenas posts ativos
                let url = isAdmin ? '/posts/admin/all' : '/posts';
                
                const params = new URLSearchParams();
                params.append('page', this.currentPage.toString());
                params.append('per_page', perPage.toString());
                
                url += '?' + params.toString();
                
                const response = await this.api.get(url);
                const newPosts = response.data.data || [];

                if (loadMore) {
                    this.conteudos = [...this.conteudos, ...newPosts];
                } else {
                    this.conteudos = newPosts;
                }
                
                // Atualizar informações de paginação
                if (response.data.meta) {
                    this.hasMore = response.data.meta.has_more;
                    this.canLoadMore = this.hasMore && (user.id && acessoTotal);
                }
            } catch (error) {
                console.error('Erro ao carregar posts:', error);
                this.$toast?.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar posts',
                    life: 3000
                });
            } finally {
                this.loading = false;
                this.loadingMore = false;
            }
        },
        handleScroll() {
            // Verificar se chegou perto do final da página
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Carregar mais quando estiver a 200px do final
            if (scrollTop + windowHeight >= documentHeight - 200) {
                if (this.canLoadMore && !this.loadingMore && !this.loading) {
                    this.currentPage++;
                    this.carregarPosts(true);
                }
            }
        },
        async handleAuthChange() {
            // Recarregar contagens e posts após mudança de autenticação
            await this.carregarContagens();
            await this.carregarPosts();

            // Verificar se deve mostrar dialog da enquete após mudança de auth
            await this.verificarDialogEnquete();
        },
        async verificarDialogEnquete() {
            try {
                // Verificar se usuário está logado
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (!user.id) {
                    return; // Não mostrar dialog para usuários não logados
                }

                // Não mostrar dialog para administradores
                if (this.isAdmin()) {
                    return; // Não mostrar dialog para admins
                }

                // Verificar status do voto na API
                const response = await this.api.get('/chat-enquete/status-voto');
                const { has_voted } = response.data.data;

                if (!has_voted) {
                    // Mostrar dialog apenas se não votou ainda
                    this.showChatEnqueteDialog = true;
                }

                this.hasCheckedVoteStatus = true;
            } catch (error) {
                console.error('Erro ao verificar status da enquete:', error);
            }
        },
        async votarEnquete(resposta) {
            try {
                this.voting = true;

                // Enviar resposta para API
                await this.api.post('/chat-enquete/votar', {
                    resposta: resposta
                });

                // Fechar dialog
                this.showChatEnqueteDialog = false;

                // Mostrar mensagem de sucesso
                this.$toast?.add({
                    severity: 'success',
                    summary: 'Obrigado!',
                    detail: 'Sua resposta foi registrada com sucesso.',
                    life: 3000
                });
            } catch (error) {
                console.error('Erro ao votar na enquete:', error);
                this.$toast?.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao registrar sua resposta. Tente novamente.',
                    life: 3000
                });
            } finally {
                this.voting = false;
            }
        }
    }
}
</script>