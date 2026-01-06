<template>
    <div>
        <Card v-for="(content, contentIndex) in conteudos" :key="contentIndex" class="mb-2">
            <template #title>
                <div class="d-flex gap-2 justify-content-between">
                    <div class="d-flex gap-2 col-10">
                        <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle"
                            size="xlarge" />
                        <div class="d-flex flex-column">
                            <span class="font-bold text-white">Becalima007</span>
                            <span class="text-xs text-secondary">@Becalima007</span>
                        </div>
                    </div>
                    <div class="md:col-2 mobile-display-none">
                        <span class="text-500 text-lg">{{ content.date }}</span>
                    </div>
                </div>
            </template>
            <template #content>
                <div class="row">
                    <Carousel :value="getImagesForCarousel(content.image)" :numVisible="1" :numScroll="1">
                        <template #item="slotProps">
                            <div class="carousel-image-container">
                                <Image :src="slotProps.data.url" :alt="slotProps.data.alt" width="350" preview />
                            </div>
                        </template>
                    </Carousel>
                </div>
                <div class="row mb-2 mt-3">
                    <div class="">
                        <p class="text-white">
                            {{ isExpanded(contentIndex) ? content.description : getTruncatedDescription(content.description) }}
                            <span 
                                v-if="content.description.length > 200 && !isExpanded(contentIndex)" 
                                class="text-pink-200 cursor-pointer"
                                @click="expandDescription(contentIndex)"
                            >
                                ler mais
                            </span>
                            <span 
                                v-if="content.description.length > 200 && isExpanded(contentIndex)" 
                                class="text-pink-200 cursor-pointer"
                                @click="collapseDescription(contentIndex)"
                            >
                                ler menos
                            </span>
                        </p>
                    </div>
                </div>
                <div class="row mb-2 mt-3">
                    <div class="">
                        <div class="d-flex gap-2 text-white text-xs">
                            <div class="d-flex gap-2 align-items-center">
                                <i :class="conteudos[contentIndex].isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'" class="fa-2xl cursor-pointer" @click="likeContent(contentIndex)"></i>
                                <span class="text-white">{{ conteudos[contentIndex].likes }}</span>
                            </div>
                            <div class="d-flex gap-2 align-items-center">
                                <i class="fa-regular fa-comment fa-2xl cursor-pointer" @click="abrirDrawerComentarios(contentIndex)"></i>
                                <span class="text-white">{{ (conteudos[contentIndex].comments || []).length }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Card>
    </div>
    
    <DrawerComentarios 
        v-model="drawerVisible"
        :comentarios="comentariosAtuais"
        @adicionar-comentario="adicionarComentario"
        @responder-comentario="responderComentario"
        @deletar-comentario="deletarComentario"
        @deletar-resposta="deletarResposta"
    />

    <Toast />
</template>

<script>
import { Avatar, Button, Card, Carousel, Image, Toast } from 'primevue';
import DrawerComentarios from './drawers/DrawerComentarios.vue';

export default {
    name: 'Content',
    props: {
        selectedMenu: {
            type: Number,
            required: true
        },
        conteudos: {
            type: Array,
            required: true
        }
    },
    components: {
        Card,
        Carousel,
        Button,
        Image,
        Avatar,
        DrawerComentarios,
        Toast
    },
    data() {
        return {
            expandedDescriptions: {},
            drawerVisible: false,
            conteudoAtualIndex: null
        }
    },
    computed: {
        comentariosAtuais() {
            if (this.conteudoAtualIndex !== null && this.conteudos[this.conteudoAtualIndex]) {
                return this.conteudos[this.conteudoAtualIndex].comments || [];
            }
            return [];
        }
    },
    methods: {
        getImagesForCarousel(images) {
            return images.map((url, index) => ({
                url: url,
                alt: `Image ${index + 1}`
            }));
        },
        getTruncatedDescription(description) {
            if (!description) return '';
            return description.length > 200 ? description.substring(0, 200) + '...' : description;
        },
        isExpanded(contentIndex) {
            return this.expandedDescriptions[contentIndex] || false;
        },
        expandDescription(contentIndex) {
            this.expandedDescriptions[contentIndex] = true;
        },
        collapseDescription(contentIndex) {
            this.expandedDescriptions[contentIndex] = false;
        },
        likeContent(contentIndex) {
            if (this.conteudos[contentIndex].isLiked) {
                this.conteudos[contentIndex].likes--;
            } else {
                this.conteudos[contentIndex].likes++;
            }

            this.conteudos[contentIndex].isLiked = !this.conteudos[contentIndex].isLiked;

            const msg = this.conteudos[contentIndex].isLiked ? 'Curtido!' : 'Descurtido!';
            const detail = this.conteudos[contentIndex].isLiked ? 'Você curtiu esta foto' : 'Você descurtiu esta foto';

            this.$toast.add({ severity: this.conteudos[contentIndex].isLiked ? 'success' : 'warn', summary: msg, detail: detail, life: 3000 });
        },
        abrirDrawerComentarios(contentIndex) {
            this.conteudoAtualIndex = contentIndex;
            this.drawerVisible = true;
        },
        /**
         * Adiciona um novo comentário ao conteúdo atual
         * @param {string} texto - Texto do comentário a ser adicionado
         */
        async adicionarComentario(texto) {
            if (this.conteudoAtualIndex === null || !texto || !texto.trim()) {
                return;
            }
            
            const conteudoAtual = this.conteudos[this.conteudoAtualIndex];
            
            // Garante que o array de comentários existe
            if (!conteudoAtual.comments) {
                conteudoAtual.comments = [];
            }
            
            // Cria o objeto do novo comentário
            // O backend retornará o comentário com timeAgo formatado
            const novoComentario = {
                id: Date.now(), // ID temporário (será substituído pela resposta do backend)
                name: 'Você', // Nome do usuário (virá do backend/contexto de autenticação)
                comment: texto.trim(),
                createdAt: new Date().toISOString(),
                timeAgo: 'Agora', // Temporário - será substituído pelo valor do backend
                avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'
            };
            
            // Adiciona o comentário localmente (otimistic update)
            conteudoAtual.comments.push(novoComentario);
            
            // TODO: Integração com backend
            // Descomente e ajuste quando estiver pronto para integrar com o backend:
            /*
            try {
                const response = await this.$http.post('/api/comentarios', {
                    conteudo_id: conteudoAtual.id, // ou o ID do conteúdo
                    comentario: texto.trim()
                });
                
                // Atualiza o comentário com os dados do backend
                const index = conteudoAtual.comments.findIndex(c => c.id === novoComentario.id);
                if (index !== -1) {
                    conteudoAtual.comments[index] = response.data;
                }
            } catch (error) {
                console.error('Erro ao adicionar comentário:', error);
                // Remove o comentário otimista em caso de erro
                const index = conteudoAtual.comments.findIndex(c => c.id === novoComentario.id);
                if (index !== -1) {
                    conteudoAtual.comments.splice(index, 1);
                }
                // Aqui você pode adicionar uma notificação de erro para o usuário
            }
            */
        },
        
        /**
         * Adiciona uma resposta da cliente a um comentário
         * @param {Object} data - Objeto com comentarioId e resposta
         */
        async responderComentario(data) {
            if (this.conteudoAtualIndex === null || !data || !data.resposta || !data.resposta.trim()) {
                return;
            }
            
            const conteudoAtual = this.conteudos[this.conteudoAtualIndex];
            const comentario = conteudoAtual.comments.find(c => c.id === data.comentarioId);
            
            if (!comentario) {
                return;
            }
            
            // Cria a resposta da cliente
            // O backend retornará a resposta com timeAgo formatado
            const novaResposta = {
                id: Date.now(),
                name: 'Becalima007', // Nome da cliente (virá do backend/contexto de autenticação)
                comment: data.resposta.trim(),
                createdAt: new Date().toISOString(),
                timeAgo: 'Agora', // Temporário - será substituído pelo valor do backend
                avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'
            };
            
            // Adiciona a resposta ao comentário
            comentario.reply = novaResposta;
            
            // TODO: Integração com backend
            // Descomente e ajuste quando estiver pronto para integrar com o backend:
            /*
            try {
                const response = await this.$http.post('/api/comentarios/resposta', {
                    comentario_id: data.comentarioId,
                    resposta: data.resposta.trim()
                });
                
                // Atualiza a resposta com os dados do backend
                comentario.reply = response.data;
            } catch (error) {
                console.error('Erro ao responder comentário:', error);
                // Remove a resposta otimista em caso de erro
                delete comentario.reply;
                // Aqui você pode adicionar uma notificação de erro para o usuário
            }
            */
        },
        
        /**
         * Deleta um comentário
         * @param {number} comentarioId - ID do comentário a ser deletado
         */
        async deletarComentario(comentarioId) {
            if (this.conteudoAtualIndex === null) {
                return;
            }
            
            const conteudoAtual = this.conteudos[this.conteudoAtualIndex];
            
            if (!conteudoAtual.comments) {
                return;
            }
            
            // Remove o comentário localmente
            const index = conteudoAtual.comments.findIndex(c => c.id === comentarioId);
            if (index !== -1) {
                conteudoAtual.comments.splice(index, 1);
            }
            
            // TODO: Integração com backend
            // Descomente e ajuste quando estiver pronto para integrar com o backend:
            /*
            try {
                await this.$http.delete(`/api/comentarios/${comentarioId}`);
            } catch (error) {
                console.error('Erro ao deletar comentário:', error);
                // Aqui você pode adicionar uma notificação de erro para o usuário
                // E restaurar o comentário se necessário
            }
            */
        },
        
        /**
         * Deleta uma resposta de um comentário
         * @param {number} comentarioId - ID do comentário que contém a resposta
         */
        async deletarResposta(comentarioId) {
            if (this.conteudoAtualIndex === null) {
                return;
            }
            
            const conteudoAtual = this.conteudos[this.conteudoAtualIndex];
            const comentario = conteudoAtual.comments?.find(c => c.id === comentarioId);
            
            if (!comentario || !comentario.reply) {
                return;
            }
            
            // Remove a resposta localmente
            delete comentario.reply;
            
            // TODO: Integração com backend
            // Descomente e ajuste quando estiver pronto para integrar com o backend:
            /*
            try {
                await this.$http.delete(`/api/comentarios/${comentarioId}/resposta`);
            } catch (error) {
                console.error('Erro ao deletar resposta:', error);
                // Aqui você pode adicionar uma notificação de erro para o usuário
                // E restaurar a resposta se necessário
            }
            */
        }
    }
}
</script>

<style scoped lang="scss">
:deep(.p-card) {
    border-radius: 15px;
    background-color: #121212;
}

.carousel-image-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
}

:deep(.p-image) {
    display: flex;
    justify-content: center;
}



@media (max-width: 768px) {
    :deep(.p-carousel-content) {
        width: 300px !important;
    }
}
</style>