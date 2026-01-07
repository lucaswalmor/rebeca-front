<template>
    <div class="p-4 d-flex justify-content-center align-items-center flex-column container">
        <div class="md:w-7 sm:w-full">
            <Hero :user-data="userData" />

            <Menu 
                @selectMenu="selectMenu" 
                :totalPostagens="postsCount.simples || 0"
                :totalExclusivos="postsCount.exclusivos || 0"
                :totalOutros="postsCount.outros || 0"
            />

            <Content :selectedMenu="selectedMenu" :conteudos="conteudos" />
        </div>
        <Toast />
    </div>
</template>

<script>
import Hero from '@/components/Hero.vue';
import Menu from '@/components/Menu.vue';
import Content from '@/views/Content.vue';
import Toast from 'primevue/toast';

export default {
    name: 'Main',
    components: {
        Hero,
        Menu,
        Content,
        Toast
    },
    data() {
        return {
            selectedMenu: 0,
            conteudos: [],
            loading: false,
            postsCount: {
                simples: 0,
                exclusivos: 0,
                outros: 0
            },
            userData: null
        }
    },
    async mounted() {
        await this.carregarContagens();
        await this.carregarPosts();
    },
    methods: {
        async selectMenu(menu) {
            this.selectedMenu = menu;
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
        async carregarPosts() {
            try {
                this.loading = true;
                let url = '/posts';
                
                // Adicionar filtro por tipo_post baseado na aba selecionada
                if (this.selectedMenu === 0) {
                    url += '?tipo_post=1'; // Simples
                } else if (this.selectedMenu === 1) {
                    url += '?tipo_post=2'; // Exclusivos
                } else if (this.selectedMenu === 2) {
                    url += '?tipo_post=3'; // Outros
                }
                
                const response = await this.api.get(url);
                this.conteudos = response.data.data || [];
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
            }
        }
    }
}
</script>