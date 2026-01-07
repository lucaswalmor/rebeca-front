<template>
    <Drawer 
        v-model:visible="visible" 
        :header="`Comentários (${comentarios.length})`" 
        position="bottom" 
        :style="{ height: '70vh' }"
        class="drawer-comentarios"
    >
        <div class="comentarios-container">
            <div v-if="comentarios.length === 0" class="empty-state">
                <i class="pi pi-comments empty-icon"></i>
                <p class="empty-text">Nenhum comentário ainda</p>
                <p class="empty-subtext">Seja o primeiro a comentar!</p>
            </div>
            
            <div v-else class="comentarios-list">
                <div 
                    v-for="(comentario, index) in comentarios" 
                    :key="comentario.id || index"
                    class="comentario-item"
                >
                    <div class="comentario-wrapper">
                        <!-- Avatar à esquerda -->
                        <Avatar 
                            :image="comentario.avatar || 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'" 
                            shape="circle"
                            size="large"
                            class="comentario-avatar"
                        />
                        
                        <!-- Caixa de comentário à direita -->
                        <div class="comentario-content">
                            <div class="comentario-box">
                                <div class="comentario-header">
                                    <span class="comentario-nome">{{ comentario.name || 'Usuário' }}</span>
                                    <button 
                                        v-if="podeDeletarComentario(comentario)"
                                        class="comentario-delete-btn"
                                        @click="deletarComentario(comentario.id)"
                                        title="Deletar comentário"
                                    >
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                                
                                <div class="comentario-texto">
                                    {{ comentario.comment }}
                                </div>
                                
                                <!-- Resposta da cliente (se existir) -->
                                <div v-if="comentario.reply" class="comentario-reply">
                                    <div class="reply-header">
                                        <span class="reply-nome">{{ comentario.reply.name || 'Becalima007' }}</span>
                                        <button 
                                            v-if="podeDeletarResposta(comentario.reply)"
                                            class="reply-delete-btn"
                                            @click="deletarResposta(comentario.id)"
                                            title="Deletar resposta"
                                        >
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                    <div class="reply-texto">
                                        {{ comentario.reply.comment }}
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Ações do comentário -->
                            <div class="comentario-actions">
                                <span class="comentario-timestamp">{{ comentario.timeAgo || comentario.formattedTime || 'Agora' }}</span>
                                <button 
                                    class="comentario-responder-btn"
                                    @click="toggleRespostaInput(comentario.id)"
                                >
                                    Responder
                                </button>
                            </div>
                            
                            <!-- Input de resposta (aparece ao clicar em Responder) -->
                            <div v-if="mostrandoRespostaInput === comentario.id" class="resposta-input-container">
                                <div class="resposta-input-wrapper">
                                    <InputGroup>
                                        <InputText 
                                            v-model="respostaTexto[comentario.id]"
                                            placeholder="Escreva uma resposta..."
                                            class="resposta-input"
                                            @keyup.enter="enviarResposta(comentario.id)"
                                        />
                                        <InputGroupAddon>
                                            <Button 
                                                icon="pi pi-face-smile" 
                                                severity="secondary"
                                                text
                                                rounded
                                                @click="toggleEmojiPicker(comentario.id)"
                                                :class="{ 'emoji-active': mostrandoEmojiPicker === comentario.id }"
                                            />
                                        </InputGroupAddon>
                                        <InputGroupAddon>
                                            <Button 
                                                icon="pi pi-send" 
                                                :disabled="!respostaTexto[comentario.id] || !respostaTexto[comentario.id].trim()"
                                                severity="secondary"
                                                @click="enviarResposta(comentario.id)"
                                            />
                                        </InputGroupAddon>
                                    </InputGroup>
                                    
                                    <!-- Seletor de Emojis para resposta -->
                                    <div v-if="mostrandoEmojiPicker === comentario.id" class="emoji-picker-container">
                                        <EmojiPicker 
                                            @emoji-selected="(emoji) => inserirEmoji(emoji, comentario.id)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <template #footer>
            <div class="comentario-input-container">
                <Avatar 
                    image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" 
                    shape="circle"
                    size="normal"
                    class="input-avatar"
                />
                <div class="input-wrapper">
                    <InputGroup>
                        <InputText 
                            v-model="novoComentario" 
                            placeholder="Adicione um comentário..."
                            class="comentario-input"
                            @keyup.enter="adicionarComentario"
                        />
                        <InputGroupAddon>
                            <Button 
                                icon="pi pi-face-smile" 
                                severity="secondary"
                                text
                                rounded
                                @click="toggleEmojiPicker('main')"
                                :class="{ 'emoji-active': mostrandoEmojiPicker === 'main' }"
                            />
                        </InputGroupAddon>
                        <InputGroupAddon>
                            <Button 
                                icon="pi pi-send" 
                                :disabled="!novoComentario.trim()"
                                severity="secondary"
                                @click="adicionarComentario"
                            />
                        </InputGroupAddon>
                    </InputGroup>
                    
                    <!-- Seletor de Emojis -->
                    <div v-if="mostrandoEmojiPicker === 'main'" class="emoji-picker-container">
                        <EmojiPicker 
                            @emoji-selected="(emoji) => inserirEmoji(emoji, 'main')"
                        />
                    </div>
                </div>
            </div>
        </template>
    </Drawer>
</template>

<script>
import { Drawer, Avatar, InputGroup, InputGroupAddon, InputText, Button } from 'primevue';
import EmojiPicker from '../EmojiPicker.vue';

export default {
    name: 'DrawerComentarios',
    components: {
        Drawer,
        Avatar,
        InputGroup,
        InputGroupAddon,
        InputText,
        Button,
        EmojiPicker
    },
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        comentarios: {
            type: Array,
            default: () => []
        }
    },
    emits: ['update:modelValue', 'adicionar-comentario', 'responder-comentario', 'deletar-comentario', 'deletar-resposta'],
    data() {
        return {
            novoComentario: '',
            mostrandoRespostaInput: null,
            respostaTexto: {},
            mostrandoEmojiPicker: null
        }
    },
    computed: {
        visible: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit('update:modelValue', value);
            }
        }
    },
    computed: {
        isAdmin() {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.is_admin === true;
        },
        currentUserId() {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.id;
        }
    },
    methods: {
        podeDeletarComentario(comentario) {
            // Admin pode deletar qualquer comentário
            if (this.isAdmin) {
                return true;
            }
            // Usuário comum só pode deletar seus próprios comentários
            return comentario.user_id === this.currentUserId;
        },
        podeDeletarResposta(reply) {
            if (!reply) return false;
            // Admin pode deletar qualquer resposta
            if (this.isAdmin) {
                return true;
            }
            // Usuário comum só pode deletar suas próprias respostas
            return reply.user_id === this.currentUserId;
        },
        /**
         * Emite o evento 'adicionar-comentario' para o componente pai
         * com o texto do comentário digitado pelo usuário
         */
        adicionarComentario() {
            const textoComentario = this.novoComentario.trim();
            
            if (textoComentario) {
                this.$emit('adicionar-comentario', textoComentario);
                this.novoComentario = '';
                // Fecha o seletor de emojis ao enviar
                this.mostrandoEmojiPicker = null;
            }
        },
        
        /**
         * Alterna a exibição do input de resposta para um comentário
         */
        toggleRespostaInput(comentarioId) {
            if (this.mostrandoRespostaInput === comentarioId) {
                this.mostrandoRespostaInput = null;
                this.respostaTexto[comentarioId] = '';
            } else {
                this.mostrandoRespostaInput = comentarioId;
                if (!this.respostaTexto[comentarioId]) {
                    this.respostaTexto[comentarioId] = '';
                }
            }
        },
        
        /**
         * Envia uma resposta a um comentário
         */
        enviarResposta(comentarioId) {
            const texto = this.respostaTexto[comentarioId]?.trim();
            
            if (texto) {
                this.$emit('responder-comentario', {
                    comentarioId: comentarioId,
                    resposta: texto
                });
                
                this.respostaTexto[comentarioId] = '';
                this.mostrandoRespostaInput = null;
                // Fecha o seletor de emojis ao enviar
                this.mostrandoEmojiPicker = null;
            }
        },
        
        /**
         * Deleta um comentário
         */
        deletarComentario(comentarioId) {
            if (confirm('Tem certeza que deseja deletar este comentário?')) {
                this.$emit('deletar-comentario', comentarioId);
            }
        },
        
        /**
         * Deleta uma resposta de um comentário
         */
        deletarResposta(comentarioId) {
            if (confirm('Tem certeza que deseja deletar esta resposta?')) {
                this.$emit('deletar-resposta', comentarioId);
            }
        },
        
        /**
         * Alterna o seletor de emoji
         */
        toggleEmojiPicker(context) {
            if (this.mostrandoEmojiPicker === context) {
                this.mostrandoEmojiPicker = null;
            } else {
                this.mostrandoEmojiPicker = context;
            }
        },
        
        /**
         * Insere um emoji no campo de texto
         */
        inserirEmoji(emoji, context) {
            if (context === 'main') {
                this.novoComentario += emoji;
            } else {
                if (!this.respostaTexto[context]) {
                    this.respostaTexto[context] = '';
                }
                this.respostaTexto[context] += emoji;
            }
        },
        
    }
}
</script>

<style scoped lang="scss">
:deep(.p-drawer) {
    background-color: #1a1a1a !important;
    color: #ffffff;
}

.drawer-comentarios {
    :deep(.p-drawer-content) {
        background-color: #1a1a1a;
        color: #ffffff;
    }
    
    :deep(.p-drawer-header) {
        background-color: #1a1a1a;
        border-bottom: 1px solid #2d2d2d;
        color: #ffffff;
        padding: 1.25rem;
        font-weight: 600;
        font-size: 1.1rem;
    }
    
    :deep(.p-drawer-footer) {
        background-color: #1a1a1a;
        border-top: 1px solid #2d2d2d;
        padding: 1rem;
    }
}

.comentarios-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2rem;
    text-align: center;
    
    .empty-icon {
        font-size: 4rem;
        color: #4a4a4a;
        margin-bottom: 1rem;
    }
    
    .empty-text {
        color: #ffffff;
        font-size: 1.2rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
    }
    
    .empty-subtext {
        color: #888888;
        font-size: 0.9rem;
    }
}

.comentarios-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: #1a1a1a;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #4a4a4a;
        border-radius: 3px;
        
        &:hover {
            background: #5a5a5a;
        }
    }
}

.comentario-item {
    padding: 0.75rem 0;
    
    &:first-child {
        padding-top: 0;
    }
}

.comentario-wrapper {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
}

.comentario-avatar {
    flex-shrink: 0;
}

.comentario-content {
    flex: 1;
    min-width: 0;
}

.comentario-box {
    background-color: #2d2d2d;
    border-radius: 18px;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
}

.comentario-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.comentario-nome {
    color: #ffffff;
    font-weight: 600;
    font-size: 0.9rem;
}

.comentario-delete-btn {
    background: none;
    border: none;
    color: #888888;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    
    i {
        font-size: 0.85rem;
    }
    
    &:hover {
        background-color: #3d3d3d;
        color: #ff4444;
    }
    
    &:active {
        transform: scale(0.95);
    }
}

.comentario-texto {
    color: #e0e0e0;
    font-size: 0.9rem;
    line-height: 1.5;
    word-wrap: break-word;
    white-space: pre-wrap;
}

.comentario-reply {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background-color: #333334;
    border-radius: 12px;
}

.reply-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.reply-delete-btn {
    background: none;
    border: none;
    color: #888888;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    
    i {
        font-size: 0.75rem;
    }
    
    &:hover {
        background-color: #3d3d3d;
        color: #ff4444;
    }
    
    &:active {
        transform: scale(0.95);
    }
}

.reply-nome {
    color: #ffffff;
    font-weight: 600;
    font-size: 0.85rem;
}

.reply-texto {
    color: #e0e0e0;
    font-size: 0.85rem;
    line-height: 1.5;
    word-wrap: break-word;
    white-space: pre-wrap;
}

.comentario-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-left: 0.5rem;
    margin-top: 0.25rem;
}

.comentario-timestamp {
    color: #888888;
    font-size: 0.7rem;
    text-transform: uppercase;
}

.comentario-responder-btn {
    background: none;
    border: none;
    color: #888888;
    font-size: 0.75rem;
    cursor: pointer;
    padding: 0;
    
    &:hover {
        color: #ffffff;
        text-decoration: underline;
    }
}

.resposta-input-container {
    margin-top: 0.75rem;
    padding-left: 0.5rem;
}

.resposta-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.resposta-input {
    :deep(.p-inputtext) {
        background-color: #2d2d2d;
        border: 1px solid #3d3d3d;
        color: #ffffff;
        font-size: 0.9rem;
        
        &:focus {
            border-color: #ec4899;
            box-shadow: 0 0 0 0.2rem rgba(236, 72, 153, 0.2);
        }
        
        &::placeholder {
            color: #888888;
        }
    }
}

:deep(.p-inputgroup) {
    .p-inputgroup-addon {
        background-color: #2d2d2d;
        border-color: #3d3d3d;
        
        .p-button {
            color: #888888;
            
            &:hover {
                background-color: #3d3d3d;
                color: #ffffff;
            }
            
            &.emoji-active {
                background-color: #ec4899;
                color: #ffffff;
            }
        }
    }
    
    .p-inputtext {
        background-color: #2d2d2d;
        border-color: #3d3d3d;
        color: #ffffff;
        
        &:focus {
            border-color: #ec4899;
            box-shadow: 0 0 0 0.2rem rgba(236, 72, 153, 0.2);
        }
        
        &::placeholder {
            color: #888888;
        }
    }
}

.emoji-picker-container {
    position: relative;
    margin-top: 0.5rem;
    width: 100%;
    z-index: 10;
}

// Responsividade para mobile
@media (max-width: 768px) {
    .drawer-comentarios {
        :deep(.p-drawer) {
            max-height: 90vh;
        }
        
        :deep(.p-drawer-content) {
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
        }
        
        :deep(.p-drawer-footer) {
            padding: 0.75rem;
            position: relative;
            z-index: 5;
        }
    }
    
    .comentarios-container {
        min-height: 0;
    }
    
    .comentarios-list {
        padding-bottom: 1rem;
        flex: 1;
        min-height: 0;
    }
    
    .emoji-picker-container {
        margin-top: 0.5rem;
        max-width: 100%;
        position: relative;
    }
    
    .resposta-input-wrapper {
        position: relative;
    }
    
    .input-wrapper {
        width: 90%;
    }
    
    .comentario-input-container {
        gap: 0.5rem;
    }
    
    .input-avatar {
        flex-shrink: 0;
    }
}

@media (max-width: 480px) {
    .drawer-comentarios {
        :deep(.p-drawer) {
            max-height: 85vh;
        }
        
        :deep(.p-drawer-header) {
            padding: 1rem;
            font-size: 1rem;
        }
        
        :deep(.p-drawer-footer) {
            padding: 0.5rem;
        }
    }
    
    .emoji-picker-container {
        margin-top: 0.4rem;
    }
    
    .resposta-input-container {
        padding-left: 0.3rem;
    }
    
    .comentario-input-container {
        gap: 0.4rem;
    }
    
    .input-avatar {
        :deep(.p-avatar) {
            width: 2rem;
            height: 2rem;
        }
    }
}

.emoji-picker-wrapper {
    background-color: #2d2d2d;
    border: 1px solid #3d3d3d;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.emoji-picker-header {
    padding: 0.75rem;
    border-bottom: 1px solid #3d3d3d;
}

.emoji-search-input {
    width: 100%;
    
    :deep(.p-inputtext) {
        background-color: #1a1a1a;
        border: 1px solid #3d3d3d;
        color: #ffffff;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        font-size: 0.85rem;
        
        &:focus {
            border-color: #ec4899;
            box-shadow: 0 0 0 0.2rem rgba(236, 72, 153, 0.2);
        }
        
        &::placeholder {
            color: #888888;
        }
    }
}

.emoji-tabs {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem;
    border-bottom: 1px solid #3d3d3d;
    overflow-x: auto;
    
    &::-webkit-scrollbar {
        height: 4px;
    }
    
    &::-webkit-scrollbar-track {
        background: #1a1a1a;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #4a4a4a;
        border-radius: 2px;
    }
}

.emoji-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    background: none;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 60px;
    color: #888888;
    
    &:hover {
        background-color: #3d3d3d;
        color: #ffffff;
    }
    
    &.active {
        background-color: #ec4899;
        color: #ffffff;
    }
}

.emoji-tab-icon {
    font-size: 1.2rem;
}

.emoji-tab-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    font-weight: 500;
}

.emoji-picker-content {
    max-height: 250px;
    overflow-y: auto;
    padding: 0.75rem;
    
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: #1a1a1a;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #4a4a4a;
        border-radius: 3px;
        
        &:hover {
            background: #5a5a5a;
        }
    }
}

.emoji-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 0.5rem;
}

.emoji-item {
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 6px;
    text-align: center;
    transition: all 0.2s;
    
    &:hover {
        background-color: #3d3d3d;
        transform: scale(1.2);
    }
    
    &:active {
        transform: scale(0.9);
    }
}

.comentario-input-container {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
}

.input-avatar {
    flex-shrink: 0;
}

.input-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.comentario-input {
    :deep(.p-inputtext) {
        background-color: #2d2d2d;
        border: 1px solid #3d3d3d;
        color: #ffffff;
        font-size: 0.9rem;
        
        &:focus {
            border-color: #ec4899;
            box-shadow: 0 0 0 0.2rem rgba(236, 72, 153, 0.2);
        }
        
        &::placeholder {
            color: #888888;
        }
    }
}
</style>
