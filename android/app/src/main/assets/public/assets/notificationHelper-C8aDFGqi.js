const c=(e,t)=>{const s=t.find(a=>a.id===e.storeId),n=s?s.name:"متجرنا",o=e.total.toLocaleString(),g=e.items.map(a=>`${a.name} (الكمية: ${a.quantity})`).join(" - "),p=`أهلاً بك! معك شركة بوابة طرابلس العالمية (LibyPort).
طلبك من متجر ${n} بقيمة ${o} د.ل جاهز للتوصيل الآن.
محتويات الطلب: ${g}
سيقوم مندوب شركة التوصيل بالتواصل معك قريباً لتسليم الطلب.
شكراً لتعاملك معنا!`,m=e.phone1.replace(/\s+/g,"").replace("+","");return{message:p,phone:m}},r=(e,t)=>{const{message:s,phone:n}=c(e,t),o=encodeURIComponent(s);return`https://wa.me/${n}?text=${o}`},$=(e,t)=>{const{message:s,phone:n}=c(e,t),o=encodeURIComponent(s);return`sms:${n}?body=${o}`};export{$ as a,r as g};
