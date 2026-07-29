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
let echoToken = null;

function bindConnectionLogs(echo) {
    try {
        const pusher = echo.connector?.pusher;
        if (!pusher?.connection) return;

        pusher.connection.bind('state_change', (states) => {
            chatLog('ws state', states.previous, '->', states.current);
        });
        pusher.connection.bind('connected', () => {
            chatLog('ws connected', pusher.connection.socket_id);
        });
        pusher.connection.bind('error', (err) => {
            chatWarn('ws error', err);
        });
        pusher.connection.bind('unavailable', () => {
            chatWarn('ws unavailable — verifique proxy/domínio do Reverb na porta 8080');
        });
        pusher.connection.bind('failed', () => {
            chatWarn('ws failed');
        });
    } catch (e) {
        chatWarn('bindConnectionLogs failed', e);
    }
}

export function getEcho() {
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }

    // Reutiliza a conexão existente (evita abortar o WebSocket a cada navegação)
    if (echoInstance && echoToken === token) {
        return echoInstance;
    }

    if (echoInstance) {
        disconnectEcho();
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
        disableStats: true,
        authEndpoint: `${apiOrigin}/api/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        },
    });

    echoToken = token;
    window.Echo = echoInstance;
    bindConnectionLogs(echoInstance);
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
        echoToken = null;
        window.Echo = null;
    }
}

export function refreshEchoAuth() {
    // Só recria se o token mudou; senão mantém o socket aberto
    return getEcho();
}

export function isEchoConnected() {
    try {
        const state = echoInstance?.connector?.pusher?.connection?.state;
        return state === 'connected';
    } catch (e) {
        return false;
    }
}
