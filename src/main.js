import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'

import './assets/css/global.css';

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const app = createApp(App)
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: 'dark',
            cssLayer: false
        }
    }
});
app.mount('#app')
