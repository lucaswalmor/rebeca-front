<template>
    <div>
        <div class="col-md-12 text-300">
            <h4>Sobre Mim</h4>
        </div>

        <div class="row">
            <div class="col-md-12 mb-3">
                <IftaLabel>
                    <Textarea id="sobre" v-model="dados.sobre" class="w-full" size="small" />
                    <label for="sobre">Sobre Mim</label>
                </IftaLabel>
            </div>
        </div>
    </div>
</template>

<script>
import IftaLabel from 'primevue/iftalabel';
import Textarea from 'primevue/textarea';

export default {
    name: 'SobreForm',
    components: {
        IftaLabel,
        Textarea
    },
    data() {
        return {
            dados: {
                sobre: ''
            }
        }
    },
    methods: {
        /**
         * Preenche os dados do formulário
         */
        preencherDados(dados) {
            this.dados = { ...this.dados, ...dados };
        }
    }
}
</script>

<style scoped></style>