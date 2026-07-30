<template>
    <div>
        <div class="col-md-12 text-300 mb-3">
            <h4>Criar Novo Post</h4>
            <p class="text-400 text-sm mb-0">
                Você pode criar um post só com prévia (grátis para assinantes) ou prévia + conteúdo exclusivo pago.
            </p>
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
                    <IftaLabel>
                        <InputNumber
                            id="preco"
                            v-model="dados.preco"
                            class="w-full"
                            mode="currency"
                            currency="BRL"
                            locale="pt-BR"
                            :min="0"
                            :minFractionDigits="2"
                            :class="{ 'p-invalid': errors.preco }"
                        />
                        <label for="preco">
                            Preço do conteúdo
                            <span v-if="requiresPrice" class="text-red-500">*</span>
                            <span v-else class="text-400 text-sm fw-normal"> — opcional (só prévia = grátis)</span>
                        </label>
                    </IftaLabel>
                    <small v-if="errors.preco" class="text-red-500">* {{ errors.preco }}</small>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-12">
                    <label class="text-white mb-2 d-block">
                        Prévia (imagens e vídeos)
                        <span v-if="!hasExclusiveFiles" class="text-red-500">*</span>
                        <span class="text-400 text-sm fw-normal"> — visível para assinantes</span>
                    </label>
                    <FileUpload
                        mode="advanced"
                        :multiple="true"
                        accept="image/*,video/*"
                        @select="onPreviewSelect"
                        @remove="onPreviewRemove"
                        @clear="onPreviewClear"
                        :auto="false"
                        chooseLabel="Selecionar Prévia"
                        uploadLabel="Enviar"
                        cancelLabel="Cancelar"
                        :customUpload="true"
                        :fileLimit="50"
                    >
                        <template #empty>
                            <p class="text-white">Arraste e solte as prévias aqui ou clique para selecionar.</p>
                        </template>
                    </FileUpload>
                    <small v-if="errors.preview" class="text-red-500">* {{ errors.preview }}</small>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-12">
                    <label class="text-white mb-2 d-block">
                        Conteúdo exclusivo (imagens e vídeos)
                        <span class="text-400 text-sm fw-normal"> — opcional; liberado após compra</span>
                    </label>
                    <FileUpload
                        mode="advanced"
                        :multiple="true"
                        accept="image/*,video/*"
                        @select="onFileSelect"
                        @remove="onFileRemove"
                        @clear="onFileClear"
                        :auto="false"
                        chooseLabel="Selecionar Arquivos"
                        uploadLabel="Enviar"
                        cancelLabel="Cancelar"
                        :customUpload="true"
                        :fileLimit="50"
                    >
                        <template #empty>
                            <p class="text-white">Opcional. Se não enviar, o post fica só com a prévia (grátis para assinantes).</p>
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
                        :disabled="!canSubmit"
                    />
                </div>
            </div>
    </div>
</template>

<script>
import IftaLabel from 'primevue/iftalabel';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import Toast from 'primevue/toast';

export default {
    name: 'CreatePostForm',
    components: {
        IftaLabel,
        Textarea,
        InputNumber,
        FileUpload,
        Button,
        Toast
    },
    emits: ['post-created'],
    data() {
        return {
            dados: {
                description: '',
                preco: null
            },
            previewFiles: [],
            selectedFiles: [],
            loading: false,
            errors: {}
        }
    },
    computed: {
        hasPreviewFiles() {
            return this.previewFiles.length > 0;
        },
        hasExclusiveFiles() {
            return this.selectedFiles.length > 0;
        },
        requiresPrice() {
            return this.hasExclusiveFiles;
        },
        canSubmit() {
            return this.hasPreviewFiles || this.hasExclusiveFiles;
        }
    },
    methods: {
        onPreviewSelect(event) {
            const files = Array.from(event.files || []);
            files.forEach(file => {
                this.previewFiles.push(file);
            });
        },
        onPreviewRemove(event) {
            const removedFile = event.file;
            const index = this.previewFiles.findIndex(f => f.name === removedFile.name && f.size === removedFile.size);
            if (index !== -1) {
                this.previewFiles.splice(index, 1);
            }
        },
        onPreviewClear() {
            this.previewFiles = [];
        },
        onFileSelect(event) {
            const files = Array.from(event.files || []);
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
        onFileClear() {
            this.selectedFiles = [];
        },
        async criarPost() {
            this.errors = {};
            
            if (!this.dados.description || !this.dados.description.trim()) {
                this.errors.description = 'A descrição é obrigatória';
            }

            if (!this.hasPreviewFiles && !this.hasExclusiveFiles) {
                this.errors.preview = 'Envie pelo menos a prévia do post';
            }

            // Post só com prévia: preço opcional (vira 0).
            // Post com exclusivo: preço obrigatório.
            if (this.requiresPrice) {
                if (this.dados.preco === null || this.dados.preco === undefined || Number(this.dados.preco) < 0.01) {
                    this.errors.preco = 'Informe o preço do conteúdo exclusivo (mínimo R$ 0,01)';
                }
            }
            
            if (Object.keys(this.errors).length > 0) {
                return;
            }
            
            try {
                this.loading = true;

                const preco = this.requiresPrice
                    ? Number(this.dados.preco)
                    : Number(this.dados.preco || 0);
                
                const postResponse = await this.api.post('/posts', {
                    description: this.dados.description.trim(),
                    preco
                });
                
                const postId = postResponse.data.data.id;

                if (this.hasPreviewFiles) {
                    const previewData = new FormData();
                    this.previewFiles.forEach(file => {
                        previewData.append('media[]', file);
                    });
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
                this.dados.preco = null;
                this.previewFiles = [];
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
