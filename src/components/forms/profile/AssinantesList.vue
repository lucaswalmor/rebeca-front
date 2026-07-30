<template>
    <div class="assinantes-panel">
        <div class="panel-head">
            <h4>Assinantes</h4>
            <p class="hint">
                Busque clientes, veja o status da assinatura e gerencie acesso (revogar, bloquear ou excluir).
            </p>
        </div>

        <div class="filters">
            <div class="search-wrap">
                <i class="pi pi-search"></i>
                <InputText
                    v-model="search"
                    placeholder="ID, nome, e-mail ou telefone"
                    class="w-full"
                    size="small"
                    @keyup.enter="filtrar"
                />
            </div>
            <Select
                v-model="status"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Status"
                class="status-select"
                size="small"
            />
            <Botao
                texto="Filtrar"
                tema="rosa"
                tamanho="pequeno"
                :carregando="loading"
                @click="filtrar"
            />
        </div>

        <div class="table-wrap">
            <div v-if="loading && items.length === 0" class="empty">
                <i class="pi pi-spin pi-spinner"></i>
            </div>

            <div v-else-if="items.length === 0" class="empty">
                Nenhum assinante encontrado.
            </div>

            <table v-else class="assinantes-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Telefone</th>
                        <th>Status</th>
                        <th>Vencimento</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in items" :key="item.id">
                        <td class="id">{{ item.id }}</td>
                        <td>
                            <div class="cliente">
                                <span class="nome">{{ item.nome || item.apelido || '—' }}</span>
                                <span class="email">{{ item.email }}</span>
                                <span v-if="item.apelido" class="apelido">@{{ item.apelido }}</span>
                            </div>
                        </td>
                        <td>{{ item.telefone || '—' }}</td>
                        <td>
                            <span class="badge" :class="`badge-${item.status_key}`">
                                {{ item.status }}
                            </span>
                        </td>
                        <td>{{ item.vencimento_formatado || '—' }}</td>
                        <td>
                            <div class="acoes">
                                <button
                                    type="button"
                                    class="acoes-trigger"
                                    title="Ações"
                                    :disabled="busyId === item.id"
                                    @click="abrirAcoes($event, item)"
                                >
                                    <i v-if="busyId === item.id" class="pi pi-spin pi-spinner"></i>
                                    <i v-else class="pi pi-ellipsis-v"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <Popover ref="acoesPopover" class="acoes-popover">
            <div v-if="menuItem" class="acoes-menu">
                <button
                    v-if="menuItem.has_active_subscription"
                    type="button"
                    class="acoes-item is-warn"
                    @click="pedirConfirmacao(menuItem, 'revogar')"
                >
                    <i class="pi pi-times-circle"></i>
                    <span>Revogar assinatura</span>
                </button>
                <button
                    type="button"
                    class="acoes-item"
                    @click="pedirConfirmacao(menuItem, menuItem.chat_blocked ? 'desbloquear-chat' : 'bloquear-chat')"
                >
                    <i :class="menuItem.chat_blocked ? 'pi pi-lock-open' : 'pi pi-ban'"></i>
                    <span>{{ menuItem.chat_blocked ? 'Liberar chat' : 'Bloquear chat' }}</span>
                </button>
                <button
                    v-if="!menuItem.is_blocked"
                    type="button"
                    class="acoes-item is-danger"
                    @click="pedirConfirmacao(menuItem, 'bloquear')"
                >
                    <i class="pi pi-user-minus"></i>
                    <span>Bloquear cliente</span>
                </button>
                <button
                    v-else
                    type="button"
                    class="acoes-item is-ok"
                    @click="pedirConfirmacao(menuItem, 'desbloquear')"
                >
                    <i class="pi pi-user-plus"></i>
                    <span>Desbloquear cliente</span>
                </button>
                <button
                    type="button"
                    class="acoes-item is-danger"
                    @click="pedirConfirmacao(menuItem, 'excluir')"
                >
                    <i class="pi pi-trash"></i>
                    <span>Excluir cliente</span>
                </button>
            </div>
        </Popover>

        <div v-if="meta.last_page > 1" class="pager">
            <Botao
                texto="Anterior"
                tipo="texto"
                tema="rosa"
                tamanho="pequeno"
                :desabilitado="meta.current_page <= 1 || loading"
                @click="irPara(meta.current_page - 1)"
            />
            <span class="page-label">
                Página {{ meta.current_page }} de {{ meta.last_page }}
            </span>
            <Botao
                texto="Próxima"
                tipo="texto"
                tema="rosa"
                tamanho="pequeno"
                :desabilitado="meta.current_page >= meta.last_page || loading"
                @click="irPara(meta.current_page + 1)"
            />
        </div>

        <Dialog
            v-model:visible="confirmVisible"
            modal
            :header="confirmTitle"
            :style="{ width: 'min(92vw, 440px)' }"
            dismissableMask
        >
            <p class="confirm-text">{{ confirmMessage }}</p>
            <template #footer>
                <Botao texto="Cancelar" tipo="texto" tema="rosa" @click="confirmVisible = false" />
                <Botao
                    :texto="confirmActionLabel"
                    :tema="confirmTema"
                    :carregando="busyId != null"
                    @click="executarConfirmacao"
                />
            </template>
        </Dialog>
    </div>
</template>

<script>
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Dialog from 'primevue/dialog';
import Popover from 'primevue/popover';
import Botao from '@/components/ui/Botao.vue';

export default {
    name: 'AssinantesList',
    components: { InputText, Select, Dialog, Popover, Botao },
    data() {
        return {
            search: '',
            status: 'todos',
            statusOptions: [
                { label: 'Todos', value: 'todos' },
                { label: 'Ativos', value: 'ativo' },
                { label: 'Vencidos', value: 'vencido' },
                { label: 'Sem assinatura', value: 'sem' },
                { label: 'Bloqueados', value: 'bloqueado' },
            ],
            items: [],
            meta: {
                current_page: 1,
                last_page: 1,
                per_page: 20,
                total: 0,
            },
            loading: false,
            busyId: null,
            busyAction: null,
            confirmVisible: false,
            confirmItem: null,
            confirmAction: null,
            menuItem: null,
        };
    },
    computed: {
        confirmTitle() {
            const map = {
                revogar: 'Revogar assinatura?',
                'bloquear-chat': 'Bloquear chat?',
                'desbloquear-chat': 'Liberar chat?',
                bloquear: 'Bloquear cliente?',
                desbloquear: 'Desbloquear cliente?',
                excluir: 'Excluir cliente?',
            };
            return map[this.confirmAction] || 'Confirmar';
        },
        confirmMessage() {
            const nome = this.confirmItem?.nome || this.confirmItem?.email || 'este cliente';
            const map = {
                revogar: `A assinatura ativa de ${nome} será revogada imediatamente.`,
                'bloquear-chat': `${nome} não poderá mais enviar mensagens no chat até ser liberado.`,
                'desbloquear-chat': `${nome} poderá voltar a enviar mensagens no chat.`,
                bloquear: `${nome} não poderá mais entrar no sistema até ser desbloqueado.`,
                desbloquear: `${nome} poderá voltar a entrar no sistema.`,
                excluir: `${nome} será excluído permanentemente. Se houver assinatura ativa, ela será revogada antes.`,
            };
            return map[this.confirmAction] || '';
        },
        confirmActionLabel() {
            const map = {
                revogar: 'Revogar',
                'bloquear-chat': 'Bloquear chat',
                'desbloquear-chat': 'Liberar chat',
                bloquear: 'Bloquear',
                desbloquear: 'Desbloquear',
                excluir: 'Excluir',
            };
            return map[this.confirmAction] || 'Confirmar';
        },
        confirmTema() {
            if (this.confirmAction === 'revogar') return 'laranja';
            if (this.confirmAction === 'desbloquear' || this.confirmAction === 'desbloquear-chat') {
                return 'sucesso';
            }
            if (this.confirmAction === 'bloquear-chat') return 'roxo';
            return 'vermelho';
        },
    },
    mounted() {
        this.carregar();
    },
    methods: {
        filtrar() {
            this.meta.current_page = 1;
            this.carregar();
        },
        irPara(page) {
            this.meta.current_page = page;
            this.carregar();
        },
        async carregar() {
            this.loading = true;
            try {
                const { data } = await this.api.get('/admin/assinantes', {
                    params: {
                        search: this.search.trim() || undefined,
                        status: this.status === 'todos' ? undefined : this.status,
                        page: this.meta.current_page,
                        per_page: 20,
                    },
                    skipLoading: true,
                });
                this.items = data.data || [];
                this.meta = data.meta || this.meta;
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Não foi possível carregar assinantes',
                    life: 3500,
                });
            } finally {
                this.loading = false;
            }
        },
        abrirAcoes(event, item) {
            this.menuItem = item;
            this.$refs.acoesPopover.toggle(event);
        },
        pedirConfirmacao(item, action) {
            this.$refs.acoesPopover?.hide?.();
            this.confirmItem = item;
            this.confirmAction = action;
            this.confirmVisible = true;
        },
        async executarConfirmacao() {
            const item = this.confirmItem;
            const action = this.confirmAction;
            if (!item || !action) return;

            this.busyId = item.id;
            this.busyAction = action;
            try {
                if (action === 'revogar') {
                    const { data } = await this.api.post(`/admin/assinantes/${item.id}/revogar`);
                    this.upsertItem(data.data);
                    this.$toast.add({ severity: 'success', summary: 'Revogado', detail: data.message, life: 3000 });
                } else if (action === 'bloquear-chat' || action === 'desbloquear-chat') {
                    const { data } = await this.api.post(`/admin/assinantes/${item.id}/${action}`);
                    this.upsertItem(data.data);
                    this.$toast.add({
                        severity: 'success',
                        summary: action === 'bloquear-chat' ? 'Chat bloqueado' : 'Chat liberado',
                        detail: data.message,
                        life: 3000,
                    });
                } else if (action === 'bloquear') {
                    const { data } = await this.api.post(`/admin/assinantes/${item.id}/bloquear`);
                    this.upsertItem(data.data);
                    this.$toast.add({ severity: 'success', summary: 'Bloqueado', detail: data.message, life: 3000 });
                } else if (action === 'desbloquear') {
                    const { data } = await this.api.post(`/admin/assinantes/${item.id}/desbloquear`);
                    this.upsertItem(data.data);
                    this.$toast.add({ severity: 'success', summary: 'Desbloqueado', detail: data.message, life: 3000 });
                } else if (action === 'excluir') {
                    const { data } = await this.api.delete(`/admin/assinantes/${item.id}`);
                    this.items = this.items.filter((i) => i.id !== item.id);
                    this.$toast.add({ severity: 'success', summary: 'Excluído', detail: data.message, life: 3000 });
                }
                this.confirmVisible = false;
            } catch (e) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: e.response?.data?.message || 'Não foi possível concluir a ação',
                    life: 3500,
                });
            } finally {
                this.busyId = null;
                this.busyAction = null;
            }
        },
        upsertItem(updated) {
            if (!updated) return;
            this.items = this.items.map((i) => (i.id === updated.id ? updated : i));
        },
    },
};
</script>

<style scoped lang="scss">
.assinantes-panel {
    color: #ddd;
}

.panel-head h4 {
    margin: 0;
    color: #fff;
}

.hint {
    margin: 0.4rem 0 0;
    color: #aaa;
    font-size: 0.9rem;
    line-height: 1.45;
}

.filters {
    display: grid;
    grid-template-columns: 1fr minmax(140px, 180px) auto;
    gap: 0.65rem;
    margin: 1rem 0;
    padding: 0.85rem;
    border-radius: 12px;
    background: #121212;
    border: 1px solid #2a2a2a;
    align-items: center;
}

.search-wrap {
    position: relative;

    i {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: #888;
        font-size: 0.85rem;
    }

    :deep(.p-inputtext) {
        padding-left: 2.1rem;
        width: 100%;
    }
}

.status-select {
    width: 100%;
}

.table-wrap {
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    overflow: auto;
    background: #121212;
}

.assinantes-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 780px;

    th,
    td {
        padding: 0.85rem 0.9rem;
        text-align: left;
        border-bottom: 1px solid #222;
        vertical-align: middle;
    }

    th {
        font-size: 0.72rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #888;
        font-weight: 700;
        background: #161616;
        position: sticky;
        top: 0;
    }

    tbody tr:hover {
        background: rgba(245, 206, 225, 0.04);
    }
}

.id {
    color: #888;
    font-size: 0.85rem;
}

.cliente {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
}

.nome {
    color: #fff;
    font-weight: 600;
}

.email,
.apelido {
    color: #888;
    font-size: 0.8rem;
}

.badge {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
}

.badge-ativo {
    background: #bbf7d0;
    color: #166534;
}

.badge-vencido,
.badge-revogado {
    background: #fecaca;
    color: #991b1b;
}

.badge-pendente {
    background: #fde68a;
    color: #92400e;
}

.badge-sem {
    background: #e5e7eb;
    color: #374151;
}

.badge-bloqueado {
    background: #fecaca;
    color: #7f1d1d;
}

.acoes {
    display: flex;
    justify-content: flex-end;
}

.acoes-trigger {
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 8px;
    border: 1px solid #333;
    background: #1a1a1a;
    color: #ddd;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.acoes-trigger:hover:not(:disabled) {
    background: #222;
    border-color: #f5cee1;
    color: #f5cee1;
}

.acoes-trigger:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.empty {
    text-align: center;
    padding: 2.5rem 1rem;
    color: #888;
}

.pager {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 1rem;
}

.page-label {
    color: #aaa;
    font-size: 0.85rem;
}

.confirm-text {
    color: #ddd;
    line-height: 1.5;
    margin: 0;
}

@media (max-width: 768px) {
    .filters {
        grid-template-columns: 1fr;
    }
}
</style>

<style lang="scss">
/* Popover sobe para o body — precisa de estilo não-scoped */
.acoes-popover.p-popover {
    --p-popover-background: #1a1a1a;
    --p-popover-color: #e8e8e8;
    --p-popover-border-color: #333333;
    --p-popover-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);

    background: #1a1a1a;
    color: #e8e8e8;
    border: 1px solid #333;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
}

.acoes-popover.p-popover .p-popover-content {
    padding: 0.2rem;
    background: #1a1a1a;
    color: #e8e8e8;
}

.acoes-popover .acoes-menu {
    display: flex;
    flex-direction: column;
    min-width: 12.5rem;
    padding: 0.25rem;
}

.acoes-popover .acoes-item {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    width: 100%;
    padding: 0.55rem 0.7rem;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #e8e8e8;
    font-size: 0.875rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.12s ease;
}

.acoes-popover .acoes-item:hover {
    background: rgba(255, 255, 255, 0.06);
}

.acoes-popover .acoes-item i {
    font-size: 0.9rem;
    width: 1rem;
    text-align: center;
}

.acoes-popover .acoes-item.is-warn {
    color: #fdba74;
}

.acoes-popover .acoes-item.is-danger {
    color: #fca5a5;
}

.acoes-popover .acoes-item.is-ok {
    color: #86efac;
}
</style>
