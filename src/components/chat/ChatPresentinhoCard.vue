<template>
    <div class="presentinho-card" :class="{ mine }">
        <div class="card-icon" aria-hidden="true">
            <i class="pi pi-gift"></i>
        </div>
        <div class="card-title">Presentinho</div>
        <div class="card-text">
            {{ payload.subscriber_name || 'Alguém' }} enviou um presentinho de
            <strong>{{ formatPrice(payload.valor) }}</strong>
        </div>
        <div class="card-status">Confirmado</div>
    </div>
</template>

<script>
export default {
    name: 'ChatPresentinhoCard',
    props: {
        payload: { type: Object, required: true },
        mine: { type: Boolean, default: false },
    },
    methods: {
        formatPrice(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(Number(value || 0));
        },
    },
};
</script>

<style scoped lang="scss">
.presentinho-card {
    min-width: 200px;
    max-width: 280px;
    padding: 0.9rem 1rem;
    border: 1px solid #f5cee1;
    border-radius: 12px;
    background: linear-gradient(145deg, rgba(117, 28, 73, 0.28), rgba(245, 206, 225, 0.08));
    color: #fce7f3;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.35rem;
}

.presentinho-card.mine {
    border-color: #f9a8d4;
}

.card-icon {
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(245, 206, 225, 0.2);
    color: #f5cee1;
    font-size: 1.1rem;
}

.card-title {
    font-weight: 700;
    font-size: 0.95rem;
}

.card-text {
    font-size: 0.88rem;
    line-height: 1.4;
    opacity: 0.95;

    strong {
        color: #fff;
    }
}

.card-status {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #4ade80;
    letter-spacing: 0.03em;
    text-transform: uppercase;
}
</style>
