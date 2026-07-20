/**
 * Proteção parcial contra captura de tela.
 * Mostra overlay preto ao detectar Print Screen / atalhos comuns
 * e quando a aba perde o foco (ex.: Ferramenta de Recorte).
 *
 * Limitação: o SO pode capturar antes do JS reagir — não é bloqueio absoluto.
 */

const OVERLAY_ID = 'screenshot-guard-overlay';
let hideTimer = null;
let isActive = false;

function ensureOverlay() {
    let overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        return overlay;
    }

    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('aria-hidden', 'true');
    Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        width: '100vw',
        height: '100vh',
        background: '#000',
        zIndex: '2147483647',
        display: 'none',
        pointerEvents: 'none',
    });
    document.documentElement.appendChild(overlay);
    return overlay;
}

function showBlackScreen(durationMs = 2500) {
    const overlay = ensureOverlay();
    overlay.style.display = 'block';
    isActive = true;

    if (hideTimer) {
        clearTimeout(hideTimer);
    }

    hideTimer = setTimeout(() => {
        if (document.visibilityState === 'visible' && document.hasFocus()) {
            hideBlackScreen();
        }
    }, durationMs);
}

function hideBlackScreen() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.style.display = 'none';
    }
    isActive = false;
    if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }
}

function isPrintScreenEvent(event) {
    const key = event.key || '';
    const code = event.code || '';

    if (key === 'PrintScreen' || code === 'PrintScreen') {
        return true;
    }

    // Windows: Win+Shift+S (recorte) — Shift+S com Meta
    if ((event.metaKey || event.key === 'Meta') && event.shiftKey && (key === 's' || key === 'S' || code === 'KeyS')) {
        return true;
    }

    // Alguns teclados / navegadores
    if (event.keyCode === 44) {
        return true;
    }

    return false;
}

export function initScreenshotGuard() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    ensureOverlay();

    document.addEventListener(
        'keyup',
        (event) => {
            if (isPrintScreenEvent(event)) {
                showBlackScreen(3000);
            }
        },
        true
    );

    document.addEventListener(
        'keydown',
        (event) => {
            if (isPrintScreenEvent(event)) {
                showBlackScreen(3000);
            }
        },
        true
    );

    // Ao sair da aba / abrir recorte, cobre de preto
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            showBlackScreen(60000);
        } else if (document.hasFocus()) {
            hideBlackScreen();
        }
    });

    window.addEventListener('blur', () => {
        showBlackScreen(60000);
    });

    window.addEventListener('focus', () => {
        // Pequeno delay para cobrir captura que ocorre no retorno do foco
        setTimeout(() => {
            if (document.visibilityState === 'visible') {
                hideBlackScreen();
            }
        }, 300);
    });
}

export function isScreenshotGuardActive() {
    return isActive;
}
