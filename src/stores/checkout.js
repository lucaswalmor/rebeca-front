import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/axios/api';

export const useCheckoutStore = defineStore('checkout', () => {
    // Estado
    const checkoutData = ref({
        handle: '', // InfiniteTag do usuário
        items: [
            {
                quantity: 1,
                price: 0,
                description: ''
            }
        ],
        order_nsu: '',
        webhook_url: '',
        customer: {
            name: '',
            email: '',
            phone_number: ''
        },
        address: {
            cep: '',
            street: '',
            neighborhood: '',
            number: '',
            complement: ''
        }
    });

    const paymentLink = ref('');
    const paymentStatus = ref(null);
    const isLoading = ref(false);
    const error = ref('');

    // Actions
    function addItem() {
        checkoutData.value.items.push({
            quantity: 1,
            price: 0,
            description: ''
        });
    }

    function removeItem(index) {
        if (checkoutData.value.items.length > 1) {
            checkoutData.value.items.splice(index, 1);
        }
    }

    function updateItem(index, field, value) {
        checkoutData.value.items[index][field] = value;
    }

    function calculateTotal() {
        return checkoutData.value.items.reduce((total, item) => {
            return total + (item.quantity * item.price);
        }, 0);
    }

    async function createPaymentLink() {
        isLoading.value = true;
        error.value = '';

        try {
            // Validar dados obrigatórios
            if (!checkoutData.value.handle) {
                throw new Error('Handle (InfiniteTag) é obrigatório');
            }

            if (checkoutData.value.items.length === 0) {
                throw new Error('Adicione pelo menos um item');
            }

            // Verificar se todos os itens têm descrição e preço
            for (let item of checkoutData.value.items) {
                if (!item.description.trim()) {
                    throw new Error('Todos os itens devem ter uma descrição');
                }
                if (item.price <= 0) {
                    throw new Error('Todos os itens devem ter um preço maior que zero');
                }
            }

            // Preparar payload para a API da InfinitePay
            const payload = {
                handle: checkoutData.value.handle,
                items: checkoutData.value.items.map(item => ({
                    quantity: item.quantity,
                    price: Math.round(item.price * 100), // Converter para centavos
                    description: item.description
                }))
            };

            // Adicionar campos opcionais se preenchidos
            if (checkoutData.value.order_nsu) {
                payload.order_nsu = checkoutData.value.order_nsu;
            }

            if (checkoutData.value.webhook_url) {
                payload.webhook_url = checkoutData.value.webhook_url;
            }

            if (checkoutData.value.customer.name ||
                checkoutData.value.customer.email ||
                checkoutData.value.customer.phone_number) {
                payload.customer = {};
                if (checkoutData.value.customer.name) payload.customer.name = checkoutData.value.customer.name;
                if (checkoutData.value.customer.email) payload.customer.email = checkoutData.value.customer.email;
                if (checkoutData.value.customer.phone_number) payload.customer.phone_number = checkoutData.value.customer.phone_number;
            }

            if (checkoutData.value.address.cep ||
                checkoutData.value.address.street ||
                checkoutData.value.address.neighborhood ||
                checkoutData.value.address.number) {
                payload.address = {};
                if (checkoutData.value.address.cep) payload.address.cep = checkoutData.value.address.cep;
                if (checkoutData.value.address.street) payload.address.street = checkoutData.value.address.street;
                if (checkoutData.value.address.neighborhood) payload.address.neighborhood = checkoutData.value.address.neighborhood;
                if (checkoutData.value.address.number) payload.address.number = checkoutData.value.address.number;
                if (checkoutData.value.address.complement) payload.address.complement = checkoutData.value.address.complement;
            }

            // Fazer requisição para a API da InfinitePay
            const response = await fetch('https://api.infinitepay.io/invoices/public/checkout/links', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao criar link de pagamento');
            }

            paymentLink.value = data.link || data.url || data.checkout_url;

            return paymentLink.value;

        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function checkPaymentStatus(orderNsu, transactionNsu, slug) {
        isLoading.value = true;
        error.value = '';

        try {
            const payload = {
                handle: 'rehantunes06',
                order_nsu: orderNsu,
                transaction_nsu: transactionNsu,
                slug: slug
            };

            const response = await fetch('https://api.infinitepay.io/invoices/public/checkout/payment_check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao verificar status do pagamento');
            }

            paymentStatus.value = data;
            return data;

        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    function resetCheckout() {
        checkoutData.value = {
            handle: '',
            items: [
                {
                    quantity: 1,
                    price: 0,
                    description: ''
                }
            ],
            order_nsu: '',
            webhook_url: '',
            customer: {
                name: '',
                email: '',
                phone_number: ''
            },
            address: {
                cep: '',
                street: '',
                neighborhood: '',
                number: '',
                complement: ''
            }
        };
        paymentLink.value = '';
        paymentStatus.value = null;
        error.value = '';
    }

    return {
        // State
        checkoutData,
        paymentLink,
        paymentStatus,
        isLoading,
        error,
        // Actions
        addItem,
        removeItem,
        updateItem,
        calculateTotal,
        createPaymentLink,
        checkPaymentStatus,
        resetCheckout
    };
});
