<template>
  <div>
    <nav class="navbar navbar-expand-lg border-bottom-1">
      <div class="container-fluid text-white">
        <router-link to="/" class="navbar-brand text-white">BecaLima007</router-link>
        <div class="d-flex gap-5 align-items-center me-5">
          <i class="fa-solid fa-house fa-lg cursor-pointer" @click="goHome"></i>
          <span
            v-if="isLoggedIn"
            class="position-relative cursor-pointer"
            title="Mensagens"
            @click="goMessages"
          >
            <i class="fa-solid fa-comments fa-lg" style="color: #f5cee1;"></i>
            <Badge
              v-if="unreadCount > 0"
              :value="unreadCount > 99 ? '99+' : unreadCount"
              severity="danger"
              class="messages-badge"
            />
          </span>
          <i
            v-if="isLoggedIn"
            class="fa-solid fa-user fa-lg cursor-pointer"
            style="color: #f5cee1;"
            @click="goToUserSettings"
          ></i>
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
import Badge from 'primevue/badge';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import { storeToRefs } from 'pinia';
import { disconnectEcho, getEcho } from '@/utils/echo';

export default {
  name: 'Header',
  components: {
    LoginDialog,
    RegisterDialog,
    Badge
  },
  setup() {
    const authStore = useAuthStore();
    const chatStore = useChatStore();
    const { unreadCount } = storeToRefs(chatStore);
    const { updateTrigger } = storeToRefs(authStore);
    return { authStore, chatStore, unreadCount, updateTrigger };
  },
  data() {
    return {
      showLoginDialog: false,
      showRegisterDialog: false,
      loading: false,
      isLoggedIn: false
    }
  },
  watch: {
    updateTrigger() {
      this.checkLoginStatus();
      this.syncChat();
    }
  },
  mounted() {
    this.checkLoginStatus();
    this.syncChat();
  },
  methods: {
    checkLoginStatus() {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.isLoggedIn = !!token && !!user.id;
    },
    syncChat() {
      if (!this.isLoggedIn) {
        this.chatStore.reset();
        disconnectEcho();
        return;
      }
      // Não desconecta o WebSocket a cada update — só garante Echo + inbox
      getEcho();
      this.chatStore.bindInbox();
      this.chatStore.fetchUnread();
    },
    handleIconClick() {
      this.checkLoginStatus();
      if (this.isLoggedIn) {
        this.handleLogout();
      } else {
        this.openLoginDialog();
      }
    },
    goMessages() {
      this.$router.push('/messages');
    },
    goToUserSettings() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.is_admin === true) {
        this.$router.push('/profile');
      } else {
        this.$router.push('/user-settings');
      }
    },
    goHome() {
      this.$router.push('/home');
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
      this.checkLoginStatus();
      this.syncChat();
    },
    async handleLogout() {
      try {
        this.loading = true;
        await this.api.post('/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.checkLoginStatus();
        this.chatStore.reset();
        disconnectEcho();
        this.authStore.logout();
        this.loading = false;
        this.$toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Logout realizado com sucesso!',
          life: 3000
        });

        setTimeout(() => {
          this.$router.push('/home');
        }, 1000);
      } catch (error) {
        this.loading = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.checkLoginStatus();
        this.chatStore.reset();
        disconnectEcho();
        this.authStore.logout();
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

<style scoped>
.messages-badge {
  position: absolute;
  top: -8px;
  right: -10px;
  transform: scale(0.85);
}
</style>
