<template>
    <Dialog
        :visible="visible"
        modal
        header="Presentinho"
        :style="{ width: '28rem', maxWidth: '95vw' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <div class="gift-body">
            <div class="gift-icon" aria-hidden="true">
                <i class="pi pi-gift"></i>
            </div>
            <p class="gift-lead">
                Quer deixar um presentinho especial pra Beca?
            </p>
            <p class="gift-sub">
                Escolha um valor com carinho — cada gesto faz a diferença e ela vai ficar muito feliz.
            </p>

            <div class="gift-input-wrap">
                <IftaLabel>
                    <InputText
                        id="presentinho_valor"
                        v-mask="['R$ #,##', 'R$ ##,##', 'R$ ###,##', 'R$ #.###,##', 'R$ ##.###,##', 'R$ ###.###,##', 'R$ #.###.###,##']"
                        v-model="valorMasked"
                        class="w-full gift-input"
                        inputmode="decimal"
                    />
                    <label for="presentinho_valor">Valor do presentinho</label>
                </IftaLabel>
                <p class="gift-hint">Mínimo R$ 50,00</p>
            </div>
        </div>

        <template #footer>
            <Botao texto="Agora não" tipo="texto" tema="rosa" @click="$emit('update:visible', false)" />
            <Botao
                texto="Presentear"
                icone="pi pi-heart"
                tema="rosa"
                :carregando="loading"
                @click="confirmar"
            />
        </template>
    </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import Botao from '@/components/ui/Botao.vue';
import InputText from 'primevue/inputtext';
import IftaLabel from 'primevue/iftalabel';

export default {
    name: 'ChatPresentinhoDialog',
    components: { Dialog, Botao, InputText, IftaLabel },
    props: {
        visible: Boolean,
        conversationId: { type: [Number, String], required: true },
    },
    emits: ['update:visible'],
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
            if (!valor || valor < 50) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Valor inválido',
                    detail: 'Informe um valor de no mínimo R$ 50,00.',
                    life: 3500,
                });
                return;
            }

            this.loading = true;
            try {
                const { data } = await this.api.post(
                    `/chat/conversations/${this.conversationId}/presentinhos`,
                    { valor }
                );

                if (!data?.link) {
                    throw new Error(data?.message || 'Link de pagamento não gerado');
                }

                window.location.href = data.link;
            } catch (e) {
                const errors = e.response?.data?.errors;
                const validationMsg = errors?.valor?.[0];
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: validationMsg
                        || e.response?.data?.message
                        || e.message
                        || 'Não foi possível gerar o presentinho',
                    life: 4000,
                });
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped lang="scss">
.gift-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
    color: #ddd;
    padding: 0.25rem 0 0.5rem;
}

.gift-icon {
    width: 3.2rem;
    height: 3.2rem;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(245, 206, 225, 0.15);
    color: #f5cee1;
    font-size: 1.4rem;
}

.gift-lead {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    color: #fce7f3;
    line-height: 1.35;
}

.gift-sub {
    margin: 0;
    font-size: 0.9rem;
    color: #aaa;
    line-height: 1.45;
    max-width: 22rem;
}

.gift-input-wrap {
    width: 100%;
    margin-top: 0.35rem;
    text-align: left;
}

.gift-input {
    text-align: center;
    font-size: 1.35rem !important;
    font-weight: 700;
    color: #f5cee1 !important;
}

.gift-hint {
    margin: 0.45rem 0 0;
    font-size: 0.78rem;
    color: #888;
    text-align: center;
}
</style>
