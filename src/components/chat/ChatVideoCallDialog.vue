<template>
    <Dialog
        :visible="visible"
        modal
        header="Agendar chamada de vídeo"
        :style="{ width: '32rem', maxWidth: '95vw' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <div class="form-body">
            <div class="field">
                <IftaLabel>
                    <InputText id="vc_titulo" v-model="form.titulo" class="w-full" />
                    <label for="vc_titulo">Título (opcional)</label>
                </IftaLabel>
            </div>

            <div class="row-2">
                <div class="field">
                    <label class="field-label" for="vc_data">Data</label>
                    <InputText id="vc_data" v-model="form.data" type="date" class="w-full" />
                </div>
                <div class="field">
                    <label class="field-label" for="vc_horario">Horário</label>
                    <InputText id="vc_horario" v-model="form.horario" type="time" class="w-full" />
                </div>
            </div>

            <div class="row-2">
                <div class="field">
                    <IftaLabel>
                        <InputText
                            id="vc_valor"
                            v-mask="['R$ #,##', 'R$ ##,##', 'R$ ###,##', 'R$ ####,##', 'R$ #####,##']"
                            v-model="form.valor"
                            class="w-full"
                        />
                        <label for="vc_valor">Valor</label>
                    </IftaLabel>
                    <p class="hint">Mínimo R$ 1,01 (exigência da InfinitePay).</p>
                </div>
                <div class="field">
                    <IftaLabel>
                        <InputNumber
                            id="vc_duracao"
                            v-model="form.duracao_minutos"
                            class="w-full"
                            :min="1"
                            :max="480"
                            suffix=" min"
                        />
                        <label for="vc_duracao">Duração</label>
                    </IftaLabel>
                </div>
            </div>

            <div class="field">
                <IftaLabel>
                    <InputText
                        id="vc_meet"
                        v-model="form.meet_link"
                        class="w-full"
                        placeholder="https://meet.google.com/..."
                    />
                    <label for="vc_meet">Link Meet/Zoom (opcional)</label>
                </IftaLabel>
                <p class="hint">Só aparece para o cliente depois do pagamento.</p>
            </div>
        </div>

        <template #footer>
            <Botao texto="Cancelar" tipo="texto" tema="rosa" @click="$emit('update:visible', false)" />
            <Botao
                texto="Salvar e enviar cobrança"
                icone="pi pi-send"
                tema="rosa"
                :carregando="loading"
                @click="salvar"
            />
        </template>
    </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import Botao from '@/components/ui/Botao.vue';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import IftaLabel from 'primevue/iftalabel';

const DEFAULT_TITLE = 'Chamada de vídeo com a beca';

export default {
    name: 'ChatVideoCallDialog',
    components: { Dialog, Botao, InputText, InputNumber, IftaLabel },
    props: {
        visible: Boolean,
        conversationId: { type: [Number, String], required: true },
    },
    emits: ['update:visible', 'created'],
    data() {
        return {
            loading: false,
            form: this.emptyForm(),
        };
    },
    watch: {
        visible(val) {
            if (val) this.form = this.emptyForm();
        },
    },
    methods: {
        emptyForm() {
            return {
                titulo: DEFAULT_TITLE,
                data: '',
                horario: '',
                valor: '',
                duracao_minutos: 30,
                meet_link: '',
            };
        },
        parseValor(valorFormatado) {
            if (!valorFormatado) return null;
            const limpo = String(valorFormatado)
                .replace(/R\$\s*/g, '')
                .replace(/\./g, '')
                .replace(',', '.');
            const n = parseFloat(limpo);
            return Number.isFinite(n) ? n : null;
        },
        async salvar() {
            const valor = this.parseValor(this.form.valor);
            if (!this.form.data || !this.form.horario || !valor || valor <= 0 || !this.form.duracao_minutos) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Campos obrigatórios',
                    detail: 'Preencha data, horário, valor e duração.',
                    life: 3500,
                });
                return;
            }

            if (valor <= 1) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Valor inválido',
                    detail: 'O valor mínimo é R$ 1,01 (limite da InfinitePay).',
                    life: 4000,
                });
                return;
            }

            this.loading = true;
            try {
                const payload = {
                    titulo: this.form.titulo?.trim() || DEFAULT_TITLE,
                    data: this.form.data,
                    horario: this.form.horario,
                    valor,
                    duracao_minutos: this.form.duracao_minutos,
                    meet_link: this.form.meet_link?.trim() || null,
                };

                const { data } = await this.api.post(
                    `/chat/conversations/${this.conversationId}/video-calls`,
                    payload
                );

                this.$emit('created', data.data || data);
                this.$emit('update:visible', false);
                this.$toast.add({
                    severity: 'success',
                    summary: 'Enviado',
                    detail: 'Cobrança da chamada enviada no chat.',
                    life: 3000,
                });
            } catch (e) {
                const errors = e.response?.data?.errors;
                const validationMsg = errors?.valor?.[0];
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: validationMsg || e.response?.data?.message || 'Não foi possível agendar a chamada',
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
.form-body {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    color: #ddd;
}

.field {
    width: 100%;
}

.field-label {
    display: block;
    margin-bottom: 0.35rem;
    font-size: 0.85rem;
    color: #aaa;
}

.row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}

.hint {
    margin: 0.35rem 0 0;
    font-size: 0.78rem;
    color: #888;
}

@media (max-width: 520px) {
    .row-2 {
        grid-template-columns: 1fr;
    }
}
</style>
