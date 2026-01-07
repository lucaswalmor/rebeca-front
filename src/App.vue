<template>
    <GlobalLoading />
    <router-view/>
</template>

<script>
import GlobalLoading from '@/components/GlobalLoading.vue';

export default {
    name: 'App',
    components: {
        GlobalLoading
    }
}
</script>

<style>
</style>