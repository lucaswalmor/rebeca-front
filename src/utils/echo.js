import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const CHAT_DEBUG = true;

export function chatLog(...args) {
    if (CHAT_DEBUG) {
        // eslint-disable-next-line no-console
        console.log('[CHAT]', ...args);
    }
}

export function chatWarn(...args) {
    if (CHAT_DEBUG) {
        // eslint-disable-next-line no-console
        console.warn('[CHAT]', ...args);
    }
}

function isDevelopmentHost() {
    const host = window.location.hostname;
    return host === 'localhost'
        || host === '127.0.0.1'
        || host === '192.168.100.223'
        || host.includes('.local');
}

export function getApiOrigin() {
    return isDevelopmentHost()
        ? 'http://127.0.0.1:8000'
        : 'https://rebeca-backend.irkqjy.easypanel.host';
}

export function getReverbConfig() {
    if (isDevelopmentHost()) {
        return {
            key: '908514ef1238b19a',
            wsHost: 'localhost',
            wsPort: 8080,
            wssPort: 8080,
            forceTLS: false,
            scheme: 'http',
        };
    }

    // Produção: host público do app Reverb no EasyPanel (sem .env na Vercel)
    return {
        key: '908514ef1238b19a',
        wsHost: 'rebeca-reverb.irkqjy.easypanel.host',
        wsPort: 443,
        wssPort: 443,
        forceTLS: true,
        scheme: 'https',
    };
}

let echoInstance = null;

export function getEcho() {
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }

    if (echoInstance) {
        return echoInstance;
    }

    window.Pusher = Pusher;
    const cfg = getReverbConfig();
    const apiOrigin = getApiOrigin();

    echoInstance = new Echo({
        broadcaster: 'reverb',
        key: cfg.key,
        wsHost: cfg.wsHost,
        wsPort: cfg.wsPort,
        wssPort: cfg.wssPort,
        forceTLS: cfg.forceTLS,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${apiOrigin}/api/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        },
    });

    window.Echo = echoInstance;
    chatLog('Echo connected config', cfg);

    return echoInstance;
}

export function disconnectEcho() {
    if (echoInstance) {
        try {
            echoInstance.disconnect();
        } catch (e) {
            chatWarn('Echo disconnect error', e);
        }
        echoInstance = null;
        window.Echo = null;
    }
}

export function refreshEchoAuth() {
    disconnectEcho();
    return getEcho();
}
