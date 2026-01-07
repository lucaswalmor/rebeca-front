<template>
    <GlobalLoading />
    <Toast />
    <router-view/>
</template>

<script>
import GlobalLoading from '@/components/GlobalLoading.vue';
import Toast from 'primevue/toast';

export default {
    name: 'App',
    components: {
        GlobalLoading,
        Toast
    }
}
</script>

<style>
</style>