<template>
    <div class="row">
        <Conteudos
            :selected-menu="selectedMenu"
            :conteudos="conteudos"
            :should-blur="false"
        />
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