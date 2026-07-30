<template>
    <div class="video-call-card" :class="{ paid: isPaid, mine }">
        <div class="card-title">{{ payload.titulo || 'Chamada de vídeo com a beca' }}</div>
        <div class="card-line"><span>Data:</span> {{ formatDate(payload.data) }}</div>
        <div class="card-line"><span>Horário:</span> {{ payload.horario || '—' }}</div>
        <div class="card-line"><span>Duração:</span> {{ durationLabel }}</div>
        <div class="card-line"><span>Valor:</span> {{ formatPrice(payload.valor) }}</div>
        <div class="card-line">
            <span>Pagamento:</span>
            <strong :class="isPaid ? 'ok' : 'pending'">{{ statusLabel }}</strong>
        </div>

        <a
            v-if="!isPaid && payload.payment_link"
            class="card-action pay"
            :href="payload.payment_link"
        >
            PAGUE AQUI
        </a>

        <a
            v-if="isPaid && payload.meet_link"
            class="card-action meet"
            :href="payload.meet_link"
            target="_blank"
            rel="noopener noreferrer"
        >
            <i class="pi pi-video"></i>
            Abrir Meet / Zoom
        </a>
    </div>
</template>

<script>
export default {
    name: 'ChatVideoCallCard',
    props: {
        payload: { type: Object, required: true },
        mine: { type: Boolean, default: false },
    },
    computed: {
        isPaid() {
            return this.payload?.status === 'aprovado' || this.payload?.card_kind === 'receipt';
        },
        statusLabel() {
            return this.isPaid ? 'Pago' : 'Pendente';
        },
        durationLabel() {
            const n = Number(this.payload?.duracao_minutos);
            if (!Number.isFinite(n) || n <= 0) return '—';
            return `${n} min`;
        },
    },
    methods: {
        formatDate(value) {
            if (!value) return '—';
            const [y, m, d] = String(value).split('-');
            if (!y || !m || !d) return value;
            return `${d}/${m}/${y}`;
        },
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
.video-call-card {
    min-width: 210px;
    max-width: 280px;
    padding: 0.85rem 0.95rem;
    border: 1px solid #c084fc;
    border-radius: 12px;
    background: rgba(88, 28, 135, 0.18);
    color: #e9d5ff;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.video-call-card.mine {
    border-color: #f5cee1;
    background: rgba(117, 28, 73, 0.22);
    color: #fce7f3;
}

.card-title {
    font-weight: 700;
    margin-bottom: 0.25rem;
    line-height: 1.3;
}

.card-line {
    font-size: 0.88rem;
    line-height: 1.35;

    span {
        opacity: 0.8;
        margin-right: 0.25rem;
    }

    .pending {
        color: #fbbf24;
    }

    .ok {
        color: #4ade80;
    }
}

.card-action {
    margin-top: 0.55rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.55rem 0.75rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.85rem;
    text-decoration: none;
    letter-spacing: 0.02em;
}

.card-action.pay {
    background: #f5cee1;
    color: #761c49;
}

.card-action.meet {
    background: #25d366;
    color: #fff;
}
</style>
