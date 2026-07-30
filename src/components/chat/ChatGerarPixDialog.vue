<template>
    <Dialog
        :visible="visible"
        modal
        header="Gerar Pix"
        :style="{ width: '28rem', maxWidth: '95vw' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <div class="gerar-body">
            <p class="lead">
                Defina o valor do presentinho. O cliente vai receber um botão no chat para pagar.
            </p>

            <IftaLabel>
                <InputText
                    id="gerar_pix_valor"
                    v-mask="['R$ #,##', 'R$ ##,##', 'R$ ###,##', 'R$ #.###,##', 'R$ ##.###,##', 'R$ ###.###,##', 'R$ #.###.###,##']"
                    v-model="valorMasked"
                    class="w-full"
                />
                <label for="gerar_pix_valor">Valor</label>
            </IftaLabel>
            <p class="hint">Mínimo R$ 1,01</p>
        </div>

        <template #footer>
            <Button label="Cancelar" text @click="$emit('update:visible', false)" />
            <Button
                class="confirm-btn"
                label="Enviar no chat"
                icon="pi pi-send"
                :loading="loading"
                @click="confirmar"
            />
        </template>
    </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import IftaLabel from 'primevue/iftalabel';

export default {
    name: 'ChatGerarPixDialog',
    components: { Dialog, Button, InputText, IftaLabel },
    props: {
        visible: Boolean,
        conversationId: { type: [Number, String], required: true },
    },
    emits: ['update:visible', 'created'],
    data() {
        return {
            loading: false,
            valorMasked: '',
        };
    },
    watch: {
        visible(val) {
            if (val) this.valorMasked = '';
        },
    },
    methods: {
        parseValor(valorFormatado) {
            if (!valorFormatado) return null;
            const limpo = String(valorFormatado)
                .replace(/R\$\s*/g, '')
                .replace(/\./g, '')
                .replace(',', '.');
            const n = parseFloat(limpo);
            return Number.isFinite(n) ? n : null;
        },
        async confirmar() {
            const valor = this.parseValor(this.valorMasked);
            if (!valor || valor < 1.01) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Valor inválido',
                    detail: 'Informe um valor de no mínimo R$ 1,01.',
                    life: 3500,
                });
                return;
            }

            this.loading = true;
            try {
                const { data } = await this.api.post(
                    `/chat/conversations/${this.conversationId}/presentinho-offers`,
                    { valor }
                );
                this.$emit('created', data.data || data);
                this.$emit('update:visible', false);
                this.$toast.add({
                    severity: 'success',
                    summary: 'Enviado',
                    detail: 'Pedido de presentinho enviado no chat.',
                    life: 2800,
                });
            } catch (e) {
                const errors = e.response?.data?.errors;
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: errors?.valor?.[0]
                        || e.response?.data?.message
                        || 'Não foi possível gerar o Pix',
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
.gerar-body {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    color: #ddd;
}

.lead {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.45;
    color: #ccc;
}

.hint {
    margin: 0;
    font-size: 0.78rem;
    color: #888;
}

.confirm-btn {
    background: #34d399 !important;
    border-color: #34d399 !important;
    color: #064e3b !important;
}
</style>
