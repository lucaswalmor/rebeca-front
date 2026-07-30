<template>
    <button
        class="botao"
        :class="classes"
        :type="type"
        :disabled="desabilitado || carregando"
        :aria-busy="carregando ? 'true' : undefined"
        @click="onClick"
    >
        <i v-if="carregando" class="pi pi-spin pi-spinner botao-icone"></i>
        <i v-else-if="icone" :class="[icone, 'botao-icone']"></i>
        <span v-if="texto" class="botao-texto">{{ texto }}</span>
        <span v-if="$slots.default" class="botao-conteudo">
            <slot />
        </span>
    </button>
</template>

<script>
const TEMAS = {
    rosa: { claro: '#f5cee1', escuro: '#761c49' },
    azul: { claro: '#bfdbfe', escuro: '#1e3a8a' },
    verde: { claro: '#bbf7d0', escuro: '#166534' },
    amarelo: { claro: '#fde68a', escuro: '#92400e' },
    roxo: { claro: '#ede9fe', escuro: '#7c3aed' },
    branco: { claro: '#ffffff', escuro: '#111111' },
    laranja: { claro: '#fed7aa', escuro: '#9a3412' },
    vermelho: { claro: '#fecaca', escuro: '#991b1b' },
    sucesso: { claro: '#bbf7d0', escuro: '#166534' },
};

export default {
    name: 'Botao',
    props: {
        texto: { type: String, default: '' },
        icone: { type: String, default: '' },
        tema: {
            type: String,
            default: 'rosa',
            validator: (v) => Object.keys(TEMAS).includes(v),
        },
        variante: {
            type: String,
            default: 'normal',
            validator: (v) => ['normal', 'invertida'].includes(v),
        },
        tipo: {
            type: String,
            default: 'padrao',
            validator: (v) => ['padrao', 'pilula', 'contorno', 'texto'].includes(v),
        },
        tamanho: {
            type: String,
            default: 'medio',
            validator: (v) => ['pequeno', 'medio', 'grande'].includes(v),
        },
        bloco: { type: Boolean, default: false },
        carregando: { type: Boolean, default: false },
        desabilitado: { type: Boolean, default: false },
        type: { type: String, default: 'button' },
    },
    emits: ['click'],
    computed: {
        cores() {
            const par = TEMAS[this.tema] || TEMAS.rosa;
            if (this.variante === 'invertida') {
                return { fundo: par.escuro, texto: par.claro };
            }
            return { fundo: par.claro, texto: par.escuro };
        },
        classes() {
            return [
                `tema-${this.tema}`,
                `variante-${this.variante}`,
                `tipo-${this.tipo}`,
                `tamanho-${this.tamanho}`,
                { 'is-bloco': this.bloco, 'is-carregando': this.carregando },
            ];
        },
    },
    methods: {
        onClick(event) {
            if (this.desabilitado || this.carregando) return;
            this.$emit('click', event);
        },
    },
};
</script>

<style scoped lang="scss">
.botao {
    --botao-fundo: v-bind('cores.fundo');
    --botao-texto: v-bind('cores.texto');

    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    margin: 0;
    border: 1px solid transparent;
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
    text-decoration: none;
    user-select: none;
    transition:
        background-color 0.55s ease,
        color 0.55s ease,
        border-color 0.55s ease,
        transform 0.2s ease,
        opacity 0.2s ease;
    background-color: var(--botao-fundo);
    color: var(--botao-texto);
    border-color: var(--botao-fundo);

    &:hover:not(:disabled) {
        background-color: var(--botao-texto);
        color: var(--botao-fundo);
        border-color: var(--botao-texto);
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
    }

    &.is-bloco {
        width: 100%;
    }

    &.tipo-padrao {
        border-radius: 6px;
    }

    &.tipo-pilula {
        border-radius: 50px;
    }

    &.tipo-contorno {
        background-color: transparent;
        color: var(--botao-texto);
        border-color: var(--botao-texto);
        border-radius: 6px;

        &:hover:not(:disabled) {
            background-color: var(--botao-texto);
            color: var(--botao-fundo);
            border-color: var(--botao-texto);
        }
    }

    &.tipo-texto {
        background-color: transparent;
        border-color: transparent;
        color: var(--botao-texto);
        border-radius: 6px;
        box-shadow: none;

        &:hover:not(:disabled) {
            background-color: color-mix(in srgb, var(--botao-texto) 12%, transparent);
            color: var(--botao-texto);
            border-color: transparent;
            transform: none;
        }
    }

    &.tipo-contorno.tipo-pilula,
    &.tipo-pilula.tipo-contorno {
        border-radius: 50px;
    }

    &.tamanho-pequeno {
        min-height: 2rem;
        padding: 0.35rem 0.75rem;
        font-size: 0.82rem;
    }

    &.tamanho-medio {
        min-height: 2.5rem;
        padding: 0.55rem 1rem;
        font-size: 0.95rem;
    }

    &.tamanho-grande {
        min-height: 3rem;
        padding: 0.75rem 1.25rem;
        font-size: 1.05rem;
    }

    &.tipo-pilula.tamanho-grande {
        padding: 10px 18px;
        font-size: 18px;
        font-weight: 500;
        letter-spacing: 1px;
    }
}

.botao-icone {
    font-size: 0.95em;
    line-height: 1;
}

.botao-texto,
.botao-conteudo {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
}

.botao-conteudo {
    width: 100%;
    justify-content: space-between;
}
</style>
