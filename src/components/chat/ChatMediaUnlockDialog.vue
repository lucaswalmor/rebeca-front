<template>
    <Dialog
        :visible="visible"
        modal
        header="Liberar envio de fotos/vídeos"
        :style="{ width: '28rem' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <div class="unlock-body">
            <p>
                Compre um pacote com <strong>{{ creditsPerPack }} envios</strong> de foto ou vídeo.
                Os créditos não expiram.
            </p>
            <p class="credits-line">Seus créditos atuais: <strong>{{ mediaCredits }}</strong></p>
            <p v-if="price != null" class="price-line">Valor do pacote: <strong>{{ formatPrice(price) }}</strong></p>
            <p v-else class="price-line warn">Pacote ainda não configurado pela Rebeca.</p>
        </div>
        <template #footer>
            <Button label="Cancelar" text @click="$emit('update:visible', false)" />
            <Button
                label="Gerar pagamento"
                icon="pi pi-credit-card"
                :loading="loading"
                :disabled="!price"
                @click="gerarLink"
            />
        </template>
    </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

export default {
    name: 'ChatMediaUnlockDialog',
    components: { Dialog, Button },
    props: {
        visible: Boolean,
        mediaCredits: { type: Number, default: 0 },
        creditsPerPack: { type: Number, default: 5 },
        price: { type: [Number, String], default: null },
    },
    emits: ['update:visible'],
    data() {
        return { loading: false };
    },
    methods: {
        formatPrice(value) {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
        },
        async gerarLink() {
            this.loading = true;
            try {
                const { data } = await this.api.post('/chat/media-package/gerar-link');
                if (data.success && data.link) {
                    window.location.href = data.link;
                    return;
                }
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: data.message || 'Não foi possível gerar o link',
                    life: 3000,
                });
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Erro ao gerar pagamento',
                    life: 4000,
                });
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped lang="scss">
.unlock-body {
    color: #ddd;
    line-height: 1.5;
}

.credits-line,
.price-line {
    margin-top: 0.75rem;
}

.warn {
    color: #f5cee1;
}
</style>
