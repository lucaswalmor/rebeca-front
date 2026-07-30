<template>
    <div class="pix-card" :class="{ mine }">
        <div class="pix-title">
            <i class="pi pi-wallet"></i>
            <span>{{ payload.titulo || 'Chave Pix' }}</span>
        </div>
        <button
            type="button"
            class="pix-key"
            title="Clique para copiar"
            @click="copyKey"
        >
            {{ chave }}
        </button>
        <button
            type="button"
            class="pix-copy-btn"
            :class="{ copied }"
            @click="copyKey"
        >
            <i :class="copied ? 'pi pi-check' : 'pi pi-copy'"></i>
            {{ copied ? 'Copiada!' : 'Copiar chave' }}
        </button>
    </div>
</template>

<script>
export default {
    name: 'ChatPixKeyCard',
    props: {
        payload: { type: Object, required: true },
        mine: { type: Boolean, default: false },
    },
    data() {
        return {
            copied: false,
            copyTimer: null,
        };
    },
    computed: {
        chave() {
            return this.payload?.chave || '';
        },
    },
    beforeUnmount() {
        if (this.copyTimer) clearTimeout(this.copyTimer);
    },
    methods: {
        async copyKey() {
            const value = this.chave;
            if (!value) return;

            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(value);
                } else {
                    const el = document.createElement('textarea');
                    el.value = value;
                    el.setAttribute('readonly', '');
                    el.style.position = 'absolute';
                    el.style.left = '-9999px';
                    document.body.appendChild(el);
                    el.select();
                    document.execCommand('copy');
                    document.body.removeChild(el);
                }

                this.copied = true;
                if (this.copyTimer) clearTimeout(this.copyTimer);
                this.copyTimer = setTimeout(() => {
                    this.copied = false;
                }, 2000);

                this.$toast?.add?.({
                    severity: 'success',
                    summary: 'Copiado',
                    detail: 'Chave Pix copiada.',
                    life: 2000,
                });
            } catch {
                this.$toast?.add?.({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Não foi possível copiar a chave.',
                    life: 3000,
                });
            }
        },
    },
};
</script>

<style scoped lang="scss">
.pix-card {
    min-width: 220px;
    max-width: 300px;
    padding: 0.9rem 1rem;
    border-radius: 12px;
    border: 1px solid rgba(52, 211, 153, 0.45);
    background: linear-gradient(160deg, rgba(6, 78, 59, 0.45), rgba(12, 20, 18, 0.85));
    color: #d1fae5;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
}

.pix-card.mine {
    border-color: rgba(110, 231, 183, 0.55);
}

.pix-title {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 700;
    font-size: 0.9rem;
    color: #a7f3d0;

    i {
        color: #34d399;
    }
}

.pix-key {
    width: 100%;
    border: 1px dashed rgba(52, 211, 153, 0.4);
    background: rgba(0, 0, 0, 0.25);
    color: #ecfdf5;
    border-radius: 8px;
    padding: 0.65rem 0.7rem;
    font-size: 0.78rem;
    line-height: 1.4;
    word-break: break-all;
    text-align: left;
    cursor: pointer;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

    &:hover {
        border-color: #34d399;
        background: rgba(16, 185, 129, 0.12);
    }
}

.pix-copy-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    border: none;
    border-radius: 8px;
    padding: 0.55rem 0.75rem;
    background: #34d399;
    color: #064e3b;
    font-weight: 700;
    font-size: 0.84rem;
    cursor: pointer;

    &:hover {
        background: #6ee7b7;
    }

    &.copied {
        background: #10b981;
        color: #fff;
    }
}
</style>
