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
import { isAdmin, hasAssinaturaAtiva, isLoggedIn, statusAssinatura, currentUserId } from './utils/global';
import pinia from './stores';

const app = createApp(App)
app.use(router)
app.use(pinia)
app.config.globalProperties.api = api;
app.config.globalProperties.isAdmin = isAdmin;
app.config.globalProperties.hasAssinaturaAtiva = hasAssinaturaAtiva;
app.config.globalProperties.isLoggedIn = isLoggedIn;
app.config.globalProperties.statusAssinatura = statusAssinatura;
app.config.globalProperties.currentUserId = currentUserId;
app.use(PrimeVue, {
    license: 'eyJpZCI6IjUwZjdkMDQ4LTU1ZjMtNGUxOC1hMzMzLWI2NjlhM2VjMDliMSIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODU0Njg5NzgsImV4cCI6MTgxNzAwNDk3OH0.8pr3D3WyYzfRBqAJpcj0VWBX-qcwXc-YyrjZ-W-E49Xsf3kf-1PkGHM3_m0BRozwCCopoJDJ6M6OUTsOqCNIBQ',
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
app.mount('#app');
