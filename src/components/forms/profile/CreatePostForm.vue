<template>
    <div>
        <div class="col-md-12 text-300 mb-3">
            <h4>Criar Novo Post</h4>
        </div>
            <div class="row mb-3">
                <div class="col-md-12">
                    <IftaLabel>
                        <Textarea 
                            id="description" 
                            v-model="dados.description" 
                            class="w-full" 
                            rows="5"
                            :class="{ 'p-invalid': errors.description }"
                        />
                        <label for="description">Descrição <span class="text-red-500">*</span></label>
                    </IftaLabel>
                    <small v-if="errors.description" class="text-red-500">* {{ errors.description }}</small>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-12">
                    <label class="text-white mb-2 d-block">
                        Prévia pública (1 imagem ou vídeo)
                        <span class="text-400 text-sm fw-normal"> — visível para quem não assina</span>
                    </label>
                    <FileUpload
                        mode="advanced"
                        :multiple="false"
                        accept="image/*,video/*"
                        @select="onPreviewSelect"
                        @remove="onPreviewRemove"
                        @clear="onPreviewClear"
                        :auto="false"
                        chooseLabel="Selecionar Prévia"
                        uploadLabel="Enviar"
                        cancelLabel="Cancelar"
                        :customUpload="true"
                        :fileLimit="1"
                    >
                        <template #empty>
                            <p class="text-white">Arraste e solte a prévia aqui ou clique para selecionar (opcional).</p>
                        </template>
                    </FileUpload>
                    <small v-if="errors.preview" class="text-red-500">* {{ errors.preview }}</small>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-12">
                    <label class="text-white mb-2 d-block">
                        Conteúdo exclusivo (imagens e vídeos)
                        <span class="text-red-500">*</span>
                        <span class="text-400 text-sm fw-normal"> — só para assinantes</span>
                    </label>
                    <FileUpload
                        mode="advanced"
                        :multiple="true"
                        accept="image/*,video/*"
                        @select="onFileSelect"
                        @remove="onFileRemove"
                        :auto="false"
                        chooseLabel="Selecionar Arquivos"
                        uploadLabel="Enviar"
                        cancelLabel="Cancelar"
                        :customUpload="true"
                        :fileLimit="20"
                    >
                        <template #empty>
                            <p class="text-white">Arraste e solte arquivos aqui ou clique para selecionar.</p>
                        </template>
                    </FileUpload>
                    <small v-if="errors.media" class="text-red-500">* {{ errors.media }}</small>
                </div>
            </div>


            <div class="row d-flex justify-content-end">
                <div class="col-md-3">
                    <Button 
                        label="Criar Post" 
                        severity="primary" 
                        class="w-full" 
                        @click="criarPost" 
                        :loading="loading"
                        :disabled="selectedFiles.length === 0"
                    />
                </div>
            </div>
    </div>
</template>

<script>
import IftaLabel from 'primevue/iftalabel';
import Textarea from 'primevue/textarea';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import Toast from 'primevue/toast';

export default {
    name: 'CreatePostForm',
    components: {
        IftaLabel,
        Textarea,
        FileUpload,
        Button,
        Toast
    },
    emits: ['post-created'],
    data() {
        return {
            dados: {
                description: ''
            },
            previewFile: null,
            selectedFiles: [],
            loading: false,
            errors: {}
        }
    },
    methods: {
        onPreviewSelect(event) {
            const files = Array.from(event.files || []);
            this.previewFile = files[0] || null;
        },
        onPreviewRemove() {
            this.previewFile = null;
        },
        onPreviewClear() {
            this.previewFile = null;
        },
        onFileSelect(event) {
            const files = Array.from(event.files);
            files.forEach(file => {
                this.selectedFiles.push(file);
            });
        },
        onFileRemove(event) {
            const removedFile = event.file;
            const index = this.selectedFiles.findIndex(f => f.name === removedFile.name && f.size === removedFile.size);
            if (index !== -1) {
                this.selectedFiles.splice(index, 1);
            }
        },
        async criarPost() {
            this.errors = {};
            
            if (!this.dados.description || !this.dados.description.trim()) {
                this.errors.description = 'A descrição é obrigatória';
            }
            
            if (this.selectedFiles.length === 0) {
                this.errors.media = 'Selecione pelo menos uma mídia exclusiva (imagem ou vídeo)';
            }
            
            if (Object.keys(this.errors).length > 0) {
                return;
            }
            
            try {
                this.loading = true;
                
                const postResponse = await this.api.post('/posts', {
                    description: this.dados.description.trim()
                });
                
                const postId = postResponse.data.data.id;

                if (this.previewFile) {
                    const previewData = new FormData();
                    previewData.append('media[]', this.previewFile);
                    previewData.append('is_preview', '1');

                    await this.api.post(`/posts/${postId}/media`, previewData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                }
                
                if (this.selectedFiles.length > 0) {
                    const formData = new FormData();
                    this.selectedFiles.forEach(file => {
                        formData.append('media[]', file);
                    });
                    
                    await this.api.post(`/posts/${postId}/media`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                }
                
                this.dados.description = '';
                this.previewFile = null;
                this.selectedFiles = [];
                
                this.$emit('post-created');
            } catch (error) {
                let errorMessage = 'Erro ao criar post';
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
        }
    }
}
</script>

<style scoped lang="scss">
</style>
