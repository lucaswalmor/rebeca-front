<template>
  <div class="app-chrome">
    <!-- Desktop / tablet: header no topo -->
    <nav class="top-nav">
      <div class="top-nav-inner">
        <router-link to="/" class="brand">BecaLima007</router-link>
        <div class="top-nav-icons">
          <button type="button" class="nav-icon" title="Início" @click="goHome">
            <i class="fa-solid fa-house"></i>
          </button>
          <button
            v-if="isLoggedIn"
            type="button"
            class="nav-icon has-badge"
            title="Mensagens"
            @click="goMessages"
          >
            <i class="fa-solid fa-comments"></i>
            <Badge
              v-if="unreadCount > 0"
              :value="unreadCount > 99 ? '99+' : unreadCount"
              severity="danger"
              class="messages-badge"
            />
          </button>
          <button
            v-if="isLoggedIn"
            type="button"
            class="nav-icon"
            title="Perfil"
            @click="goToUserSettings"
          >
            <i class="fa-solid fa-user"></i>
          </button>
          <button
            type="button"
            class="nav-icon"
            :class="{ danger: isLoggedIn }"
            :title="isLoggedIn ? 'Sair' : 'Entrar'"
            @click="handleIconClick"
          >
            <i :class="isLoggedIn ? 'fa-solid fa-power-off' : 'fa-solid fa-right-to-bracket'"></i>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile: toolbar fixa no rodapé -->
    <nav class="bottom-nav" aria-label="Navegação principal">
      <button
        type="button"
        class="bottom-nav-item"
        :class="{ active: isHomeRoute }"
        title="Início"
        @click="goHome"
      >
        <i class="fa-solid fa-house"></i>
      </button>

      <button
        v-if="isLoggedIn"
        type="button"
        class="bottom-nav-item has-badge"
        :class="{ active: isMessagesRoute }"
        title="Mensagens"
        @click="goMessages"
      >
        <i class="fa-solid fa-comments"></i>
        <Badge
          v-if="unreadCount > 0"
          :value="unreadCount > 99 ? '99+' : unreadCount"
          severity="danger"
          class="messages-badge"
        />
      </button>

      <button
        v-if="isLoggedIn"
        type="button"
        class="bottom-nav-item"
        :class="{ active: isProfileRoute }"
        title="Perfil"
        @click="goToUserSettings"
      >
        <i class="fa-solid fa-user"></i>
      </button>

      <button
        type="button"
        class="bottom-nav-item"
        :class="{ danger: isLoggedIn }"
        :title="isLoggedIn ? 'Sair' : 'Entrar'"
        @click="handleIconClick"
      >
        <i :class="isLoggedIn ? 'fa-solid fa-power-off' : 'fa-solid fa-right-to-bracket'"></i>
      </button>
    </nav>

    <!-- Espaço para o conteúdo não ficar atrás da toolbar no mobile -->
    <div class="bottom-nav-spacer" aria-hidden="true"></div>

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
    Badge,
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
      isLoggedIn: false,
    };
  },
  computed: {
    isHomeRoute() {
      return this.$route?.path === '/home' || this.$route?.path === '/';
    },
    isMessagesRoute() {
      return (this.$route?.path || '').startsWith('/messages');
    },
    isProfileRoute() {
      const path = this.$route?.path || '';
      return path.startsWith('/profile') || path.startsWith('/user-settings');
    },
  },
  watch: {
    updateTrigger() {
      this.checkLoginStatus();
      this.syncChat();
    },
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
          life: 3000,
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
          life: 3000,
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.app-chrome {
  --nav-h: 56px;
  --bottom-nav-h: 60px;
}

.top-nav {
  display: block;
  background: #000;
  border-bottom: 1px solid #1f1f1f;
}

.top-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--nav-h);
  padding: 0 1.25rem;
  color: #fff;
}

.brand {
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.top-nav-icons {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-icon {
  position: relative;
  border: none;
  background: transparent;
  color: #f5cee1;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1.15rem;
  line-height: 1;

  &.danger {
    color: #e40707;
  }
}

.bottom-nav {
  display: none;
}

.bottom-nav-spacer {
  display: none;
}

.messages-badge {
  position: absolute;
  top: -8px;
  right: -10px;
  transform: scale(0.8);
}

@media (max-width: 768px) {
  .top-nav {
    display: none;
  }

  .bottom-nav {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1100;
    height: calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px));
    padding: 0.35rem 0.5rem env(safe-area-inset-bottom, 0px);
    background: rgba(12, 12, 12, 0.96);
    border-top: 1px solid #2a2a2a;
    backdrop-filter: blur(10px);
    justify-content: space-around;
    align-items: flex-start;
  }

  .bottom-nav-item {
    position: relative;
    flex: 1;
    max-width: 88px;
    border: none;
    background: transparent;
    color: #8a8a8a;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.65rem 0.25rem;
    font-size: 1.25rem;
    line-height: 1;
    transition: color 0.15s ease;

    &.active {
      color: #f5cee1;
    }

    &.danger {
      color: #e40707;
    }
  }

  .bottom-nav-spacer {
    display: block;
    height: calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px));
  }

  .bottom-nav-item .messages-badge {
    top: 0.35rem;
    right: calc(50% - 18px);
  }
}
</style>
