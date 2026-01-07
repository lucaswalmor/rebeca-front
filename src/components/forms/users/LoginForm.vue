<template>
    <div>
        <div class="mb-4">
            <IftaLabel>
                <InputText 
                    id="email" 
                    v-model="dados.email" 
                    type="email"
                    class="w-full" 
                    size="small"
                    :class="{ 'p-invalid': errors.email }"
                />
                <label for="email">Email <span class="text-red-500">*</span></label>
            </IftaLabel>
            <small v-if="errors.email" class="text-red-500">* {{ errors.email }}</small>
        </div>

        <div class="mb-4">
            <IftaLabel>
                <Password 
                    v-model="dados.password" 
                    inputId="password"
                    :feedback="false"
                    toggleMask
                    class="w-full" 
                    size="small"
                    :class="{ 'p-invalid': errors.password }"
                />
                <label for="password">Senha <span class="text-red-500">*</span></label>
            </IftaLabel>
            <small v-if="errors.password" class="text-red-500">* {{ errors.password }}</small>
        </div>

        <div class="mb-4">
            <span 
                class="text-primary cursor-pointer text-sm"
                @click="$emit('open-register')"
            >
                Cadastre-se
            </span>
        </div>

        <div class="flex justify-content-end">
            <Button 
                label="Login" 
                severity="primary"
                @click="handleLogin"
                :loading="loading"
            />
        </div>
    </div>
</template>

<script>
import IftaLabel from 'primevue/iftalabel';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

export default {
    name: 'LoginForm',
    components: {
        IftaLabel,
        InputText,
        Password,
        Button
    },
    emits: ['login', 'open-register'],
    props: {
        loading: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            dados: {
                email: '',
                password: ''
            },
            errors: {}
        }
    },
    methods: {
        validate() {
            this.errors = {};
            
            if (!this.dados.email || this.dados.email.trim() === '') {
                this.errors.email = 'Email é obrigatório';
            } else if (!this.isValidEmail(this.dados.email)) {
                this.errors.email = 'Email inválido';
            }

            if (!this.dados.password || this.dados.password.trim() === '') {
                this.errors.password = 'Senha é obrigatória';
            }

            return Object.keys(this.errors).length === 0;
        },
        isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        handleLogin() {
            if (this.validate()) {
                this.$emit('login', this.dados);
            }
        }
    }
}
</script>

