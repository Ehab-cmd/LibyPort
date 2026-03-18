
import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';
import { 
    Globe, 
    Package, 
    Truck, 
    CheckCircle2, 
    Search, 
    ArrowRight, 
    Star, 
    ShieldCheck, 
    Zap, 
    CreditCard, 
    Smartphone, 
    QrCode, 
    Banknote,
    Users,
    Store,
    MapPin,
    ChevronLeft,
    ChevronRight,
    ShoppingBag,
    Calculator,
    Headphones
} from 'lucide-react';

// --- Icon Components (Removed unused) ---

// --- Cinematic Process Animation Component ---
const ProcessAnimation: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const durationPerStep = 6000;

    const steps = [
        {
            id: 1,
            title: "التسوق العالمي",
            desc: "اطلب من أمازون، شي إن، وأشهر الماركات العالمية. نحن نوفر لك العناوين ونقوم بالشراء.",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop", 
            icon: <Globe className="w-5 h-5 text-yellow-500" />
        },
        {
            id: 2,
            title: "الشحن اللوجستي",
            desc: "تجميع ذكي وشحن جوي سريع من مستودعاتنا في تركيا، الصين، وأمريكا إلى ليبيا.",
            image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=1920&auto=format&fit=crop", 
            icon: <Truck className="w-5 h-5 text-yellow-500" />
        },
        {
            id: 3,
            title: "الفرز والتجهيز",
            desc: "أنظمة فرز متطورة في مقرنا بطرابلس لضمان سلامة شحنتك وتجهيزها للاستلام.",
            image: "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1920&auto=format&fit=crop",
            icon: <Package className="w-5 h-5 text-yellow-500" />
        },
        {
            id: 4,
            title: "التسليم النهائي",
            desc: "استلم من مقرنا أو عبر خدمة التوصيل السريع لباب منزلك في كافة مدن ليبيا.",
            image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1920&auto=format&fit=crop",
            icon: <CheckCircle2 className="w-5 h-5 text-yellow-500" />
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, durationPerStep);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full h-[300px] md:h-[380px] relative rounded-2xl overflow-hidden shadow-xl bg-gray-900 group">
            {steps.map((step, index) => (
                <div 
                    key={step.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeStep ? 'opacity-100' : 'opacity-0'}`}
                >
                    <div 
                        className={`w-full h-full bg-cover bg-center transition-transform duration-[10000ms] ease-linear ${index === activeStep ? 'scale-110' : 'scale-100'}`}
                        style={{ backgroundImage: `url(${step.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                </div>
            ))}

        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-10">
                <div className="mb-6">
                    {steps.map((step, index) => (
                        <div 
                            key={step.id} 
                            className={`transition-all duration-700 absolute bottom-16 left-0 right-0 px-4 md:px-8 ${index === activeStep ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                        >
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-5 rounded-xl max-w-xl shadow-xl">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                                        {React.cloneElement(step.icon as React.ReactElement<any>, { className: 'w-4 h-4 text-yellow-500' })}
                                    </div>
                                    <h3 className="text-base md:text-lg font-bold text-white drop-shadow-md">{step.title}</h3>
                                </div>
                                <p className="text-gray-200 text-[10px] md:text-xs font-light leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 relative z-20">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden cursor-pointer" onClick={() => setActiveStep(index)}>
                            <div 
                                className={`h-full bg-yellow-500 rounded-full transition-all duration-300 ease-linear ${index === activeStep ? 'w-full' : index < activeStep ? 'w-full opacity-50' : 'w-0'}`}
                                style={{ transitionDuration: index === activeStep ? `${durationPerStep}ms` : '300ms' }}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="absolute top-6 right-6 z-20 bg-red-600/80 backdrop-blur-sm text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                LIVE TRACKING
            </div>
        </div>
    );
};

// --- Core Services Quick Access ---
const CoreServices: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const services = [
        { title: "تتبع الشحنات", icon: <Search className="w-4 h-4" />, path: "/track", color: "bg-blue-500" },
        { title: "حاسبة التكاليف", icon: <Calculator className="w-4 h-4" />, path: "/shipping-calculator", color: "bg-amber-500" },
        { title: "متجر LibyPort", icon: <Store className="w-4 h-4" />, path: "/instant-products", color: "bg-emerald-500" },
        { title: "تواصل معنا", icon: <Headphones className="w-4 h-4" />, path: "/contact-us", color: "bg-slate-800" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 max-w-[1600px] mx-auto px-4 md:px-6 relative z-30 -translate-y-4 md:-translate-y-6">
            {services.map((service, i) => (
                <button
                    key={i}
                    onClick={() => navigate(service.path)}
                    className="bg-white dark:bg-slate-800 p-3 md:p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all group"
                >
                    <div className={`${service.color} text-white p-1.5 rounded-lg shadow-inner group-hover:scale-110 transition-transform`}>
                        {React.cloneElement(service.icon as React.ReactElement<any>, { className: 'w-3.5 h-3.5' })}
                    </div>
                    <span className="font-black text-slate-900 dark:text-white text-[10px] md:text-xs tracking-tight">{service.title}</span>
                </button>
            ))}
        </div>
    );
};

// --- Featured Products Grid ---
const FeaturedProductsGrid: React.FC<{ products: Product[] }> = ({ products }) => {
    const navigate = ReactRouterDOM.useNavigate();

    if (products.length === 0) return null;

    const handleProductClick = (productId: number) => {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            sessionStorage.setItem('landing_scroll_pos', mainContent.scrollTop.toString());
        }
        navigate(`/products/${productId}`);
    };

    return (
        <section className="py-12 bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <div className="max-w-[1600px] mx-auto px-2 md:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-0.5 bg-yellow-500 rounded-full"></div>
                            <span className="text-yellow-600 font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em]">المتجر المحلي</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                            تسوق من متجر LibyPort
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-[10px] md:text-xs font-medium">أفضل المنتجات العالمية المتوفرة حالياً في مخازننا بطرابلس للتسليم الفوري.</p>
                    </div>
                    <ReactRouterDOM.Link to="/instant-products" className="group flex items-center gap-2 text-slate-900 dark:text-white font-black hover:text-yellow-600 transition-all bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-0.5 text-[10px] md:text-xs">
                        <span>استعراض كافة المنتجات</span>
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
                    </ReactRouterDOM.Link>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-6">
                    {products.map(product => (
                        <div 
                            key={product.id}
                            className="bg-white dark:bg-slate-800 rounded-[1rem] md:rounded-[1.5rem] shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border border-slate-100 dark:border-slate-700 overflow-hidden group cursor-pointer"
                            onClick={() => handleProductClick(product.id)}
                        >
                            <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-900">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" referrerPolicy="no-referrer" loading="lazy" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <Package className="w-6 h-6 opacity-20" />
                                    </div>
                                )}
                                
                                <div className="absolute top-1.5 right-1.5 md:top-3 md:right-3 z-10">
                                    <span className="bg-emerald-500 text-white text-[6px] md:text-[8px] font-black px-1.5 md:px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-0.5 md:gap-1 backdrop-blur-md bg-emerald-500/90">
                                        <span className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-white animate-pulse"></span>
                                        فوري
                                    </span>
                                </div>
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-2 md:p-4">
                                    <button className="w-full bg-white text-slate-900 py-1.5 md:py-2 rounded-lg font-black text-[8px] md:text-[10px] shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                        تفاصيل المنتج
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-2 md:p-4">
                                <p className="text-[6px] md:text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-0.5 md:mb-1 truncate">{product.category}</p>
                                <h3 className="font-black text-slate-900 dark:text-white text-[9px] md:text-sm mb-1.5 md:mb-2 truncate leading-tight group-hover:text-yellow-600 transition-colors">{product.name}</h3>
                                <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-slate-50 dark:border-slate-700/50">
                                    <p className="text-xs md:text-lg font-black text-yellow-600 font-mono leading-none">{product.price.toLocaleString()} <span className="text-[6px] md:text-[8px] font-bold text-slate-400">د.ل</span></p>
                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-slate-50 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300">
                                        <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- Testimonials Section ---
const TestimonialsSection: React.FC = () => {
    const reviews = [
        { name: "محمد الطرابلسي", role: "صاحب متجر إلكتروني", text: "خدمة ممتازة وسرعة في التوصيل. نظام تتبع الشحنات ساعدني كثيراً في كسب ثقة زبائني." },
        { name: "سارة علي", role: "زبونة", text: "تجربة تسوق رائعة، المنتجات وصلتني كما في الصورة تماماً والتغليف كان ممتاز." },
        { name: "شركة الأفق", role: "شريك تجاري", text: "LibyPort هو الشريك اللوجستي الأفضل الذي تعاملنا معه في ليبيا. دقة ومصداقية عالية." }
    ];

    return (
        <section className="py-16">
            <div className="text-center mb-12">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">شركاء النجاح</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium text-sm md:text-base">ثقة عملائنا هي المحرك الأساسي لنمونا وتطورنا المستمر.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-[1600px] mx-auto px-6">
                {reviews.map((review, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-700 relative group">
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-lg flex items-center justify-center text-slate-950 shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                            <Star className="w-3 h-3 fill-current" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 italic mb-4 relative z-10 text-xs md:text-sm leading-relaxed">"{review.text}"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center font-black text-slate-400 text-xs">
                                {review.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white text-xs md:text-sm">{review.name}</h4>
                                <p className="text-[9px] text-yellow-600 font-bold uppercase tracking-widest">{review.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};


// --- Trust & Security Section ---
const TrustSecuritySection: React.FC = () => {
    const features = [
        { title: 'حماية البيانات', desc: 'تشفير SSL متطور لحماية كافة بياناتك ومعاملاتك المالية.', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> },
        { title: 'ترخيص رسمي', desc: 'شركة مسجلة رسمياً لدى وزارة الاقتصاد والصناعة الليبية.', icon: <CheckCircle2 className="w-4 h-4 text-blue-500" /> },
        { title: 'تأمين الشحنات', desc: 'تأمين شامل ضد الفقدان أو التلف لكافة الشحنات الدولية.', icon: <Zap className="w-4 h-4 text-yellow-500" /> },
        { title: 'دعم فني 24/7', desc: 'فريق متخصص لمساعدتك في كافة مراحل الشراء والشحن.', icon: <Headphones className="w-4 h-4 text-indigo-500" /> },
    ];

    return (
        <section className="py-8 md:py-12 bg-slate-900 text-white rounded-[1.25rem] md:rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="max-w-[1600px] mx-auto px-5 md:px-8 relative z-10">
                <div className="text-center mb-6 md:mb-10">
                    <h2 className="text-lg md:text-2xl font-black tracking-tight mb-2 md:mb-3">لماذا يثق بنا آلاف العملاء؟</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-[9px] md:text-sm">نحن نلتزم بأعلى معايير الجودة والأمان لضمان تجربة تسوق وشحن عالمية لا مثيل لها في ليبيا.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-sm p-3.5 md:p-5 rounded-lg md:rounded-xl border border-white/10 hover:border-yellow-500/50 transition-all group">
                            <div className="mb-2 transform group-hover:scale-110 transition-transform">{f.icon}</div>
                            <h3 className="text-xs md:text-base font-black mb-1 md:mb-1.5">{f.title}</h3>
                            <p className="text-slate-400 text-[8px] md:text-xs leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- Latest News / Updates ---
const LatestNewsSection: React.FC = () => {
    const news = [
        { date: '15 مارس 2025', title: 'افتتاح مستودعنا الجديد في مدينة دبي', desc: 'توسعة استراتيجية لتعزيز سرعة الشحن من منطقة الخليج العربي إلى ليبيا.' },
        { date: '10 مارس 2025', title: 'تحديث أنظمة التتبع الذكية', desc: 'إطلاق النسخة الجديدة من نظام التتبع لتوفير دقة أعلى في تحديد موقع الشحنات.' },
        { date: '05 مارس 2025', title: 'شراكة جديدة مع مصرف التجارة والتنمية', desc: 'توفير خيارات دفع إلكترونية جديدة وحصرية لعملاء LibyPort.' },
    ];

    return (
        <section className="py-16">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-0.5 bg-yellow-500 rounded-full"></div>
                        <span className="text-yellow-600 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">المركز الإعلامي</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">آخر الأخبار والتحديثات</h2>
                </div>
                <ReactRouterDOM.Link to="/news" className="text-yellow-600 font-black text-xs hover:underline">عرض كافة الأخبار</ReactRouterDOM.Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                {news.map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all group">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 block">{item.date}</span>
                        <h3 className="font-black text-slate-900 dark:text-white text-sm mb-2 group-hover:text-yellow-600 transition-colors">{item.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

const LandingPage: React.FC = () => {
  const { isSalePeriodActive, landingImages, saleLandingImages, products } = useAppContext();
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = ReactRouterDOM.useNavigate();
  const [trackingNumber, setTrackingNumber] = useState('');

  React.useLayoutEffect(() => {
    const savedScrollPos = sessionStorage.getItem('landing_scroll_pos');
    if (savedScrollPos && products.length > 0) {
        const top = parseInt(savedScrollPos);
        const mainContent = document.getElementById('main-content');
        
        if (mainContent) {
            const attemptScroll = () => {
                if (mainContent) {
                    mainContent.scrollTo({ top, behavior: 'instant' });
                }
            };

            // محاولات متعددة لضمان استقرار التمرير بعد رندر العناصر وتحميل الصور
            attemptScroll();
            const t1 = setTimeout(attemptScroll, 50);
            const t2 = setTimeout(attemptScroll, 150);
            const t3 = setTimeout(() => {
                attemptScroll();
                sessionStorage.removeItem('landing_scroll_pos');
            }, 400);

            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
            };
        }
    }
  }, [products.length]);

  const marqueeStyle = `
    @keyframes scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee {
      display: flex;
      animation: scroll 30s linear infinite;
    }
    .animate-marquee:hover {
      animation-play-state: paused;
    }
  `;

  const featuredProducts = useMemo(() => {
      return products
        .filter(p => p && p.isInstant && !p.isDeleted && p.stock > 0)
        .sort((a, b) => b.id - a.id) 
        .slice(0, 15); // Show top 15 featured products in the grid
  }, [products]);

  const images = useMemo(() => {
    const activeImages = isSalePeriodActive ? saleLandingImages : landingImages;
    return activeImages.length > 0 ? activeImages : ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop'];
  }, [isSalePeriodActive, landingImages, saleLandingImages]);

  const sliderContent = useMemo(() => {
      if (isSalePeriodActive) {
          return Array(images.length).fill({
              title: "تخفيضات الجمعة البيضاء!",
              description: "استفد من أقوى العروض والخصومات على الشحن والمنتجات."
          });
      }
      return [
          {
              title: "تسوق عالمياً.. استلم محلياً",
              description: "بوابتك الموثوقة للشراء من أشهر المواقع العالمية وتوصيلها حتى باب منزلك في ليبيا بأقل التكاليف."
          },
          {
              title: "استلام وتخزين آمن",
              description: "مستودعات متطورة لاستقبال، فرز، وتجميع شحناتك قبل توصيلها إليك بأعلى معايير الأمان."
          },
          {
              title: "شريك النجاح للمتاجر",
              description: "انضم إلينا اليوم! نقدم حلولاً لوجستية متكاملة مصممة خصيصاً لرواد الأعمال وأصحاب المتاجر."
          }
      ];
  }, [isSalePeriodActive, images.length]);

  useEffect(() => {
    setCurrentImage(0);
  }, [images]);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setTimeout(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentImage, images]);

  const handleTrackShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
        navigate(`/track/${encodeURIComponent(trackingNumber.trim())}`);
    }
  };

  const currentContent = sliderContent[currentImage] || sliderContent[0];

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100" dir="rtl">
      <style>{marqueeStyle}</style>
      
      {/* Hero Slider */}
      <section className="relative h-[45vh] md:h-[70vh] overflow-hidden">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity ease-in-out duration-1000 ${index === currentImage ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-transparent flex items-center justify-start p-6 md:px-20">
          <div className="max-w-2xl transform transition-all duration-700 translate-y-0 text-right pt-6 md:pt-0">
            <div className="flex items-center gap-2 mb-4 animate-fade-in">
                <div className="w-8 h-0.5 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-500 font-black text-[10px] md:text-xs uppercase tracking-[0.3em]">بوابتك للتسوق العالمي</span>
            </div>
            <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-white mb-3 md:mb-4 drop-shadow-2xl leading-[1.1] tracking-tighter">
              {currentContent.title}
            </h2>
            <p className="text-[10px] md:text-sm lg:text-base text-slate-300 mb-5 md:mb-8 font-medium leading-relaxed drop-shadow-lg max-w-lg">
              {currentContent.description}
            </p>
            
            <div className="flex items-stretch gap-2 w-full max-w-2xl">
                <form onSubmit={handleTrackShipment} className="bg-white/10 backdrop-blur-xl p-1 rounded-xl flex gap-1.5 border border-white/20 flex-grow shadow-2xl group focus-within:border-yellow-500/50 transition-all">
                    <div className="flex items-center justify-center px-2 md:px-3 text-white/50 group-focus-within:text-yellow-500 transition-colors">
                        <Search className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="رقم التتبع..."
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="flex-grow bg-transparent text-white placeholder-white/40 px-1 focus:outline-none font-bold text-[9px] md:text-sm min-w-0"
                    />
                    <button 
                        type="submit"
                        className="bg-yellow-500 text-slate-950 px-3 md:px-6 py-1.5 md:py-2.5 rounded-lg font-black text-[9px] md:text-xs hover:bg-yellow-400 transition-all shadow-lg active:scale-95 whitespace-nowrap flex items-center gap-1"
                    >
                        <span>تتبع</span>
                        <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </button>
                </form>
                <button 
                    onClick={() => navigate('/shipping-calculator')}
                    className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 md:px-5 py-2 md:py-3 rounded-xl font-black text-[9px] md:text-xs hover:bg-white/20 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xl"
                >
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span className="hidden sm:inline">حاسبة الشحن</span>
                    <span className="sm:hidden text-[8px]">الحاسبة</span>
                </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-20">
            {images.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`h-1 rounded-full transition-all duration-500 ${index === currentImage ? 'bg-yellow-500 w-12' : 'bg-white/20 w-4 hover:bg-white/40'}`}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>
      </section>
      
      <main className="max-w-[1600px] mx-auto py-12 px-4 md:px-6 space-y-16">
        <CoreServices />

        {/* Featured Products Grid - Moved Up for Store Front Feel */}
        <FeaturedProductsGrid products={featuredProducts} />

        {/* Work Cycle Section - Moved Above About Us and Reduced Size */}
        <section className="max-w-[1600px] mx-auto px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-base md:text-lg font-black mb-2 text-gray-800 dark:text-gray-100 tracking-tight">دورة العمل في LibyPort</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-[9px] md:text-[10px] max-w-xl mx-auto font-medium">
                        من المتجر العالمي إلى باب منزلك، رحلة شحنتك معنا مؤمنة بالكامل.
                    </p>
                </div>
                <div className="w-full mb-6 md:mb-8">
                    <ProcessAnimation />
                </div>
            </div>
        </section>

        <section className="py-10 bg-white dark:bg-slate-800 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="max-w-[1600px] mx-auto px-4 md:px-12">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-0.5 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-600 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">من نحن ومجال عملنا</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
                  بوابة طرابلس العالمية (LibyPort)
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium leading-relaxed mb-6">
                  تأسست LibyPort لتكون الجسر اللوجستي المتكامل الذي يربط السوق الليبي بالعالم. نحن متخصصون في تقديم حلول التجارة الإلكترونية الشاملة، من توفير عناوين شحن دولية في (الصين، تركيا، أمريكا) إلى خدمات الشراء بالنيابة والتوصيل المحلي السريع، مع ضمان الأمان والسرعة في كافة مراحل العملية. نحن نفخر بكوننا الخيار الأول لآلاف المتسوقين والشركات في ليبيا.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] md:text-xs font-black text-slate-700 dark:text-white">تأمين شامل وموثوق</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] md:text-xs font-black text-slate-700 dark:text-white">شحن جوي أسبوعي منتظم</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-2 md:gap-3 w-full">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-yellow-500 transition-colors">
                  <Truck className="w-5 h-5 text-yellow-500 mb-2" />
                  <h3 className="text-xs md:text-sm font-black mb-1 text-slate-900 dark:text-white">شحن دولي ومحلي</h3>
                  <p className="text-[9px] md:text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">تغطية شاملة من أهم الأسواق العالمية إلى كافة المدن الليبية بأسعار تنافسية وجداول زمنية دقيقة.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-blue-600 transition-colors">
                  <ShoppingBag className="w-5 h-5 text-blue-600 mb-2" />
                  <h3 className="text-xs md:text-sm font-black mb-1 text-slate-900 dark:text-white">حلول دفع وتسوق</h3>
                  <p className="text-[9px] md:text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">خدمات الشراء بالنيابة عنك وتوفير طرق دفع محلية آمنة لتسهيل تجارتك وتوسيع آفاقك.</p>
                </div>
              </div>
            </div>
          </div>
        </section>


        <TrustSecuritySection />

        <section className="py-20 relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-800">
            <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
                    <path d="M150,250 Q400,100 850,250" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10,10" />
                    <path d="M150,250 Q400,400 850,250" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10,10" />
                    <path d="M150,250 L400,150 L600,350 L850,250" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5,5" />
                    <circle cx="150" cy="250" r="6" fill="#f59e0b" className="animate-pulse" />
                    <circle cx="850" cy="250" r="6" fill="#f59e0b" className="animate-pulse" />
                    <circle cx="400" cy="150" r="4" fill="#3b82f6" />
                    <circle cx="600" cy="350" r="4" fill="#3b82f6" />
                </svg>
            </div>
            <div className="max-w-[1600px] mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-0.5 bg-yellow-500 rounded-full"></div>
                            <span className="text-yellow-600 font-black text-xs uppercase tracking-[0.2em]">شبكتنا العالمية اللوجستية</span>
                        </div>
                        <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter leading-tight">
                            نربط التجارة الليبية <br /> بأهم الأسواق العالمية
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium leading-relaxed mb-6">
                            من خلال مستودعاتنا الاستراتيجية في أهم المراكز التجارية العالمية، نضمن لك وصولاً سريعاً ومؤمناً لكافة مشترياتك. نحن لا نشحن البضائع فحسب، بل نبني جسور الثقة بينك وبين العالم.
                        </p>
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            {[
                                { city: 'اسطنبول', country: 'تركيا', status: 'مستودع رئيسي', icon: <MapPin className="w-4 h-4" /> },
                                { city: 'قوانغتشو', country: 'الصين', status: 'مركز تجميع', icon: <MapPin className="w-4 h-4" /> },
                                { city: 'دبي', country: 'الإمارات', status: 'نقطة ترانزيت', icon: <MapPin className="w-4 h-4" /> },
                                { city: 'نيويورك', country: 'أمريكا', status: 'مستودع فرعي', icon: <MapPin className="w-4 h-4" /> },
                            ].map((loc, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-1.5 rounded-lg">{loc.icon}</div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white text-xs md:text-sm">{loc.city}</p>
                                        <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest leading-none">{loc.country}</p>
                                        <span className="text-[7px] text-emerald-500 font-black mt-0.5 block">{loc.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-br from-yellow-500/20 to-blue-500/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop" 
                            alt="Global Logistics Network" 
                            className="relative z-10 rounded-[3rem] shadow-2xl border border-white/20 transform group-hover:scale-[1.02] transition-transform duration-700"
                            referrerPolicy="no-referrer"
                        />
                        <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-20 hidden xl:block animate-bounce-slow">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shadow-inner">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-white text-xs">شحن جوي يومي</p>
                                    <p className="text-slate-400 text-[9px] font-bold">أسرع خدمة توصيل في ليبيا</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <LatestNewsSection />

        <TestimonialsSection />

        <section className="bg-slate-950 text-white p-4 md:p-8 rounded-[1rem] md:rounded-[1.5rem] text-center shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-500/10 via-transparent to-blue-500/10"></div>
          <div className="relative z-10">
              <h2 className="text-base md:text-lg font-black mb-2 md:mb-3 tracking-tighter leading-tight">هل أنت مستعد لتوسيع آفاق تجارتك؟</h2>
              <p className="max-w-lg mx-auto text-[9px] md:text-xs mb-4 md:mb-6 text-slate-400 font-medium leading-relaxed">
                انضم إلى آلاف التجار الذين يعتمدون على LibyPort كشريك لوجستي موثوق. تواصل مع الإدارة عبر الواتساب لفتح حساب متجرك والبدء فوراً.
              </p>
              <a 
                href={`https://wa.me/218944400399?text=${encodeURIComponent("طلبت فتح حساب لديكم من اجل العمل في مجال التجارة الاكترونية")}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 bg-yellow-500 text-slate-950 px-4 md:px-6 py-1.5 md:py-2 rounded-lg font-black text-[10px] md:text-xs hover:bg-yellow-400 transition-all shadow-xl hover:shadow-yellow-500/10 transform hover:-translate-y-0.5 active:scale-95"
              >
                <span>تواصل معنا عبر الواتساب</span>
                <ArrowRight className="w-3 h-3 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
              </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
