<template>
    <div class="main-feed d-flex justify-content-center align-items-center flex-column container">
        <div class="md:w-7 sm:w-full feed-column">
            <Hero :user-data="userData" />

            <Menu
                v-model:activeTab="activeTab"
                :totalPostagens="postsCount.total || 0"
            />

            <Content v-if="activeTab === 'posts'" :conteudos="conteudos" />
            <PostsGaleria v-else :conteudos="conteudos" />

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
import PostsGaleria from '@/components/PostsGaleria.vue';
import ScrollTop from 'primevue/scrolltop';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

export default {
    name: 'Main',
    components: {
        Hero,
        Menu,
        Content,
        PostsGaleria,
        ScrollTop,
    },
    data() {
        return {
            activeTab: 'posts',
            conteudos: [],
            loading: false,
            loadingMore: false,
            postsCount: {
                total: 0,
            },
            userData: null,
            currentPage: 1,
            hasMore: false,
            canLoadMore: false,
        };
    },
    setup() {
        const authStore = useAuthStore();
        const { updateTrigger } = storeToRefs(authStore);
        return { authStore, updateTrigger };
    },
    async mounted() {
        await this.carregarContagens();
        await this.carregarPosts();
        window.addEventListener('scroll', this.handleScroll);
    },
    watch: {
        updateTrigger() {
            this.handleAuthChange();
        },
    },
    beforeUnmount() {
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

                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const isAdminUser = user.is_admin === true || user.is_admin === 'true' || user.is_admin === 1;
                const hasAssinatura = user.assinatura === true || user.assinatura === 'true' || user.assinatura === 1;

                const acessoTotal = isAdminUser || hasAssinatura;
                const perPage = (!user.id || !acessoTotal) ? 5 : 50;

                let url = isAdminUser ? '/posts/admin/all' : '/posts';

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
                    life: 3000,
                });
            } finally {
                this.loading = false;
                this.loadingMore = false;
            }
        },
        handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            if (scrollTop + windowHeight >= documentHeight - 200) {
                if (this.canLoadMore && !this.loadingMore && !this.loading) {
                    this.currentPage++;
                    this.carregarPosts(true);
                }
            }
        },
        async handleAuthChange() {
            await this.carregarContagens();
            this.currentPage = 1;
            await this.carregarPosts();
        },
    },
};
</script>

<style scoped>
.main-feed {
    min-height: 100vh;
}
</style>
