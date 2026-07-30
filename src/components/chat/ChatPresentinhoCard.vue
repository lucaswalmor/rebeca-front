<template>
    <div class="presentinho-card" :class="{ mine }" role="status">
        <div class="sparkles" aria-hidden="true">
            <span
                v-for="(s, i) in sparkles"
                :key="i"
                class="sparkle"
                :style="s"
            ></span>
        </div>

        <div class="ribbon" aria-hidden="true"></div>

        <div class="card-icon-wrap" aria-hidden="true">
            <div class="card-icon-glow"></div>
            <div class="card-icon">
                <i class="pi pi-gift"></i>
            </div>
        </div>

        <div class="card-title">Presentinho</div>
        <div class="card-amount">{{ formatPrice(payload.valor) }}</div>
        <div class="card-text">
            {{ payload.subscriber_name || 'Alguém' }} mandou com carinho pra Beca
        </div>
        <div class="card-status">
            <i class="pi pi-heart-fill"></i>
            Confirmado
        </div>
    </div>
</template>

<script>
export default {
    name: 'ChatPresentinhoCard',
    props: {
        payload: { type: Object, required: true },
        mine: { type: Boolean, default: false },
    },
    data() {
        return {
            sparkles: Array.from({ length: 12 }, (_, i) => {
                const angle = (i / 12) * 360;
                const delay = (i % 6) * 0.12;
                const dist = 38 + (i % 3) * 10;
                return {
                    '--angle': `${angle}deg`,
                    '--dist': `${dist}px`,
                    '--delay': `${delay}s`,
                    '--size': `${4 + (i % 3)}px`,
                    '--hue': i % 2 === 0 ? '#f5cee1' : '#fda4af',
                };
            }),
        };
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
    --gift-pink: #f5cee1;
    --gift-deep: #761c49;
    --gift-glow: rgba(245, 206, 225, 0.55);

    position: relative;
    overflow: hidden;
    min-width: 220px;
    max-width: 290px;
    padding: 1.15rem 1.1rem 1rem;
    border-radius: 16px;
    border: 1px solid rgba(245, 206, 225, 0.55);
    background:
        radial-gradient(120% 90% at 50% -10%, rgba(245, 206, 225, 0.28), transparent 55%),
        linear-gradient(160deg, rgba(117, 28, 73, 0.55), rgba(30, 10, 20, 0.75));
    color: #fce7f3;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.3rem;
    box-shadow:
        0 0 0 1px rgba(245, 206, 225, 0.08) inset,
        0 10px 28px rgba(117, 28, 73, 0.35);
    animation: gift-pop 0.7s cubic-bezier(0.22, 1.2, 0.36, 1) both;
}

.presentinho-card.mine {
    border-color: rgba(249, 168, 212, 0.7);
}

.presentinho-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
        115deg,
        transparent 30%,
        rgba(255, 255, 255, 0.14) 48%,
        transparent 62%
    );
    transform: translateX(-120%);
    animation: gift-shine 2.8s ease-in-out 0.6s infinite;
    pointer-events: none;
}

.ribbon {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--gift-pink), #fff, var(--gift-pink), transparent);
    opacity: 0.85;
}

.sparkles {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.sparkle {
    position: absolute;
    top: 42%;
    left: 50%;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: var(--hue);
    box-shadow: 0 0 8px var(--hue);
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(0.4);
    animation: sparkle-burst 1.6s ease-out var(--delay) both;
}

.card-icon-wrap {
    position: relative;
    width: 3.4rem;
    height: 3.4rem;
    margin-bottom: 0.35rem;
    display: grid;
    place-items: center;
}

.card-icon-glow {
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--gift-glow), transparent 70%);
    animation: gift-pulse 2s ease-in-out infinite;
}

.card-icon {
    position: relative;
    z-index: 1;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #fce7f3, #f5cee1);
    color: var(--gift-deep);
    font-size: 1.35rem;
    box-shadow: 0 6px 16px rgba(117, 28, 73, 0.35);
    animation: gift-wiggle 2.4s ease-in-out 0.8s infinite;
}

.card-title {
    font-weight: 700;
    font-size: 0.82rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #f9a8d4;
}

.card-amount {
    font-size: 1.55rem;
    font-weight: 800;
    line-height: 1.15;
    color: #fff;
    text-shadow: 0 0 18px rgba(245, 206, 225, 0.45);
    animation: amount-glow 2.2s ease-in-out infinite;
}

.card-text {
    font-size: 0.86rem;
    line-height: 1.4;
    color: rgba(252, 231, 243, 0.9);
    max-width: 15rem;
}

.card-status {
    margin-top: 0.4rem;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.28rem 0.7rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #4ade80;
    background: rgba(74, 222, 128, 0.12);
    border: 1px solid rgba(74, 222, 128, 0.35);

    i {
        font-size: 0.7rem;
        color: #fb7185;
        animation: heart-beat 1.2s ease-in-out infinite;
    }
}

@keyframes gift-pop {
    0% {
        opacity: 0;
        transform: translateY(14px) scale(0.86);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes gift-shine {
    0%,
    55% {
        transform: translateX(-120%);
    }
    80%,
    100% {
        transform: translateX(120%);
    }
}

@keyframes gift-pulse {
    0%,
    100% {
        opacity: 0.55;
        transform: scale(0.92);
    }
    50% {
        opacity: 1;
        transform: scale(1.08);
    }
}

@keyframes gift-wiggle {
    0%,
    85%,
    100% {
        transform: rotate(0deg);
    }
    90% {
        transform: rotate(-8deg);
    }
    95% {
        transform: rotate(8deg);
    }
}

@keyframes amount-glow {
    0%,
    100% {
        text-shadow: 0 0 12px rgba(245, 206, 225, 0.3);
    }
    50% {
        text-shadow: 0 0 22px rgba(245, 206, 225, 0.7);
    }
}

@keyframes sparkle-burst {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(0.2);
    }
    25% {
        opacity: 1;
    }
    100% {
        opacity: 0;
        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(var(--dist) * -1)) scale(1);
    }
}

@keyframes heart-beat {
    0%,
    100% {
        transform: scale(1);
    }
    40% {
        transform: scale(1.25);
    }
    60% {
        transform: scale(1);
    }
}

@media (prefers-reduced-motion: reduce) {
    .presentinho-card,
    .presentinho-card::before,
    .card-icon,
    .card-icon-glow,
    .card-amount,
    .sparkle,
    .card-status i {
        animation: none !important;
    }

    .presentinho-card {
        opacity: 1;
        transform: none;
    }
}
</style>
