import { Order } from '../types';

// Configuration interfaces
export interface TlyncConfig {
    merchantId: string;
    storeId: string;
    secretKey: string;
    isTestMode: boolean;
}

// Standard Tlync/MobiCash parameters
interface TlyncPaymentParams {
    merchant_id: string;
    store_id: string;
    order_id: string;
    amount: string;
    currency: string;
    return_url: string;
    cancel_url: string;
    hash?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
}

// Helper to generate SHA-256 hash
async function generateHash(params: string, secretKey: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(params + secretKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export const initiateTlyncPayment = async (order: Order, config: TlyncConfig) => {
    const baseUrl = config.isTestMode 
        ? 'https://dev-checkout.pay.net.ly' 
        : 'https://checkout.pay.net.ly';

    // Amount must be formatted to 2 decimal places
    const amountStr = order.total.toFixed(2);
    
    // Dynamic Return URLs based on current location
    const appBaseUrl = window.location.origin + window.location.pathname;
    const returnUrl = `${appBaseUrl}#/payment/result?orderId=${order.id}`;
    const cancelUrl = `${appBaseUrl}#/orders/${order.id}`;

    // Construct signature string: merchant_id + order_id + amount + currency
    const signatureString = `${config.merchantId}${order.id}${amountStr}LYD`;
    const hash = await generateHash(signatureString, config.secretKey);

    const params: TlyncPaymentParams = {
        merchant_id: config.merchantId,
        store_id: config.storeId,
        order_id: order.id,
        amount: amountStr,
        currency: 'LYD',
        return_url: returnUrl,
        cancel_url: cancelUrl,
        customer_name: order.customerName,
        customer_phone: order.phone1,
        hash: hash 
    };

    // Create and submit hidden form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = baseUrl;

    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        }
    });

    document.body.appendChild(form);
    form.submit();
};