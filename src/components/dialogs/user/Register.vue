<template>
    <Dialog 
        v-model:visible="visible" 
        modal 
        header="Cadastro" 
        :style="{ width: '30rem' }"
        :closable="true"
    >
        <RegisterForm 
            @register="handleRegister"
            @cancel="handleCancel"
            ref="registerForm"
            :loading="loading"
        />
    </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import RegisterForm from '../../forms/users/RegisterForm.vue';
import eventBus from '@/utils/eventBus';

export default {
    name: 'RegisterDialog',
    components: {
        Dialog,
        RegisterForm
    },
    props: {
        modelValue: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue', 'open-login'],
    data() {
        return {
            loading: false
        }
    },
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
    methods: {
        async handleRegister(dados) {
            this.loading = true;
            try {
                // Registrar usuário
                await this.api.post('/register', dados);
                
                // Realizar login automático
                const loginData = {
                    email: dados.email,
                    password: dados.password
                };
                
                const loginResponse = await this.api.post('/login', loginData);
                
                // Salvar token e dados do usuário no localStorage
                localStorage.setItem('token', loginResponse.data.token);
                localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
                
                // Resetar loading
                this.loading = false;
                
                // Fechar dialog
                this.visible = false;
                
                // Mostrar toast de sucesso
                this.$toast.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Cadastro realizado com sucesso e login realizado',
                    life: 3000
                });
                
                // Emitir evento para atualizar estado da aplicação se necessário
                this.$emit('registered', loginResponse.data.user);
                // Emitir evento global para atualizar componentes
                eventBus.emit('user-logged-in', loginResponse.data.user);
            } catch (error) {
                this.loading = false;
                let errorMessage = 'Erro ao realizar cadastro';
                
                if (error.response && error.response.data) {
                    if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response.data.errors) {
                        // Pegar o primeiro erro de validação
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
        handleCancel() {
            this.visible = false;
            this.$emit('open-login');
        }
    }
}
</script>

