<template>
    <div>
        <!-- Post fake quando não há posts -->
        <Card v-if="conteudos.length === 0" class="mb-2">
            <template #content>
                <div class="text-center p-5">
                    <i class="fa-solid fa-image fa-3x text-white mb-3" style="opacity: 0.5;"></i>
                    <p class="text-white">Ainda não há publicações disponíveis.</p>
                </div>
            </template>
        </Card>
        
        <Card v-for="(content, contentIndex) in conteudos" :key="contentIndex" class="mb-2">
            <template #title>
                <div class="d-flex gap-2 justify-content-between align-items-start flex-wrap">
                    <div class="d-flex gap-2 flex-grow-1" style="min-width: 0;">
                        <Avatar :image="content.user_avatar || 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'" shape="circle"
                            size="xlarge" />
                        <div class="d-flex flex-column flex-grow-1" style="min-width: 0;">
                            <div class="d-flex gap-2 align-items-center flex-wrap">
                                <span class="font-bold text-white text-truncate">{{ content.user_name || 'Becalima007' }}</span>
                                <Button 
                                    v-if="isAdminComputed"
                                    :icon="content.is_fixed ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'"
                                    :class="{ 'pin-active': content.is_fixed }"
                                    text
                                    rounded
                                    severity="secondary"
                                    size="small"
                                    @click="togglePin(contentIndex)"
                                    :title="content.is_fixed ? 'Desfixar post' : 'Fixar post'"
                                />
                            </div>
                            <div class="d-flex gap-2 align-items-center flex-wrap">
                                <span class="text-xs text-secondary">@{{ content.user_apelido || 'Becalima007' }}</span>
                                <Tag 
                                    :value="content.status === 'ativo' ? 'Ativo' : 'Inativo'" 
                                    v-if="this.isAdmin()"
                                    :severity="content.status === 'ativo' ? 'success' : 'danger'"
                                    class="tag-status"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="d-flex flex-column gap-1 align-items-end" style="flex-shrink: 0;">
                        <div class="text-end">
                            <span class="text-500 text-sm">{{ content.date }}</span>
                        </div>
                        <Menu 
                            v-if="this.isAdmin()" 
                            :model="getMenuItems(contentIndex)" 
                            popup 
                            :ref="el => { if (el) menuRefs[contentIndex] = el }"
                        />
                        <Button 
                            v-if="this.isAdmin()"
                            icon="pi pi-ellipsis-v" 
                            text 
                            rounded 
                            severity="secondary"
                            size="small"
                            @click="toggleMenu($event, contentIndex)"
                            aria-label="Menu de ações"
                        />
                    </div>
                </div>
            </template>
            <template #content>
                <div class="row">
                    <!-- Conteúdo completo liberado -->
                    <Carousel
                        v-if="content.has_full_access && getDisplayMedia(content).length > 0"
                        :value="getDisplayMedia(content)"
                        :numVisible="1"
                        :numScroll="1"
                    >
                        <template #item="slotProps">
                            <div class="carousel-media-container">
                                <img 
                                    v-if="slotProps.data.tipo === 'image' || !slotProps.data.tipo"
                                    :src="slotProps.data.url || slotProps.data" 
                                    :alt="slotProps.data.alt || 'Mídia do post'" 
                                    class="media-content"
                                />
                                <video 
                                    v-else-if="slotProps.data.tipo === 'video'"
                                    :src="slotProps.data.url" 
                                    controls
                                    class="media-content"
                                />
                            </div>
                        </template>
                    </Carousel>

                    <!-- Assinante: prévia + CTA desbloquear -->
                    <template v-else-if="content.has_preview_access && !content.has_full_access">
                        <Carousel
                            v-if="getDisplayMedia(content).length > 0"
                            :value="getDisplayMedia(content)"
                            :numVisible="1"
                            :numScroll="1"
                        >
                            <template #item="slotProps">
                                <div class="carousel-media-container">
                                    <img 
                                        v-if="slotProps.data.tipo === 'image' || !slotProps.data.tipo"
                                        :src="slotProps.data.url || slotProps.data" 
                                        :alt="slotProps.data.alt || 'Prévia'" 
                                        class="media-content"
                                    />
                                    <video 
                                        v-else-if="slotProps.data.tipo === 'video'"
                                        :src="slotProps.data.url" 
                                        controls
                                        class="media-content"
                                    />
                                </div>
                            </template>
                        </Carousel>

                        <div class="unlock-panel mt-2">
                            <i class="fa-solid fa-lock unlock-lock"></i>
                            <div class="unlock-meta">
                                <span v-if="content.media_count">
                                    <i class="fa-solid fa-film me-1"></i>{{ content.media_count }}
                                </span>
                                <span class="unlock-price">{{ formatPreco(content.preco) }}</span>
                            </div>
                            <Button
                                :label="`Desbloquear conteúdo — ${formatPreco(content.preco)}`"
                                icon="pi pi-lock-open"
                                class="w-full unlock-btn"
                                severity="primary"
                                :loading="buyingPostId === content.id"
                                @click="comprarPost(content)"
                            />
                        </div>
                    </template>

                    <!-- Sem assinatura: blur -->
                    <div
                        v-else
                        class="carousel-media-container blur-container locked-placeholder"
                    >
                        <div class="blur-overlay static-lock">
                            <div class="blur-text">
                                <i class="fa-solid fa-lock fa-2x blur-icon"></i>
                                <span class="blur-message">Este conteúdo é exclusivo para assinantes</span>
                                <span class="blur-submessage">Assine agora para ver a prévia e desbloquear conteúdos</span>
                            </div>
                        </div>
                    </div>
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
                <div v-if="canInteract" class="row mb-2 mt-3">
                    <div class="">
                        <div class="d-flex gap-2 text-white text-xs">
                            <div class="d-flex gap-2 align-items-center">
                                <i :class="conteudos[contentIndex].isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'" class="fa-2xl cursor-pointer" @click="likeContent(contentIndex)"></i>
                                <span class="text-white">{{ conteudos[contentIndex].likes || conteudos[contentIndex].likes_count || 0 }}</span>
                            </div>
                            <div class="d-flex gap-2 align-items-center">
                                <i class="fa-regular fa-comment fa-2xl cursor-pointer" @click="abrirDrawerComentarios(contentIndex)"></i>
                                <span class="text-white">{{ conteudos[contentIndex].commentsCount || conteudos[contentIndex].comments?.length || 0 }}</span>
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
        :post-id="conteudoAtualIndex !== null ? conteudos[conteudoAtualIndex]?.id : null"
        @comentarios-carregados="comentariosCarregados"
        @adicionar-comentario="adicionarComentario"
        @responder-comentario="responderComentario"
        @deletar-comentario="deletarComentario"
        @deletar-resposta="deletarResposta"
    />

    <Dialog
        v-model:visible="editDialogVisible"
        modal
        header="Editar Post"
        :style="{ width: '28rem' }"
    >
        <div class="d-flex flex-column gap-3">
            <div>
                <label class="text-white mb-2 d-block">Descrição</label>
                <Textarea v-model="editForm.description" rows="4" class="w-full" />
            </div>
            <div>
                <label class="text-white mb-2 d-block">Preço (R$)</label>
                <InputNumber
                    v-model="editForm.preco"
                    class="w-full"
                    mode="currency"
                    currency="BRL"
                    locale="pt-BR"
                    :min="0.01"
                    :minFractionDigits="2"
                />
            </div>
        </div>
        <template #footer>
            <Button label="Cancelar" text @click="editDialogVisible = false" />
            <Button label="Salvar" severity="primary" :loading="editLoading" @click="salvarEdicaoPost" />
        </template>
    </Dialog>
</template>

<script>
import { Avatar, Button, Card, Carousel, Menu, Tag } from 'primevue';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import DrawerComentarios from './drawers/DrawerComentarios.vue';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { isLoggedIn, hasAssinaturaAtiva, statusAssinatura, isAdmin } from '@/utils/global';

export default {
    name: 'Content',
    props: {
        conteudos: {
            type: Array,
            required: true
        }
    },
    components: {
        Card,
        Carousel,
        Button,
        Avatar,
        DrawerComentarios,
        Menu,
        Tag,
        Dialog,
        InputNumber,
        Textarea
    },
    data() {
        return {
            expandedDescriptions: {},
            drawerVisible: false,
            conteudoAtualIndex: null,
            currentMenuIndex: null,
            menuRefs: {},
            buyingPostId: null,
            editDialogVisible: false,
            editLoading: false,
            editPostIndex: null,
            editForm: {
                description: '',
                preco: null
            },
            userState: {
                isLoggedIn: false,
                isAdmin: false,
                hasAssinatura: false,
                statusAssinatura: null
            }
        }
    },
    setup() {
        const authStore = useAuthStore();
        const { updateTrigger } = storeToRefs(authStore);
        return { authStore, updateTrigger };
    },
    mounted() {
        this.updateUserState();
        // Escutar mudanças no localStorage
        window.addEventListener('storage', this.handleStorageChange);
        // Escutar quando o usuário volta para a aba
        window.addEventListener('visibilitychange', this.handleVisibilityChange);
    },
    beforeUnmount() {
        window.removeEventListener('storage', this.handleStorageChange);
        window.removeEventListener('visibilitychange', this.handleVisibilityChange);
    },
    watch: {
        // Observar mudanças na store para atualizar estado do usuário
        updateTrigger() {
            this.updateUserState();
        },
    },
    computed: {
        isAdminComputed() {
            return this.userState.isAdmin;
        },
        comentariosAtuais() {
            if (this.conteudoAtualIndex !== null && this.conteudos[this.conteudoAtualIndex]) {
                return this.conteudos[this.conteudoAtualIndex].comments || [];
            }
            return [];
        },
        shouldBlur() {
            const isAdmin = this.isAdmin();
            const hasAssinatura = this.hasAssinaturaAtiva();
            
            // Aplica blur se não for admin e não tiver assinatura ativa
            return !isAdmin && !hasAssinatura;
        },
        canInteract() {
            // Se não estiver logado, não pode interagir
            if (!this.userState.isLoggedIn) {
                return false;
            }

            // Admin sempre pode interagir
            if (this.userState.isAdmin) {
                return true;
            }

            // Verificar se tem assinatura ativa E status aprovado
            const hasAssinatura = this.hasAssinaturaAtiva();
            const statusAssinatura = this.statusAssinatura();

            return hasAssinatura && statusAssinatura === 'aprovado';
        }
    },
    methods: {
        getMediaForCarousel(media) {
            if (!media || media.length === 0) {
                return [];
            }
            
            // Se for array de strings (formato antigo), converter para formato novo
            if (typeof media[0] === 'string') {
                return media.map((url, index) => ({
                    url: url,
                    tipo: 'image',
                    alt: `Mídia ${index + 1}`
                }));
            }
            
            // Se já for array de objetos com tipo
            return media.map((item, index) => ({
                url: item.url || item,
                tipo: item.tipo || 'image',
                alt: `Mídia ${index + 1}`
            }));
        },
        getDisplayMedia(post) {
            // Backend já filtra: sem acesso retorna só a prévia em media;
            // com acesso retorna o conteúdo exclusivo.
            return this.getMediaForCarousel(post.media || post.image || []);
        },
        formatPreco(preco) {
            const value = Number(preco || 0);
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        },
        async comprarPost(post) {
            if (!post?.id) return;

            if (!this.userState.isLoggedIn) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Login necessário',
                    detail: 'Faça login para comprar este conteúdo',
                    life: 3000
                });
                return;
            }

            if (!this.userState.hasAssinatura || this.userState.statusAssinatura !== 'aprovado') {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Assinatura necessária',
                    detail: 'Você precisa de uma assinatura ativa para comprar conteúdos',
                    life: 3000
                });
                return;
            }

            try {
                this.buyingPostId = post.id;
                const response = await this.api.post(`/posts/${post.id}/comprar`);
                if (response.data.success && response.data.link) {
                    window.location.href = response.data.link;
                } else {
                    throw new Error(response.data.message || 'Não foi possível gerar o link de pagamento');
                }
            } catch (error) {
                const detail = error.response?.data?.message || error.message || 'Erro ao iniciar compra';
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail,
                    life: 4000
                });
            } finally {
                this.buyingPostId = null;
            }
        },
        isPostLocked(post) {
            if (post.has_full_access === true || post.is_locked === false) {
                return false;
            }
            if (post.is_locked === true || post.has_full_access === false) {
                return true;
            }
            return this.shouldBlurPost(post);
        },
        shouldBlurPost(post) {
            if (this.userState.isAdmin) {
                return false;
            }

            return !this.userState.hasAssinatura || this.userState.statusAssinatura !== 'aprovado';
        },
        forceUpdate() {
            // Forçar atualização do componente quando login/logout ocorrer
            this.$forceUpdate();
        },
        getTruncatedDescription(description) {
            if (!description) return '';
            return description.length > 200 ? description.substring(0, 200) + '...' : description;
        },
        getMenuItems(contentIndex) {
            const post = this.conteudos[contentIndex];
            return [
                {
                    label: 'Editar Post',
                    icon: 'pi pi-pencil',
                    command: () => this.abrirEdicaoPost(contentIndex)
                },
                {
                    label: post.status === 'ativo' ? 'Inativar Post' : 'Ativar Post',
                    icon: post.status === 'ativo' ? 'pi pi-eye-slash' : 'pi pi-eye',
                    command: () => this.togglePostStatus(contentIndex)
                },
                {
                    label: 'Deletar Post',
                    icon: 'pi pi-trash',
                    command: () => this.deletarPost(contentIndex)
                }
            ];
        },
        abrirEdicaoPost(contentIndex) {
            const post = this.conteudos[contentIndex];
            this.editPostIndex = contentIndex;
            this.editForm = {
                description: post.description || '',
                preco: post.preco != null ? Number(post.preco) : null
            };
            this.editDialogVisible = true;
        },
        async salvarEdicaoPost() {
            const post = this.conteudos[this.editPostIndex];
            if (!post?.id) return;

            if (!this.editForm.description?.trim()) {
                this.$toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Descrição obrigatória', life: 3000 });
                return;
            }
            if (this.editForm.preco === null || Number(this.editForm.preco) < 0.01) {
                this.$toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Preço inválido', life: 3000 });
                return;
            }

            try {
                this.editLoading = true;
                const response = await this.api.put(`/posts/${post.id}`, {
                    description: this.editForm.description.trim(),
                    preco: Number(this.editForm.preco)
                });
                post.description = response.data.data.description;
                post.preco = response.data.data.preco;
                this.editDialogVisible = false;
                this.$toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Post atualizado',
                    life: 3000
                });
            } catch (error) {
                const detail = error.response?.data?.message || 'Erro ao atualizar post';
                this.$toast.add({ severity: 'error', summary: 'Erro', detail, life: 3000 });
            } finally {
                this.editLoading = false;
            }
        },
        toggleMenu(event, contentIndex) {
            this.currentMenuIndex = contentIndex;
            const menuRef = this.menuRefs[contentIndex];
            if (menuRef) {
                menuRef.toggle(event);
            }
        },
        async togglePin(contentIndex) {
            const post = this.conteudos[contentIndex];
            const postId = post.id;

            if (!postId) {
                this.$toast.add({ severity: 'error', summary: 'Erro', detail: 'ID do post não encontrado', life: 3000 });
                return;
            }

            try {
                const response = await this.api.post(`/posts/${postId}/toggle-fixed`);
                post.is_fixed = response.data.data.is_fixed;
                
                this.$toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: response.data.message,
                    life: 3000
                });
            } catch (error) {
                let errorMessage = 'Erro ao fixar post';
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                this.$toast.add({ severity: 'error', summary: 'Erro', detail: errorMessage, life: 3000 });
            }
        },
        async togglePostStatus(contentIndex) {
            const post = this.conteudos[contentIndex];
            const postId = post.id;

            if (!postId) {
                this.$toast.add({ severity: 'error', summary: 'Erro', detail: 'ID do post não encontrado', life: 3000 });
                return;
            }

            try {
                const response = await this.api.post(`/posts/${postId}/toggle-status`);
                post.status = response.data.data.status;
                
                this.$toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: response.data.message,
                    life: 3000
                });
            } catch (error) {
                let errorMessage = 'Erro ao alterar status do post';
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                this.$toast.add({ severity: 'error', summary: 'Erro', detail: errorMessage, life: 3000 });
            }
        },
        async deletarPost(contentIndex) {
            const post = this.conteudos[contentIndex];
            const postId = post.id;

            if (!postId) {
                this.$toast.add({ severity: 'error', summary: 'Erro', detail: 'ID do post não encontrado', life: 3000 });
                return;
            }

            if (!confirm('Tem certeza que deseja deletar este post?')) {
                return;
            }

            try {
                await this.api.delete(`/posts/${postId}`);
                this.conteudos.splice(contentIndex, 1);
                
                this.$toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Post deletado com sucesso',
                    life: 3000
                });
            } catch (error) {
                let errorMessage = 'Erro ao deletar post';
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                this.$toast.add({ severity: 'error', summary: 'Erro', detail: errorMessage, life: 3000 });
            }
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
        async likeContent(contentIndex) {
            const post = this.conteudos[contentIndex];
            const postId = post.id;

            if (!postId) {
                this.$toast.add({ severity: 'error', summary: 'Erro', detail: 'ID do post não encontrado', life: 3000 });
                return;
            }

            try {
                const response = await this.api.post(`/posts/${postId}/like`);
                // Atualizar o estado do post
                post.isLiked = response.data.liked;
                post.likes = response.data.likes_count;

                const msg = post.isLiked ? 'Curtido!' : 'Descurtido!';
                const detail = post.isLiked ? 'Você curtiu esta foto' : 'Você descurtiu esta foto';

                this.$toast.add({ severity: post.isLiked ? 'success' : 'warn', summary: msg, detail: detail, life: 3000 });
            } catch (error) {
                console.error('Erro ao curtir post:', error);
                this.$toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao curtir post', life: 3000 });
            }
        },
        async abrirDrawerComentarios(contentIndex) {
            // Verificar se usuário pode interagir
            if (!this.canInteract) {
                return;
            }

            this.conteudoAtualIndex = contentIndex;
            this.drawerVisible = true;
        },
        comentariosCarregados(comentarios) {
            if (this.conteudoAtualIndex !== null && this.conteudos[this.conteudoAtualIndex]) {
                this.conteudos[this.conteudoAtualIndex].comments = comentarios;
                this.conteudos[this.conteudoAtualIndex].commentsCount = comentarios.length;
            }
        },
        updateUserState() {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                this.userState = {
                    isLoggedIn: !!user.id && !!localStorage.getItem('token'),
                    isAdmin: user.is_admin === true || user.is_admin === 'true' || user.is_admin === 1,
                    hasAssinatura: user.assinatura === true || user.assinatura === 'true' || user.assinatura === 1,
                    statusAssinatura: user.status_assinatura
                };
            } catch (error) {
                console.error('Erro ao atualizar estado do usuário:', error);
                this.userState = {
                    isLoggedIn: false,
                    isAdmin: false,
                    hasAssinatura: false,
                    statusAssinatura: null
                };
            }
        },
        handleStorageChange(event) {
            // Atualizar estado quando localStorage mudar
            if (event.key === 'user' || event.key === 'token') {
                this.updateUserState();
            }
        },
        handleVisibilityChange() {
            // Quando o usuário volta para a aba, verificar se os dados precisam ser atualizados
            if (!document.hidden && this.conteudos.length > 0) {
                // Pequeno delay para garantir que a autenticação foi processada
                setTimeout(() => {
                    this.refreshLikesState();
                }, 100);
            }
        },
        async refreshLikesState() {
            // Se não estiver logado, não há necessidade de atualizar
            if (!this.userState.isLoggedIn) {
                return;
            }

            try {
                // Para cada post, verificar se o estado de like está correto
                for (let i = 0; i < this.conteudos.length; i++) {
                    const post = this.conteudos[i];
                    if (post.id) {
                        // Fazer uma chamada leve para verificar o estado do like
                        const response = await this.api.get(`/posts/${post.id}/like-status`, { skipLoading: true });
                        if (response.data) {
                            post.isLiked = response.data.isLiked;
                            post.likes = response.data.likes_count;
                        }
                    }
                }
            } catch (error) {
                // Silenciar erros para não incomodar o usuário
                console.warn('Erro ao atualizar estado dos likes:', error);
            }
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
            const postId = conteudoAtual.id;

            if (!postId) {
                this.$toast.add({ severity: 'error', summary: 'Erro', detail: 'ID do post não encontrado', life: 3000 });
                return;
            }
            
            // Garante que o array de comentários existe
            if (!conteudoAtual.comments) {
                conteudoAtual.comments = [];
            }
            
            try {
                const response = await this.api.post(`/posts/${postId}/comments`, {
                    comment: texto.trim()
                });
                
                // Adiciona o comentário retornado pelo backend
                conteudoAtual.comments.push(response.data.data);
                conteudoAtual.commentsCount = conteudoAtual.comments.length;
            } catch (error) {
                console.error('Erro ao adicionar comentário:', error);
                this.$toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao adicionar comentário', life: 3000 });
            }
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
            
            try {
                const response = await this.api.post(`/comments/${data.comentarioId}/replies`, {
                    reply: data.resposta.trim()
                });
                
                // Atualiza a resposta com os dados do backend
                comentario.reply = response.data.data;
            } catch (error) {
                console.error('Erro ao responder comentário:', error);
                this.$toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao responder comentário', life: 3000 });
            }
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
            
            try {
                await this.api.delete(`/comments/${comentarioId}`);
                
                // Remove o comentário localmente
                const index = conteudoAtual.comments.findIndex(c => c.id === comentarioId);
                if (index !== -1) {
                    conteudoAtual.comments.splice(index, 1);
                    conteudoAtual.commentsCount = conteudoAtual.comments.length;
                }
            } catch (error) {
                console.error('Erro ao deletar comentário:', error);
                this.$toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar comentário', life: 3000 });
            }
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
            
            try {
                await this.api.delete(`/comment-replies/${comentario.reply.id}`);
                
                // Remove a resposta localmente
                delete comentario.reply;
            } catch (error) {
                console.error('Erro ao deletar resposta:', error);
                this.$toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar resposta', life: 3000 });
            }
        }
    }
}
</script>

<style scoped lang="scss">
:deep(.p-card) {
    border-radius: 15px;
    background-color: #121212;
}

.carousel-media-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    position: relative;
}

.media-content {
    width: 100%;
    max-width: 100%;
    height: auto;
    max-height: 600px;
    object-fit: contain;
    display: block;
}

.media-content video {
    width: 100%;
    max-width: 100%;
    height: auto;
    max-height: 600px;
}

.blur-container {
    position: relative;
    overflow: hidden;
}

.blur-image {
    filter: blur(20px) !important;
    user-select: none !important;
    pointer-events: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    -webkit-touch-callout: none !important;
    -webkit-tap-highlight-color: transparent !important;
}

.blur-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 10;
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -webkit-touch-callout: none;
    display: flex;
    align-items: center;
    justify-content: center;
}

.blur-text {
    color: #ffffff;
    text-align: center;
    padding: 2rem;
    background: rgba(0, 0, 0, 0.75);
    border-radius: 12px;
    z-index: 11;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    max-width: 90%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
}

.blur-icon {
    color: #f5cee1;
    margin-bottom: 0.5rem;
}

.blur-message {
    font-size: 1.3rem;
    font-weight: bold;
    color: #ffffff;
    line-height: 1.4;
}

.blur-submessage {
    font-size: 1rem;
    color: #f5cee1;
    opacity: 0.9;
    font-weight: 500;
}

.locked-placeholder {
    background: #1a1a1a;
    border-radius: 12px;
    min-height: 280px;
}

.blur-overlay.static-lock {
    position: relative;
    min-height: 280px;
    background: transparent;
}

.lock-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.75rem 1rem;
    background: rgba(245, 206, 225, 0.12);
    border: 1px solid rgba(245, 206, 225, 0.35);
    border-radius: 10px;
    color: #f5cee1;
    font-size: 0.9rem;
    text-align: center;
}

.unlock-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem 1rem;
    background: #1a1a1a;
    border-radius: 12px;
    border: 1px solid rgba(245, 206, 225, 0.2);
}

.unlock-lock {
    font-size: 2rem;
    color: #f5cee1;
}

.unlock-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #ffffff;
    font-size: 0.95rem;
}

.unlock-price {
    font-weight: 700;
    color: #f5cee1;
}

.unlock-btn {
    max-width: 320px;
}

.blur-container {
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    -webkit-touch-callout: none !important;
}

.pin-active {
    color: #f5cee1 !important;
    background-color: rgba(118, 28, 73, 0.8) !important;
}

.pin-active :deep(.p-button-icon) {
    color: #f5cee1 !important;
}

.tag-status {
    font-size: 0.65rem !important;
    padding: 0.15rem 0.4rem !important;
    display: inline-block !important;
    width: auto !important;
    max-width: fit-content !important;
}

:deep(.p-avatar img) {
    object-fit: cover !important;
    object-position: center !important;
    width: 100% !important;
    height: 100% !important;
}

:deep(.p-avatar) {
    overflow: hidden !important;
}

@media (max-width: 768px) {
    .d-flex.justify-content-between {
        flex-wrap: wrap;
    }
    
    .col-2 {
        width: 100% !important;
        margin-top: 0.5rem;
    }
}



@media (max-width: 768px) {
    :deep(.p-carousel-content) {
        width: 300px !important;
    }
}
</style>