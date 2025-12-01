<template>
    <div class="row">
        <Conteudos v-if="selectedMenu === 0" :conteudos="conteudos" />
    </div>
</template>

<script>
import Conteudos from '@/components/Conteudos.vue';

export default {
    name: 'Content',
    props: {
        selectedMenu: {
            type: Number,
            required: true
        },
        conteudos: {
            type: Array,
            required: true
        }
    },
    components: {
        Conteudos
    },
}
</script>

<style scoped lang="scss">
</style>