<template>
    <Card class="text-white">
        <template #title>
            <div class="relative">
                <div class="w-full">
                    <img src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg" alt="Capa do perfil">
                </div>
                <div class="absolute avatar">
                    <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle"
                        size="xlarge" />
                </div>
            </div>
        </template>
        <template #content>
            <div class="mt-5 p-3">
                <div class="row">
                    <div class="d-flex flex-column">
                        <div class="d-flex justify-content-between">
                            <div class="d-flex flex-column">
                                <p class="font-bold text-white">Becalima007</p>
                                <p class="text-white">@Becalima007</p>
                            </div>
                            <div class="d-flex flex-column">
                                <i class="fa-solid fa-list-ul fa-lg cursor-pointer" aria-haspopup="true" aria-controls="overlay_menu" @click="toggle"></i>
                                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
                            </div>
                        </div>
                        <p class="text-white">
                            Inventore sed consequuntur error
                            repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa
                            ratione
                            quam
                            perferendis esse, cupiditate neque
                            quas!
                        </p>
                    </div>
                </div>

                <div class="row mt-3">
                    <div class="social-buttons d-flex flex-wrap">
                        <a href="#" class="social-button instagram" aria-label="Instagram">
                            <i class="fa-brands fa-instagram"></i>
                        </a>
                        <a href="#" class="social-button telegram" aria-label="Telegram">
                            <i class="fa-brands fa-telegram"></i>
                        </a>
                        <a href="#" class="social-button whatsapp" aria-label="WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i>
                        </a>
                        <a href="#" class="social-button x-twitter" aria-label="X (Twitter)">
                            <i class="fa-brands fa-x-twitter"></i>
                        </a>
                        <a href="#" class="social-button" aria-label="tiktok">
                            <i class="fa-brands fa-tiktok"></i>
                        </a>
                        <a href="#" class="social-button" aria-label="camera-prive">
                            <i class="fa-solid fa-camera"></i>
                        </a>
                    </div>
                </div>

                <!-- <div class="row mt-3">
                    <span class="text-white font-bold">Assinatura</span>
                    
                    <div class="p-2 d-flex flex-wrap gap-2">
                        <button class="botao-assinatura">
                            <span class="ms-4 font-bold">1 mês</span>
                            <span class="me-4 font-bold">R$ 10,00</span>
                        </button>
                        <button class="botao-assinatura">
                            <span class="ms-4 font-bold">3 meses</span>
                            <span class="me-4 font-bold">R$ 25,00</span>
                        </button>
                        <button class="botao-assinatura">
                            <span class="ms-4 font-bold">6 meses</span>
                            <span class="me-4 font-bold">R$ 45,00</span>
                        </button>
                    </div>
                </div> -->

                <!-- <div class="row mt-3">
                    <div class="p-2 d-flex flex-wrap gap-2">
                        <button class="botao-assinatura">
                            <span class="ms-4 font-bold">Editar Perfil</span>
                        </button>
                    </div>
                </div> -->
            </div>
        </template>
    </Card>
</template>

<script>
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import SelectButton from 'primevue/selectbutton';
import { Menu } from 'primevue';

export default {
    name: 'Hero',
    components: {
        Card,
        Avatar,
        SelectButton,
        Menu
    },
    data() {
        return {
            items: [
                {
                    label: 'Refresh',
                    icon: 'pi pi-refresh'
                },
                {
                    label: 'Export',
                    icon: 'pi pi-upload'
                }
            ]
        }
    },
    methods: {
        toggle(event) {
            this.$refs.menu.toggle(event);
        }
    }
}
</script>

<style scoped lang="scss">
:deep(.p-card) {
    border-radius: 10px;
    padding: 0 !important;
}

:deep(.p-card-body) {
    background-color: #121212;
    border-radius: 10px;
}

:deep(.p-card-content) {
    background-color: #121212;
    border-radius: 30px 0;
}

:deep(.p-avatar) img {
    border: 3px solid #121212;
    height: 6rem;
    width: 6rem;
}

img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 10px 0 0 0;
}

.avatar {
    left: 30px;
    top: 110px;
}

.social-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 1rem;
    text-decoration: none;
    color: #ffffff;
    background-color: #1e1e1e;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: background-color 0.15s ease-out, border-color 0.15s ease-out, transform 0.1s ease-out;
    margin-right: 0.4rem;
}

.social-button i {
    font-size: 1.1rem;
}

.social-button:hover {
    transform: translateY(-1px);
    background-color: #252525;
    border-color: rgba(255, 255, 255, 0.2);
}

.social-button:active {
    transform: translateY(0);
}

.social-button.instagram {
    color: #e1306c;
}

.social-button.telegram {
    color: #29b6f6;
}

.social-button.whatsapp {
    color: #25d366;
}

.social-button.x-twitter {
    color: #ffffff;
}

.image-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 10px;
    border-radius: 999px;
    background-color: #1e1e1e;
    border: 1px solid rgba(255, 255, 255, 0.08);
    text-decoration: none;
    transition: background-color 0.15s ease-out, border-color 0.15s ease-out, transform 0.1s ease-out;
}

.image-button img {
    max-height: 18px;
    width: auto;
    display: block;
}

.image-button:hover {
    transform: translateY(-1px);
    background-color: #252525;
    border-color: rgba(255, 255, 255, 0.2);
}

.image-button:active {
    transform: translateY(0);
}

.botao-assinatura {
    width: 100%;
    padding: 10px;
    border-radius: 50px;
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 1px;
    background-color: #f5cee1;
    color: #761c49;
    outline: none;
    border: none;
    transition: background-color 0.55s ease, color 0.55s ease, transform 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.botao-assinatura:hover {
    background-color: #761c49;
    color: #f5cee1;
    transform: translateY(-1px);
}
</style>