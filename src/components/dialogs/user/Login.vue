<template>
    <Dialog 
        v-model:visible="visible" 
        modal 
        header="Login" 
        :style="{ width: '25rem' }"
        :closable="true"
    >
        <LoginForm 
            @login="handleLogin"
            @open-register="handleOpenRegister"
            :loading="loading"
        />
    </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import LoginForm from '../../forms/users/LoginForm.vue';
import { useAuthStore } from '@/stores/auth';

export default {
    name: 'LoginDialog',
    components: {
        Dialog,
        LoginForm
    },
    props: {
        modelValue: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue', 'open-register'],
    computed: {
        visible: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit('update:modelValue', value);
            }
        }
    },
    setup() {
        const authStore = useAuthStore();
        return { authStore };
    },
    data() {
        return {
            loading: false
        }
    },
    methods: {
        async handleLogin(dados) {
            this.loading = true;
            try {
                const response = await this.api.post('/login', dados);
                
                // Salvar token e dados do usuário no localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Resetar loading
                this.loading = false;
                
                // Fechar dialog
                this.visible = false;
                
                // Mostrar toast de sucesso
                this.$toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Login realizado com sucesso!',
                    life: 3000
                });
                
                // Emitir evento para atualizar estado da aplicação se necessário
                this.$emit('logged-in', response.data.user);
                // Disparar atualização via Pinia
                this.authStore.login();
            } catch (error) {
                this.loading = false;
                let errorMessage = 'Erro ao realizar login';
                
                if (error.response && error.response.data) {
                    if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response.data.errors) {
                        const firstError = Object.values(error.response.data.errors)[0];
                        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                    }
                }
                
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: errorMessage,
                    life: 3000
                });
            }
        },
        handleOpenRegister() {
            this.visible = false;
            this.$emit('open-register');
        }
    }
}
</script>

