<template>
  <div>
    <nav class="navbar navbar-expand-lg border-bottom-1">
      <div class="container-fluid text-white">
        <router-link to="/" class="navbar-brand text-white">BecaLima007</router-link>
        <div class="d-flex gap-5 align-items-center me-5">
          <i class="fa-solid fa-magnifying-glass fa-lg"></i>
          <i 
            :class="isLoggedIn ? 'fa-solid fa-power-off fa-lg cursor-pointer' : 'fa-solid fa-right-to-bracket fa-lg cursor-pointer'" 
            :style="isLoggedIn ? 'color: #e40707;' : ''"
            @click="handleIconClick"
          ></i>
        </div>
      </div>
    </nav>

    <LoginDialog 
      :model-value="showLoginDialog"
      @update:model-value="showLoginDialog = $event"
      @open-register="openRegisterDialog"
      @logged-in="handleLoggedIn"
    />
    
    <RegisterDialog 
      v-model="showRegisterDialog"
      @open-login="openLoginDialog"
      @registered="handleLoggedIn"
    />
  </div>
</template>

<script>
import LoginDialog from './dialogs/user/Login.vue';
import RegisterDialog from './dialogs/user/Register.vue';
import eventBus from '@/utils/eventBus';

export default {
  name: 'Header',
  components: {
    LoginDialog,
    RegisterDialog
  },
  data() {
    return {
      showLoginDialog: false,
      showRegisterDialog: false,
      loading: false,
      isLoggedIn: false
    }
  },
  mounted() {
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.isLoggedIn = !!token && !!user.id;
    },
    handleIconClick() {
      // Verificar novamente o status antes de executar a ação
      this.checkLoginStatus();
      if (this.isLoggedIn) {
        this.handleLogout();
      } else {
        this.openLoginDialog();
      }
    },
    openLoginDialog() {
      this.showRegisterDialog = false;
      this.showLoginDialog = true;
    },
    openRegisterDialog() {
      this.showLoginDialog = false;
      this.showRegisterDialog = true;
    },
    handleLoggedIn() {
      this.checkLoginStatus(); // Atualizar estado após login
    },
    async handleLogout() {
      try {
        this.loading = true;
        await this.api.post('/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.checkLoginStatus(); // Atualizar estado reativo
        // Emitir evento global para atualizar componentes
        eventBus.emit('user-logged-out');
        this.loading = false;
        this.$toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Logout realizado com sucesso!',
          life: 3000
        });
      } catch (error) {
        this.loading = false;
        // Mesmo em caso de erro, limpar o localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.checkLoginStatus(); // Atualizar estado reativo
        // Emitir evento global para atualizar componentes
        eventBus.emit('user-logged-out');
        this.$toast.add({
          severity: 'info',
          summary: 'Info',
          detail: 'Você foi desconectado',
          life: 3000
        });
      }
    }
  }
}
</script>