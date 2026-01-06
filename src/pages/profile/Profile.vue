<template>
    <div>
        <Header />
        <div class="container px-6 mt-6">
            <div class="row">
                <div class="col-12 text-center text-white">
                    <h3>Configurar Perfil</h3>
                </div>
            </div>

            <Divider />

            <AssinaturaForm ref="assinaturaFormRef" />

            <Divider />

            <SocialForm ref="socialFormRef" />

            <Divider />

            <SobreForm ref="sobreFormRef" />

            <Divider />

            <div class="row d-flex justify-content-end">
                <div class="col-md-3 ">
                    <button class="botao-assinatura d-flex justify-content-center" @click="salvar">
                        <span class="font-bold">Salvar</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import AssinaturaForm from '@/components/forms/profile/AssinaturaForm.vue';
import SocialForm from '@/components/forms/profile/SocialForm.vue';
import SobreForm from '@/components/forms/profile/SobreForm.vue';
import Divider from 'primevue/divider';

export default {
    name: 'Profile',
    components: {
        Header,
        AssinaturaForm,
        SocialForm,
        SobreForm,
        Divider
    },
    data() {
        return {
            dadosFormulario: null
        }
    },
    computed: {
        /**
         * Computed que acessa os dados do formulário filho via ref
         */
        dadosDoFormulario() {
            return this.$refs.assinaturaFormRef?.dados || null;
        }
    },
    methods: {
        // Salva os dados do formulário
        salvar() {
            const dados = {
                assinatura: this.$refs.assinaturaFormRef.dadosAssinatura()
            }
            console.log('dados', dados);
            const assinatura = this.$refs.assinaturaFormRef.dadosAssinatura();
        },
    }
}
</script>