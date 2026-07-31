<template>
    <Card class="mt-2 mb-2">
        <template #content>
            <div class="row text-center menu-tabs">
                <span
                    class="cursor-pointer col font-bold menu-item"
                    :class="{ 'menu-item-selected text-pink': activeTab === 'posts' }"
                    @click="$emit('update:activeTab', 'posts')"
                >
                    <i class="fa-solid fa-photo-film me-2"></i>
                    {{ totalPostagens }} {{ totalPostagens === 1 ? 'Post' : 'Posts' }}
                </span>
                <span
                    class="cursor-pointer col font-bold menu-item"
                    :class="{ 'menu-item-selected text-pink': activeTab === 'galeria' }"
                    @click="$emit('update:activeTab', 'galeria')"
                >
                    <i class="fa-solid fa-images me-2"></i>
                    Galeria
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
        },
        activeTab: {
            type: String,
            default: 'posts',
            validator: (v) => ['posts', 'galeria'].includes(v)
        }
    },
    emits: ['update:activeTab']
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

.menu-tabs {
    margin: 0;
}

.menu-item {
    padding-bottom: 15px;
    transition: border-bottom 0.6s ease-in-out, color 0.2s ease;
    border-bottom: 2px solid transparent;
    color: #999;
}

.menu-item-selected {
    border-bottom: 2px solid #f5cee1;
    color: #f5cee1;
}
</style>
