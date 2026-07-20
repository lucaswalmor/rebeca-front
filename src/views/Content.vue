<template>
    <div class="row">
        <Conteudos :conteudos="conteudos" />
    </div>
</template>

<script>
import Conteudos from '@/components/Conteudos.vue';

export default {
    name: 'Content',
    props: {
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
