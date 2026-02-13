<template>
    <div class="row">
        <div class="col-md-6 mb-3">
            <IftaLabel>
                <InputText 
                    id="nome" 
                    v-model="dados.nome" 
                    class="w-full" 
                    size="small"
                    :class="{ 'p-invalid': errors.nome }"
                />
                <label for="nome">Nome <span class="text-red-500">*</span></label>
            </IftaLabel>
            <small v-if="errors.nome" class="text-red-500">* {{ errors.nome }}</small>
        </div>
        <div class="col-md-6 mb-3">
            <IftaLabel>
                <InputText 
                    id="sobrenome" 
                    v-model="dados.sobrenome" 
                    class="w-full" 
                    size="small"
                    :class="{ 'p-invalid': errors.sobrenome }"
                />
                <label for="sobrenome">Sobrenome <span class="text-red-500">*</span></label>
            </IftaLabel>
            <small v-if="errors.sobrenome" class="text-red-500">* {{ errors.sobrenome }}</small>
        </div>

        <div class="mb-3">
            <IftaLabel>
                <InputText 
                    id="apelido" 
                    v-model="dados.apelido" 
                    class="w-full" 
                    size="small"
                    :class="{ 'p-invalid': errors.apelido }"
                />
                <label for="apelido">Apelido (nome curto para ser usado no site)<span class="text-red-500">*</span></label>
            </IftaLabel>
            <small v-if="errors.apelido" class="text-red-500">* {{ errors.apelido }}</small>
        </div>

        <div class="mb-3">
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

        <div class="mb-3">
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

        <div class="mb-3">
            <IftaLabel>
                <InputText 
                    id="telefone" 
                    v-model="dados.telefone" 
                    v-mask="'(##) #####-####'"
                    class="w-full" 
                    size="small"
                    :class="{ 'p-invalid': errors.telefone }"
                />
                <label for="telefone">Telefone <span class="text-red-500">*</span></label>
            </IftaLabel>
            <small v-if="errors.telefone" class="text-red-500">* {{ errors.telefone }}</small>
        </div>

        <div class="mb-3">
            <IftaLabel>
                <InputText 
                    id="data_nascimento" 
                    v-model="dados.data_nascimento" 
                    v-mask="'##/##/####'"
                    placeholder="DD/MM/AAAA"
                    class="w-full" 
                    size="small"
                    :class="{ 'p-invalid': errors.data_nascimento }"
                />
                <label for="data_nascimento">Data de Nascimento <span class="text-red-500">*</span></label>
            </IftaLabel>
            <small v-if="errors.data_nascimento" class="text-red-500">* {{ errors.data_nascimento }}</small>
        </div>

        <div class="flex justify-content-end gap-2">
            <Button 
                label="Cancelar" 
                severity="secondary"
                @click="$emit('cancel')"
                :disabled="loading"
            />
            <Button 
                label="Concluir Cadastro" 
                severity="primary"
                @click="handleRegister"
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
    name: 'RegisterForm',
    components: {
        IftaLabel,
        InputText,
        Password,
        Button
    },
    emits: ['register', 'cancel'],
    props: {
        loading: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            dados: {
                nome: '',
                sobrenome: '',
                apelido: '',
                email: '',
                password: '',
                telefone: '',
                data_nascimento: ''
            },
            errors: {}
        }
    },
    methods: {
        validate() {
            this.errors = {};
            
            if (!this.dados.nome || this.dados.nome.trim() === '') {
                this.errors.nome = 'Campo obrigatório';
            }

            if (!this.dados.sobrenome || this.dados.sobrenome.trim() === '') {
                this.errors.sobrenome = 'Campo obrigatório';
            }

            if (!this.dados.apelido || this.dados.apelido.trim() === '') {
                this.errors.apelido = 'Campo obrigatório';
            }

            if (!this.dados.email || this.dados.email.trim() === '') {
                this.errors.email = 'Campo obrigatório';
            } else if (!this.isValidEmail(this.dados.email)) {
                this.errors.email = 'Email inválido';
            }

            if (!this.dados.password || this.dados.password.trim() === '') {
                this.errors.password = 'Campo obrigatório';
            } else if (this.dados.password.length < 6) {
                this.errors.password = 'Senha deve ter no mínimo 6 caracteres';
            }

            if (!this.dados.telefone || this.dados.telefone.trim() === '') {
                this.errors.telefone = 'Campo obrigatório';
            }

            if (!this.dados.data_nascimento || this.dados.data_nascimento.trim() === '') {
                this.errors.data_nascimento = 'Campo obrigatório';
            } else if (!this.isValidDate(this.dados.data_nascimento)) {
                this.errors.data_nascimento = 'Data inválida (DD/MM/AAAA)';
            } else if (!this.isValidAge(this.dados.data_nascimento)) {
                this.errors.data_nascimento = 'É necessário ter pelo menos 18 anos para se cadastrar';
            }

            return Object.keys(this.errors).length === 0;
        },
        isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        isValidDate(dateString) {
            const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            if (!regex.test(dateString)) {
                return false;
            }
            const parts = dateString.split('/');
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);

            if (month < 1 || month > 12) return false;
            if (day < 1 || day > 31) return false;
            if (year < 1900 || year > new Date().getFullYear()) return false;

            const date = new Date(year, month - 1, day);
            return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
        },
        isValidAge(dateString) {
            const parts = dateString.split('/');
            const birthDay = parseInt(parts[0], 10);
            const birthMonth = parseInt(parts[1], 10);
            const birthYear = parseInt(parts[2], 10);

            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1; // getMonth() retorna 0-11
            const currentDay = today.getDate();

            let age = currentYear - birthYear;

            // Verifica se ainda não fez aniversário este ano
            if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
                age--;
            }

            return age >= 18;
        },
        formatDateForBackend(dateString) {
            // Converte DD/MM/AAAA para AAAA-MM-DD
            const parts = dateString.split('/');
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        },
        formatPhoneForBackend(phone) {
            // Remove máscara: (11) 99999-9999 -> 11999999999
            return phone.replace(/\D/g, '');
        },
        handleRegister() {
            if (this.validate()) {
                const dadosFormatados = {
                    ...this.dados,
                    data_nascimento: this.formatDateForBackend(this.dados.data_nascimento),
                    telefone: this.formatPhoneForBackend(this.dados.telefone)
                };
                this.$emit('register', dadosFormatados);
            }
        }
    }
}
</script>

