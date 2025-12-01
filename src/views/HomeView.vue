<template>
  <div class="home">
    <Header/>
    <Main/>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Main from '@/views/Main.vue'

export default {
  name: 'HomeView',
  components: {
    Header,
    Main
  }
}
</script>
