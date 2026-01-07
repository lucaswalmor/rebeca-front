<template>
    <div>
        <div class="col-md-12 text-300">
            <h4>Redes Sociais</h4>
        </div>

        <!-- Assinatura Mensal -->
        <div class="row">
            <div class="col-md-4 mb-3">
                <IftaLabel>
                    <InputText id="instagram" v-model="dados.instagram" class="w-full" size="small" />
                    <label for="instagram">Instagram</label>
                </IftaLabel>
            </div>
            <div class="col-md-4 mb-3">
                <IftaLabel>
                    <InputText id="telegram" v-model="dados.telegram" class="w-full" size="small" />
                    <label for="telegram">Telegram</label>
                </IftaLabel>
            </div>
            <div class="col-md-4 mb-3">
                <IftaLabel>
                    <InputText id="whatsapp" v-model="dados.whatsapp" class="w-full" size="small" />
                    <label for="whatsapp">WhatsApp</label>
                </IftaLabel>
            </div>
            <div class="col-md-4 mb-3">
                <IftaLabel>
                    <InputText id="x_twitter" v-model="dados.x_twitter" class="w-full" size="small" />
                    <label for="x_twitter">X Twitter</label>
                </IftaLabel>
            </div>
            <div class="col-md-4 mb-3">
                <IftaLabel>
                    <InputText id="tiktok" v-model="dados.tiktok" class="w-full" size="small" />
                    <label for="tiktok">TikTok</label>
                </IftaLabel>
            </div>
            <div class="col-md-4 mb-3">
                <IftaLabel>
                    <InputText id="facebook" v-model="dados.facebook" class="w-full" size="small" />
                    <label for="facebook">Facebook</label>
                </IftaLabel>
            </div>
            <div class="col-md-4 mb-3">
                <IftaLabel>
                    <InputText id="privacy" v-model="dados.privacy" class="w-full" size="small" />
                    <label for="privacy">Privacy</label>
                </IftaLabel>
            </div>
        </div>
    </div>
</template>

<script>
import IftaLabel from 'primevue/iftalabel';
import InputText from 'primevue/inputtext';

export default {
    name: 'SocialForm',
    components: {
        IftaLabel,
        InputText
    },
    data() {
        return {
            dados: {
                instagram: '',
                telegram: '',
                whatsapp: '',
                x_twitter: '',
                tiktok: '',
                facebook: '',
                privacy: ''
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