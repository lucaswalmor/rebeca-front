<template>
    <div class="p-4 d-flex justify-content-center align-items-center flex-column container">
        <div class="md:w-7 sm:w-full">
            <Hero />

            <Menu @selectMenu="selectMenu" :totalPostagens="conteudos.length" />

            <Content :selectedMenu="selectedMenu" :conteudos="conteudos" />
        </div>
    </div>
</template>

<script>
import Hero from '@/components/Hero.vue';
import Menu from '@/components/Menu.vue';
import Content from '@/views/Content.vue';

export default {
    name: 'Main',
    components: {
        Hero,
        Menu,
        Content
    },
    data() {
        return {
            selectedMenu: 0,
            conteudos: [
                {
                    image: [
                        'https://images.pexels.com/photos/33929657/pexels-photo-33929657.jpeg?_gl=1*1u7w7w4*_ga*MTQ0MzM0MjY4My4xNzY0NDQ3MTQz*_ga_8JE65Q40S6*czE3NjQ0NDcxNDIkbzEkZzEkdDE3NjQ0NDcxNDUkajU3JGwwJGgw',
                        'https://images.pexels.com/photos/28771406/pexels-photo-28771406.jpeg?_gl=1*74l8x9*_ga*MTQ0MzM0MjY4My4xNzY0NDQ3MTQz*_ga_8JE65Q40S6*czE3NjQ0NDcxNDIkbzEkZzEkdDE3NjQ0NDczOTAkajU3JGwwJGgw',
                        'https://images.pexels.com/photos/19009583/pexels-photo-19009583.jpeg?_gl=1*11tnkvs*_ga*MTQ0MzM0MjY4My4xNzY0NDQ3MTQz*_ga_8JE65Q40S6*czE3NjQ0NDcxNDIkbzEkZzEkdDE3NjQ0NDc0MDUkajQyJGwwJGgw',
                    ],
                    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                    title: 'Title 1',
                    date: '29/11/2025',
                    isLiked: true,
                    likes: 10,
                    commentsCount: 3,
                    comments: [
                        {
                            id: 1,
                            avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
                            name: 'John Doe',
                            comment: 'Que foto incrível! Você está linda! 😍',
                            createdAt: new Date(Date.now() - 34 * 60000).toISOString(),
                            timeAgo: '34 Min',
                            reply: {
                                id: 101,
                                name: 'Becalima007',
                                comment: 'Obrigada, John! Fico feliz que tenha gostado! 💕',
                                createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
                                timeAgo: '20 Min'
                            }
                        },
                        {
                            id: 2,
                            avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
                            name: 'Jane Doe',
                            comment: 'Adorei o look! Onde comprou essa roupa?',
                            createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
                            timeAgo: '2 H'
                        },
                        {
                            id: 3,
                            avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
                            name: 'Jim Doe',
                            comment: 'Perfeita como sempre! 🔥',
                            createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
                            timeAgo: '3 H',
                            reply: {
                                id: 102,
                                name: 'Becalima007',
                                comment: 'Muito obrigada, Jim! Você é muito gentil! 😊',
                                createdAt: new Date(Date.now() - 150 * 60000).toISOString(),
                                timeAgo: '2 H'
                            }
                        }
                    ],
                },
                {
                    image: [
                        'https://images.pexels.com/photos/33929657/pexels-photo-33929657.jpeg?_gl=1*1u7w7w4*_ga*MTQ0MzM0MjY4My4xNzY0NDQ3MTQz*_ga_8JE65Q40S6*czE3NjQ0NDcxNDIkbzEkZzEkdDE3NjQ0NDcxNDUkajU3JGwwJGgw',
                        'https://images.pexels.com/photos/28771406/pexels-photo-28771406.jpeg?_gl=1*74l8x9*_ga*MTQ0MzM0MjY4My4xNzY0NDQ3MTQz*_ga_8JE65Q40S6*czE3NjQ0NDcxNDIkbzEkZzEkdDE3NjQ0NDczOTAkajU3JGwwJGgw',
                        'https://images.pexels.com/photos/19009583/pexels-photo-19009583.jpeg?_gl=1*11tnkvs*_ga*MTQ0MzM0MjY4My4xNzY0NDQ3MTQz*_ga_8JE65Q40S6*czE3NjQ0NDcxNDIkbzEkZzEkdDE3NjQ0NDc0MDUkajQyJGwwJGgw',
                    ],
                    description: 'Description 1',
                    title: 'Title 1',
                    date: '29/11/2025',
                    isLiked: false,
                    likes: 10,
                    commentsCount: 3,
                    comments: [
                        {
                            id: 4,
                            avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
                            name: 'Maria Silva',
                            comment: 'Linda demais! Parabéns!',
                            createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
                            timeAgo: '1 H'
                        },
                        {
                            id: 5,
                            avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
                            name: 'Pedro Santos',
                            comment: 'Incrível! 👏👏👏',
                            createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
                            timeAgo: '4 H'
                        },
                        {
                            id: 6,
                            avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
                            name: 'Ana Costa',
                            comment: 'Que inspiração! 💖',
                            createdAt: new Date(Date.now() - 1440 * 60000).toISOString(),
                            timeAgo: '1 Dia'
                        }
                    ],
                },
            ]
        }
    },
    methods: {
        selectMenu(menu) {
            this.selectedMenu = menu;
        }
    }
}
</script>