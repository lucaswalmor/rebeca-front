import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

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
        : 'https://api.becalima007.com.br';
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

    // Produção: domínio custom do app Reverb (EasyPanel + CNAME)
    return {
        key: '908514ef1238b19a',
        wsHost: 'reverb.becalima007.com.br',
        wsPort: 443,
        wssPort: 443,
        forceTLS: true,
        scheme: 'https',
    };
}

let echoInstance = null;
let echoToken = null;

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

    return echoInstance;
}

export function disconnectEcho() {
    if (echoInstance) {
        try {
            echoInstance.disconnect();
        } catch {
            // ignore
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
    } catch {
        return false;
    }
}
