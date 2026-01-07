<template>
        <div class="col-md-12 text-300">
            <h4>Assinatura</h4>
        </div>

    <!-- Assinatura Mensal -->
    <div class="col-md-12 mb-3">
        <IftaLabel>
            <InputText id="assinatura_mensal" v-mask="['R$ #,##', 'R$ ##,##', 'R$ ###,##']"
                v-model="dados.assinatura_mensal" class="w-full" size="small" />
            <label for="assinatura_mensal">Assinatura Mensal</label>
        </IftaLabel>
    </div>

    <!-- Desconto Trimestral -->
    <div class="row mb-3">
        <div class="col-md-6">
            <IftaLabel>
                <InputNumber v-model="dados.desconto_trimestral" inputId="percent" prefix="%" fluid class="w-full"
                    size="small" @update:modelValue="calcularValorTrimestral" />
                <label for="desconto_trimestral">Desconto Trimestral</label>
            </IftaLabel>
        </div>
        <div class="col-md-6">
            <IftaLabel>
                <InputText id="valor_trimestral" v-mask="['R$ #,##', 'R$ ##,##', 'R$ ###,##']" disabled
                    v-model="dados.valor_trimestral" class="w-full" size="small" />
                <label for="valor_trimestral">Valor Trimestral</label>
            </IftaLabel>
        </div>
    </div>

    <!-- Desconto Semestral -->
    <div class="row mb-3">
        <div class="col-md-6">
            <IftaLabel>
                <InputNumber v-model="dados.desconto_semestral" inputId="percent" prefix="%" fluid class="w-full"
                    size="small" @update:modelValue="calcularValorSemestral" />
                <label for="desconto_semestral">Desconto Semestral</label>
            </IftaLabel>
        </div>
        <div class="col-md-6">
            <IftaLabel>
                <InputText id="valor_semestral" v-mask="['R$ #,##', 'R$ ##,##', 'R$ ###,##']" disabled
                    v-model="dados.valor_semestral" class="w-full" size="small" />
                <label for="valor_semestral">Valor Semestral</label>
            </IftaLabel>
        </div>
    </div>
</template>

<script>
import IftaLabel from 'primevue/iftalabel';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

export default {
    name: 'AssinaturaForm',
    components: {
        IftaLabel,
        InputText,
        InputNumber,
    },
    data() {
        return {
            dados: {
                assinatura_mensal: 'R$ 0,00',
                desconto_trimestral: 0,
                desconto_semestral: 0,
                valor_trimestral: 'R$ 0,00',
                valor_semestral: 'R$ 0,00',
            }
        }
    },
    watch: {
        'dados.desconto_trimestral'(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.calcularValorTrimestral();
            }
        },
        'dados.desconto_semestral'(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.calcularValorSemestral();
            }
        },
        'dados.assinatura_mensal'() {
            this.recalcularTodos();
        }
    },
    methods: {
        /**
         * Converte valor formatado (R$ 100,00) para número (100.00)
         */
        converterParaNumero(valorFormatado) {
            if (!valorFormatado || valorFormatado === '') return 0;
            // Remove "R$", espaços, pontos (separadores de milhar) e substitui vírgula por ponto
            const valorLimpo = valorFormatado
                .replace(/R\$\s*/g, '') // Remove "R$" e espaços
                .replace(/\./g, '')     // Remove pontos (separadores de milhar)
                .replace(',', '.');     // Substitui vírgula por ponto para decimal
            const numero = parseFloat(valorLimpo);
            return isNaN(numero) ? 0 : numero;
        },
        /**
         * Formata número para o padrão R$ #,##
         */
        formatarMoeda(valor) {
            if (!valor || valor === 0) return '';
            return `R$ ${valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
        },
        /**
         * Calcula o valor trimestral: 3x o mensal com desconto aplicado
         */
        calcularValorTrimestral() {
            const valorMensal = this.converterParaNumero(this.dados.assinatura_mensal);
            if (valorMensal === 0) {
                this.dados.valor_trimestral = '';
                return;
            }
            // Trimestral = (Mensal * 3) * (1 - desconto%)
            const valorTrimestralBase = valorMensal * 3;
            const valorComDesconto = valorTrimestralBase * (1 - this.dados.desconto_trimestral / 100);
            this.dados.valor_trimestral = this.formatarMoeda(valorComDesconto);
        },
        /**
         * Calcula o valor semestral: 6x o mensal com desconto aplicado
         */
        calcularValorSemestral() {
            const valorMensal = this.converterParaNumero(this.dados.assinatura_mensal);
            if (valorMensal === 0) {
                this.dados.valor_semestral = '';
                return;
            }
            // Semestral = (Mensal * 6) * (1 - desconto%)
            const valorSemestralBase = valorMensal * 6;
            const valorComDesconto = valorSemestralBase * (1 - this.dados.desconto_semestral / 100);
            this.dados.valor_semestral = this.formatarMoeda(valorComDesconto);
        },
        /**
         * Recalcula todos os valores quando o mensal muda
         */
        recalcularTodos() {
            this.calcularValorTrimestral();
            this.calcularValorSemestral();
        },
        /**
         * Método auxiliar para obter os dados (opcional)
         */
        dadosAssinatura() {
            return this.dados;
        },
        /**
         * Preenche os dados do formulário
         */
        preencherDados(dados) {
            this.dados = { ...this.dados, ...dados };
            // Recalcular valores se necessário
            if (dados.assinatura_mensal) {
                this.recalcularTodos();
            }
        }
    }
}
</script>