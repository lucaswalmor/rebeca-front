<template>
    <div v-if="isLoading" class="global-loading-overlay">
        <ProgressSpinner />
    </div>
</template>

<script>
import ProgressSpinner from 'primevue/progressspinner';
import eventBus from '@/utils/eventBus';

export default {
    name: 'GlobalLoading',
    components: {
        ProgressSpinner
    },
    data() {
        return {
            isLoading: false,
            requestCount: 0
        }
    },
    mounted() {
        // Escutar eventos de loading
        eventBus.on('loading-start', this.startLoading);
        eventBus.on('loading-stop', this.stopLoading);
    },
    beforeUnmount() {
        // Remover listeners
        eventBus.off('loading-start', this.startLoading);
        eventBus.off('loading-stop', this.stopLoading);
    },
    methods: {
        startLoading() {
            this.requestCount++;
            if (this.requestCount === 1) {
                this.isLoading = true;
            }
        },
        stopLoading() {
            this.requestCount--;
            if (this.requestCount <= 0) {
                this.requestCount = 0;
                this.isLoading = false;
            }
        }
    }
}
</script>

<style scoped>
.global-loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(2px);
}
</style>

