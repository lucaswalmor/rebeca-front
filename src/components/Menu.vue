<template>
    <Card class="mt-2 mb-2">
        <template #content>
            <div class="row text-center">
                <span class="cursor-pointer col font-bold menu-item menu-item-selected text-pink">
                    <i class="fa-solid fa-photo-film me-2"></i>
                    {{ totalPostagens }} {{ totalPostagens === 1 ? 'Post' : 'Posts' }}
                </span>
            </div>
        </template>
    </Card>
</template>

<script>
import Card from 'primevue/card';

export default {
    name: 'Menu',
    components: {
        Card
    },
    props: {
        totalPostagens: {
            type: Number,
            default: 0
        }
    }
}
</script>

<style scoped lang="scss">
:deep(.p-card-body) {
    border-radius: 10px;
}

:deep(.p-card-body) {
    background-color: #121212;
    border-radius: 10px;
}

:deep(.p-card-content) {
    background-color: #121212;
    border-radius: 30px 0;
}

.menu {
    border-radius: 15px;
    padding: 15px;
    background: #121212;
}

.menu-item {
    padding-bottom: 15px;
    transition: border-bottom 0.6s ease-in-out;
    border-bottom: 2px solid transparent;
}

.menu-item-selected {
    border-bottom: 2px solid #f5cee1;
}
</style>
