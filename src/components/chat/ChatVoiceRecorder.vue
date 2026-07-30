<template>
    <div class="voice-recorder" :class="{ mobile: isMobile }">
        <template v-if="isMobile">
            <div class="mobile-top">
                <span class="timer" :class="{ capped: isCapped }">{{ timerLabel }}</span>
                <div class="wave" aria-hidden="true">
                    <span
                        v-for="(h, i) in bars"
                        :key="i"
                        class="bar"
                        :style="{ height: h + '%' }"
                    />
                </div>
            </div>
            <p class="limit-hint">Máximo 1 minuto por áudio</p>
            <audio
                v-if="previewUrl && paused"
                ref="previewAudio"
                :src="previewUrl"
                class="preview-audio"
                controls
                @play="previewPlaying = true"
                @pause="previewPlaying = false"
                @ended="previewPlaying = false"
            />
            <div class="mobile-controls">
                <button type="button" class="ctrl trash" title="Descartar" @click="$emit('discard')">
                    <i class="pi pi-trash"></i>
                </button>
                <button
                    type="button"
                    class="ctrl pause"
                    :title="paused ? 'Retomar' : 'Pausar'"
                    :disabled="isCapped && !paused"
                    @click="$emit('toggle-pause')"
                >
                    <i :class="paused ? 'pi pi-play' : 'pi pi-pause'"></i>
                </button>
                <button
                    type="button"
                    class="ctrl send"
                    title="Enviar"
                    :disabled="!canSend"
                    @click="$emit('send')"
                >
                    <i class="pi pi-send"></i>
                </button>
            </div>
        </template>

        <template v-else>
            <button type="button" class="desk-icon trash" title="Descartar" @click="$emit('discard')">
                <i class="pi pi-trash"></i>
            </button>
            <span class="rec-dot" :class="{ paused }" />
            <span class="timer" :class="{ capped: isCapped }">{{ timerLabel }}</span>
            <div class="wave desk-wave" aria-hidden="true">
                <span
                    v-for="(h, i) in bars"
                    :key="i"
                    class="bar"
                    :style="{ height: h + '%' }"
                />
            </div>
            <button
                type="button"
                class="desk-icon"
                :title="paused ? 'Retomar' : 'Pausar'"
                :disabled="isCapped && !paused"
                @click="$emit('toggle-pause')"
            >
                <i :class="paused ? 'pi pi-play' : 'pi pi-pause'"></i>
            </button>
            <button
                type="button"
                class="desk-send"
                title="Enviar"
                :disabled="!canSend"
                @click="$emit('send')"
            >
                <i class="pi pi-send"></i>
            </button>
            <span class="limit-hint desk-hint">Máx. 1 min</span>
            <audio
                v-if="previewUrl && paused"
                ref="previewAudio"
                :src="previewUrl"
                class="preview-audio desk-preview"
                controls
                @play="previewPlaying = true"
                @pause="previewPlaying = false"
                @ended="previewPlaying = false"
            />
        </template>
    </div>
</template>

<script>
export default {
    name: 'ChatVoiceRecorder',
    props: {
        elapsedMs: { type: Number, default: 0 },
        maxSeconds: { type: Number, default: 60 },
        paused: { type: Boolean, default: false },
        canSend: { type: Boolean, default: false },
        level: { type: Number, default: 0 },
        previewUrl: { type: String, default: null },
    },
    emits: ['discard', 'toggle-pause', 'send'],
    data() {
        return {
            bars: Array.from({ length: 28 }, () => 18),
            isMobile: false,
            mq: null,
            previewPlaying: false,
        };
    },
    computed: {
        elapsedSeconds() {
            return Math.floor(this.elapsedMs / 1000);
        },
        isCapped() {
            return this.elapsedSeconds >= this.maxSeconds;
        },
        timerLabel() {
            const total = Math.min(this.elapsedSeconds, this.maxSeconds);
            const m = Math.floor(total / 60);
            const s = total % 60;
            return `${m}:${String(s).padStart(2, '0')}`;
        },
    },
    watch: {
        level() {
            this.tickBars();
        },
        paused(val) {
            if (!val) this.tickBars();
        },
        elapsedMs() {
            this.tickBars();
        },
    },
    mounted() {
        this.mq = window.matchMedia('(max-width: 768px)');
        this.isMobile = this.mq.matches;
        this.onMq = () => {
            this.isMobile = this.mq.matches;
        };
        this.mq.addEventListener?.('change', this.onMq);
    },
    beforeUnmount() {
        this.mq?.removeEventListener?.('change', this.onMq);
    },
    methods: {
        tickBars() {
            if (this.paused) return;
            const base = Math.max(0.08, Math.min(1, this.level || 0.2));
            this.bars = this.bars.map((_, i) => {
                const wave = Math.sin((Date.now() / 120) + i * 0.45) * 0.5 + 0.5;
                const h = 12 + (base * 70 + wave * 25);
                return Math.max(10, Math.min(100, h));
            });
        },
    },
};
</script>

<style scoped lang="scss">
.voice-recorder {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    width: 100%;
    min-height: 3.2rem;
    padding: 0.45rem 0.55rem;
    background: #1a1a1a;
    border-radius: 18px;
    border: 1px solid #2a2a2a;
    position: relative;
}

.voice-recorder.mobile {
    flex-direction: column;
    align-items: stretch;
    gap: 0.45rem;
    padding: 0.7rem 0.75rem 0.85rem;
}

.mobile-top {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.mobile-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.15rem 0.25rem;
}

.timer {
    color: #fff;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    min-width: 2.4rem;

    &.capped {
        color: #f87171;
    }
}

.rec-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ef4444;
    flex-shrink: 0;
    animation: pulse 1.1s ease-in-out infinite;

    &.paused {
        animation: none;
        opacity: 0.55;
    }
}

.wave {
    display: flex;
    align-items: center;
    gap: 2px;
    height: 28px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.desk-wave {
    height: 24px;
}

.bar {
    width: 3px;
    border-radius: 99px;
    background: rgba(255, 255, 255, 0.75);
    display: inline-block;
}

.ctrl {
    width: 2.8rem;
    height: 2.8rem;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.05rem;

    &.trash {
        background: transparent;
        color: #ddd;
    }

    &.pause {
        background: #ef4444;
        color: #fff;
    }

    &.send {
        background: #25d366;
        color: #fff;
    }

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
}

.desk-icon {
    border: none;
    background: transparent;
    color: #ddd;
    cursor: pointer;
    width: 2rem;
    height: 2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &.trash {
        color: #f87171;
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
}

.desk-send {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: none;
    background: #25d366;
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
}

.limit-hint {
    margin: 0;
    font-size: 0.75rem;
    color: #999;
}

.desk-hint {
    position: absolute;
    right: 0.75rem;
    bottom: -1.15rem;
    font-size: 0.7rem;
}

.preview-audio {
    width: 100%;
    height: 32px;
    margin-top: 0.15rem;
}

.desk-preview {
    position: absolute;
    left: 0.55rem;
    right: 0.55rem;
    bottom: -2.35rem;
    width: auto;
}

.voice-recorder:not(.mobile) {
    margin-bottom: 1.1rem;
}

.voice-recorder:not(.mobile):has(.desk-preview) {
    margin-bottom: 2.4rem;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
}
</style>
