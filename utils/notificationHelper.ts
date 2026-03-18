
import { Order, Store } from '../types';

const getMessageData = (order: Order, stores: Store[]) => {
    const store = stores.find(s => s.id === order.storeId);
    const storeName = store ? store.name : 'متجرنا';
    const total = order.total.toLocaleString();
    
    // Create items description
    const itemsDesc = order.items.map(item => `${item.name} (الكمية: ${item.quantity})`).join(' - ');
    
    const message = `أهلاً بك! معك شركة بوابة طرابلس العالمية (LibyPort).
طلبك من متجر ${storeName} بقيمة ${total} د.ل جاهز للتوصيل الآن.
محتويات الطلب: ${itemsDesc}
سيقوم مندوب شركة التوصيل بالتواصل معك قريباً لتسليم الطلب.
شكراً لتعاملك معنا!`;
    
    const phone = order.phone1.replace(/\s+/g, '').replace('+', '');
    return { message, phone };
};

export const generateWhatsAppMessage = (order: Order, stores: Store[]) => {
    const { message, phone } = getMessageData(order, stores);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
};

export const generateSMSMessage = (order: Order, stores: Store[]) => {
    const { message, phone } = getMessageData(order, stores);
    const encodedMessage = encodeURIComponent(message);
    // Use ?body= for Android/Standard, but iOS sometimes prefers &body=
    // sms:phone?body=message is the most compatible standard
    return `sms:${phone}?body=${encodedMessage}`;
};
