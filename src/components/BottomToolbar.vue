<template>
  <nav class="bottom-toolbar" aria-label="Navegação principal">
    <button
      type="button"
      class="bottom-toolbar-item"
      :class="{ active: isHomeRoute }"
      title="Início"
      @click="goHome"
    >
      <i class="fa-solid fa-house"></i>
    </button>

    <button
      v-if="isLoggedIn"
      type="button"
      class="bottom-toolbar-item has-badge"
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
      class="bottom-toolbar-item"
      :class="{ active: isProfileRoute }"
      title="Perfil"
      @click="goToUserSettings"
    >
      <i class="fa-solid fa-user"></i>
    </button>

    <button
      v-else
      type="button"
      class="bottom-toolbar-item"
      title="Entrar"
      @click="$emit('login')"
    >
      <i class="fa-solid fa-right-to-bracket"></i>
    </button>
  </nav>
</template>

<script>
import Badge from 'primevue/badge';
import { useChatStore } from '@/stores/chat';
import { storeToRefs } from 'pinia';

export default {
  name: 'BottomToolbar',
  components: { Badge },
  props: {
    isLoggedIn: { type: Boolean, default: false },
  },
  emits: ['login'],
  setup() {
    const chatStore = useChatStore();
    const { unreadCount } = storeToRefs(chatStore);
    return { unreadCount };
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
  methods: {
    goHome() {
      this.$router.push('/home');
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
  },
};
</script>

<style scoped lang="scss">
.bottom-toolbar {
  display: none;
}

.messages-badge {
  position: absolute;
  top: 0.35rem;
  right: calc(50% - 18px);
  transform: scale(0.8);
}

@media (max-width: 768px) {
  .bottom-toolbar {
    --bottom-nav-h: 60px;
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

  .bottom-toolbar-item {
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
  }
}
</style>
