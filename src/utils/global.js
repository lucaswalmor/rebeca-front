/**
 * Funções globais para verificação de status do usuário
 */

/**
 * Verifica se o usuário logado é administrador
 * @returns {boolean} true se o usuário for admin, false caso contrário
 */
export function isAdmin() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        // Verificar se é admin (pode vir como boolean true, string "true" ou número 1)
        return user.is_admin === true || user.is_admin === 'true' || user.is_admin === 1;
    } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
        return false;
    }
}

/**
 * Verifica se o usuário logado tem assinatura ativa
 * @returns {boolean} true se o usuário tiver assinatura ativa, false caso contrário
 */
export function hasAssinaturaAtiva() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        // Verificar se tem assinatura ativa (pode vir como boolean true, string "true" ou número 1)
        return user.assinatura === true || user.assinatura === 'true' || user.assinatura === 1;
    } catch (error) {
        console.error('Erro ao verificar status de assinatura:', error);
        return false;
    }
}

/**
 * Verifica se o usuário está logado
 * @returns {boolean} true se o usuário estiver logado, false caso contrário
 */
export function isLoggedIn() {
    return !!localStorage.getItem('token') && !!localStorage.getItem('user');
}

export function statusAssinatura() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return user.status_assinatura;
}

export function currentUserId() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id;
}