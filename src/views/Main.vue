<template>
    <div class="p-4 d-flex justify-content-center align-items-center flex-column container">
        <div class="md:w-7 sm:w-full">
            <Hero :user-data="userData" />

            <Menu 
                @selectMenu="selectMenu" 
                :totalPostagens="postsCount.simples || 0"
                :totalExclusivos="postsCount.exclusivos || 0"
            />

            <Content :selectedMenu="selectedMenu" :conteudos="conteudos" />
            
            <div v-if="loadingMore" class="text-center p-3">
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #f5cee1;"></i>
            </div>
        </div>
        <ScrollTop />
    </div>
</template>

<script>
import Hero from '@/components/Hero.vue';
import Menu from '@/components/Menu.vue';
import Content from '@/views/Content.vue';
import ScrollTop from 'primevue/scrolltop';
import eventBus from '@/utils/eventBus';

export default {
    name: 'Main',
    components: {
        Hero,
        Menu,
        Content,
        ScrollTop
    },
    data() {
        return {
            selectedMenu: 0,
            conteudos: [],
            loading: false,
            loadingMore: false,
            postsCount: {
                simples: 0,
                exclusivos: 0
            },
            userData: null,
            currentPage: 1,
            hasMore: false,
            canLoadMore: false
        }
    },
    async mounted() {
        await this.carregarContagens();
        await this.carregarPosts();
        
        // Escutar eventos de logout para recarregar posts
        eventBus.on('user-logged-out', this.handleLogout);
        
        // Adicionar listener de scroll para infinite scroll
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
        // Remover listeners
        eventBus.off('user-logged-out', this.handleLogout);
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        async selectMenu(menu) {
            this.selectedMenu = menu;
            this.currentPage = 1;
            this.conteudos = [];
            await this.carregarPosts();
        },
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
                
                // Se não estiver logado ou não tiver assinatura, limitar a 5 posts
                // Se tiver assinatura ativa, usar paginação de 20 em 20
                const perPage = (!user.id || !hasAssinatura) ? 5 : 20;
                
                // Se for admin, usar rota especial que retorna todos os posts (ativos e inativos)
                // Caso contrário, usar rota pública que retorna apenas posts ativos
                let url = isAdmin ? '/posts/admin/all' : '/posts';
                
                // Adicionar filtro por tipo_post baseado na aba selecionada
                const params = new URLSearchParams();
                if (this.selectedMenu === 0) {
                    params.append('tipo_post', '1'); // Simples
                } else if (this.selectedMenu === 1) {
                    params.append('tipo_post', '2'); // Exclusivos
                }
                
                // Adicionar parâmetros de paginação
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
                    this.canLoadMore = this.hasMore && (user.id && hasAssinatura);
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
        async handleLogout() {
            // Recarregar contagens e posts após logout
            await this.carregarContagens();
            await this.carregarPosts();
        }
    }
}
</script>