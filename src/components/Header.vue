<template>
  <div class="app-chrome">
    <nav class="top-nav">
      <div class="top-nav-inner">
        <router-link to="/" class="brand">becalima007</router-link>

        <!-- Ícones só no desktop -->
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
            v-if="!isLoggedIn"
            type="button"
            class="nav-icon"
            title="Entrar"
            @click="openLoginDialog"
          >
            <i class="fa-solid fa-right-to-bracket"></i>
          </button>
        </div>
      </div>
    </nav>

    <BottomToolbar
      :is-logged-in="isLoggedIn"
      @login="openLoginDialog"
    />

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
import BottomToolbar from './BottomToolbar.vue';
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
    BottomToolbar,
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
      isLoggedIn: false,
    };
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
  },
};
</script>

<style scoped lang="scss">
.app-chrome {
  --nav-h: 56px;
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
}

.messages-badge {
  position: absolute;
  top: -8px;
  right: -10px;
  transform: scale(0.8);
}

@media (max-width: 768px) {
  .top-nav-inner {
    justify-content: center;
  }

  .brand {
    color: #f5cee1;
    font-size: 1.05rem;
  }

  .top-nav-icons {
    display: none;
  }
}
</style>
