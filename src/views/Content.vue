<template>
    <div class="row">
        <Conteudos 
            :conteudos="conteudos"
            :should-blur="shouldBlurImages"
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
    computed: {
        shouldBlurImages() {
            // Este computed não é mais usado, o blur é controlado no Conteudos.vue
            return false;
        }
    }
}
</script>

<style scoped lang="scss">
</style>