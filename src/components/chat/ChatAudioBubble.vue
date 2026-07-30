<template>
    <div class="audio-bubble" :class="{ mine }">
        <button type="button" class="play-btn" :title="playing ? 'Pausar' : 'Reproduzir'" @click="toggle">
            <i :class="playing ? 'pi pi-pause' : 'pi pi-play'"></i>
        </button>
        <div class="audio-track">
            <div class="progress-rail" @click="seek">
                <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
                <div class="progress-knob" :style="{ left: progressPct + '%' }"></div>
            </div>
            <div class="audio-meta">
                <span>{{ displayTime }}</span>
            </div>
        </div>
        <audio
            ref="audio"
            :src="src"
            preload="metadata"
            @timeupdate="onTime"
            @loadedmetadata="onMeta"
            @ended="onEnded"
        />
    </div>
</template>

<script>
export default {
    name: 'ChatAudioBubble',
    props: {
        src: { type: String, required: true },
        durationSeconds: { type: [Number, String], default: 0 },
        mine: { type: Boolean, default: false },
    },
    data() {
        return {
            playing: false,
            current: 0,
            duration: Number(this.durationSeconds) || 0,
        };
    },
    computed: {
        progressPct() {
            if (!this.duration) return 0;
            return Math.min(100, (this.current / this.duration) * 100);
        },
        displayTime() {
            const value = this.playing || this.current > 0
                ? Math.max(0, Math.floor(this.duration - this.current))
                : Math.max(0, Math.floor(this.duration || Number(this.durationSeconds) || 0));
            return this.format(value);
        },
    },
    watch: {
        durationSeconds(val) {
            const n = Number(val);
            if (n > 0 && !this.duration) this.duration = n;
        },
    },
    beforeUnmount() {
        this.pause();
    },
    methods: {
        format(total) {
            const m = Math.floor(total / 60);
            const s = Math.floor(total % 60);
            return `${m}:${String(s).padStart(2, '0')}`;
        },
        toggle() {
            const el = this.$refs.audio;
            if (!el) return;
            if (this.playing) {
                this.pause();
            } else {
                document.querySelectorAll('audio').forEach((a) => {
                    if (a !== el) a.pause();
                });
                el.play().then(() => {
                    this.playing = true;
                }).catch(() => {
                    this.playing = false;
                });
            }
        },
        pause() {
            const el = this.$refs.audio;
            if (el) el.pause();
            this.playing = false;
        },
        onTime() {
            const el = this.$refs.audio;
            if (!el) return;
            this.current = el.currentTime || 0;
            if (el.duration && Number.isFinite(el.duration)) {
                this.duration = el.duration;
            }
        },
        onMeta() {
            const el = this.$refs.audio;
            if (el?.duration && Number.isFinite(el.duration)) {
                this.duration = el.duration;
            }
        },
        onEnded() {
            this.playing = false;
            this.current = 0;
        },
        seek(event) {
            const el = this.$refs.audio;
            if (!el || !this.duration) return;
            const rect = event.currentTarget.getBoundingClientRect();
            const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
            el.currentTime = ratio * this.duration;
            this.current = el.currentTime;
        },
    },
};
</script>

<style scoped lang="scss">
.audio-bubble {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-width: 200px;
    max-width: 280px;
    padding: 0.35rem 0.45rem 0.35rem 0.25rem;
    box-sizing: border-box;
}

.play-btn {
    width: 2.35rem;
    height: 2.35rem;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;

    i {
        font-size: 0.9rem;
        margin-left: 1px;
    }
}

.audio-bubble.mine .play-btn {
    background: rgba(117, 28, 73, 0.4);
    color: #f5cee1;
}

.audio-track {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.15rem 0.15rem 0.1rem 0;
}

.progress-rail {
    position: relative;
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.22);
    cursor: pointer;
    margin: 0.2rem 0.2rem 0 0;
}

.progress-fill {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: inherit;
    background: #25d366;
}

.audio-bubble.mine .progress-fill {
    background: #f5cee1;
}

.progress-knob {
    position: absolute;
    top: 50%;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #25d366;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.15);
}

.audio-bubble.mine .progress-knob {
    background: #f5cee1;
}

.audio-meta {
    font-size: 0.78rem;
    line-height: 1;
    color: rgba(255, 255, 255, 0.72);
    padding-left: 0.05rem;
    font-variant-numeric: tabular-nums;
}

audio {
    display: none;
}
</style>
