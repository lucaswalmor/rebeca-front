import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'

import './assets/css/global.css';
import './assets/css/primevue.css';

import VueTheMask from 'vue-the-mask'

import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import api from './axios/api';
import { MyPreset } from './primevue/config';

const app = createApp(App)
app.use(router)
app.config.globalProperties.api = api;
app.use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            prefix: 'p',
            darkModeSelector: 'dark',
            cssLayer: false
        }
    }
});
app.use(ToastService);
app.use(VueTheMask);
app.mount('#app')
