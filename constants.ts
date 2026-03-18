
// This file can be used for application-wide constants.
export const LIBYAN_CITIES = [
    'أبارق', 'إبشادة', 'إجخرة', 'أجدابيا', 'إدري', 'إسبيعة', 'الأبيار', 'الأصابعة', 'البقرات', 'البردي', 'البريقة', 'البياضة', 'البيضاء', 'التميمي', 'الجغبوب', 'الجلاء', 'الجميل', 'الجوش', 'الجوف', 'الحرابة', 'الحرشة', 'الحشان', 'الخمس', 'الدافنية', 'الزاوية', 'الزنتان', 'السواني', 'الشقيقة', 'الشويرف', 'الصابري', 'الطينة', 'العامرية', 'العجيلات', 'العربان', 'العزيزية', 'العقيلة', 'العلالقة', 'العوينية', 'العيون', 'الفايدية', 'الفرناج', 'الفقهاء', 'القبة', 'القرضة', 'القرضة الشاطئ', 'القره بوللي', 'القريات', 'القريعة', 'القصيبة', 'القلعة', 'القواليش', 'الكفرة', 'الكريمية', 'الماية', 'المخيلي', 'المرج', 'المشاشية', 'المقرون', 'المعمورة', 'المطرد', 'النقازة', 'النعامة', 'الهيشة', 'الهيشة الجديدة', 'أم الأرانب', 'أم الرزم', 'أوباري', 'أوجلة', 'اولاد عطية', 'أولاد حضير', 'أولاد معرف', 'بئر الأشهب', 'بئر الغنم', 'بئر يعقوب', 'باطن الجبل', 'باكور', 'بدر', 'براك الشاطئ', 'برسس', 'بطة', 'بن جواد', 'بنغازي', 'بني وليد', 'بنينا', 'بوابة النهر الصناعي', 'بو عطني', 'بومريم', 'بوسليم', 'تاجوراء', 'تادولي', 'تاغرمين', 'تاكنس', 'تازربو', 'ترهونة', 'تغرنة', 'تكركيبة', 'تمزين', 'تمنهنت', 'تمسة', 'تهالة', 'توارغة', 'توكرة', 'تيجي', 'جادو', 'جالو', 'جرادس', 'جرمة', 'جنزور', 'الحمادة الحمراء', 'درنة', 'رأس لانوف', 'رقدالين', 'الرياينة', 'زاوية الباقول', 'زاوية العرقوب', 'زاوية المحجوب', 'زلة', 'زليتن', 'زوارة', 'سبها', 'سرت', 'سلوق', 'سوسة', 'سوق الجمعة', 'سوق الخميس', 'سوكنة', 'سيدي السائح', 'سيدي خليفة', 'شحات', 'صبراتة', 'صرمان', 'طبرق', 'طرابلس', 'طلميثة', 'غات', 'غدامس', 'غريان', 'غوط الشعال', 'قرجي', 'قصر الأخيار', 'قصر بن غشير', 'قيرة', 'قمينس', 'كاباو', 'كرسة', 'ككلة', 'ماجر', 'مرادة', 'مرزق', 'مصراتة', 'مسة', 'مسلاتة', 'مزدة', 'نالوت', 'هراوة', 'هون', 'وادي الربيع', 'وازن', 'ودان', 'يفرن'
];

export const SHOPPING_BRANDS = [
    { id: 'shein', name: 'SHEIN (شي ان)', isActive: true, defaultInternalShippingCost: 0 },
    { id: 'trendyol', name: 'Trendyol (ترينديول)', isActive: true, defaultInternalShippingCost: 0 },
    { id: 'nike', name: 'Nike (نايكي)', isActive: true, defaultInternalShippingCost: 0 },
    { id: 'adidas', name: 'Adidas (اديداس)', isActive: true, defaultInternalShippingCost: 0 },
    { id: 'puma', name: 'Puma (بوما)', isActive: true, defaultInternalShippingCost: 0 },
    { id: 'zara', name: 'Zara (زارا)', isActive: true, defaultInternalShippingCost: 0 },
    { id: 'h&m', name: 'H&M', isActive: true, defaultInternalShippingCost: 0 },
    { id: 'namshi', name: 'Namshi (نمشي)', isActive: true, defaultInternalShippingCost: 0 },
    { id: 'amazon', name: 'Amazon (أمازون)', isActive: true, defaultInternalShippingCost: 0 },
    { id: 'ali_express', name: 'AliExpress (علي اكسبرس)', isActive: true, defaultInternalShippingCost: 0 },
    { id: 'other', name: 'موقع آخر', isActive: true, defaultInternalShippingCost: 0 },
].sort((a,b) => a.name.localeCompare(b.name));

export const INITIAL_SHIPPING_ORIGINS = [
    { id: 'uae', name: 'الإمارات', ratePerKgUSD: 6.5, isActive: true, estimatedDeliveryTime: '10-15 يوم' },
    { id: 'china', name: 'الصين', ratePerKgUSD: 8.0, isActive: true, estimatedDeliveryTime: '20-30 يوم' },
    { id: 'usa', name: 'أمريكا', ratePerKgUSD: 12.0, isActive: true, estimatedDeliveryTime: '15-20 يوم' },
    { id: 'uk', name: 'المملكة المتحدة', ratePerKgUSD: 11.0, isActive: true, estimatedDeliveryTime: '15-20 يوم' },
    { id: 'turkey', name: 'تركيا', ratePerKgUSD: 7.0, isActive: true, estimatedDeliveryTime: '7-12 يوم' },
    { id: 'ksa', name: 'السعودية', ratePerKgUSD: 9.0, isActive: true, estimatedDeliveryTime: '10-15 يوم' },
    { id: 'canada', name: 'كندا', ratePerKgUSD: 13.0, isActive: true, estimatedDeliveryTime: '15-25 يوم' },
];

export const COST_CURRENCIES = [
    { code: 'USD', name: 'دولار أمريكي ($)', rateToUSD: 1 },
    { code: 'EUR', name: 'يورو (€)', rateToUSD: 1.08 },
    { code: 'GBP', name: 'جنيه استرليني (£)', rateToUSD: 1.27 },
    { code: 'AED', name: 'درهم إماراتي (د.إ)', rateToUSD: 0.272 },
    { code: 'SAR', name: 'ريال سعودي (ر.س)', rateToUSD: 0.266 },
    { code: 'TRY', name: 'ليرة تركية (₺)', rateToUSD: 0.031 }
];

import { ProductCategory } from './types';

export const CATEGORY_MAP: Record<string, { icon: string; label: string }> = {
    [ProductCategory.WomenClothing]: { icon: '👗', label: 'ملابس نسائية' },
    [ProductCategory.MenClothing]: { icon: '👔', label: 'ملابس رجالية' },
    [ProductCategory.KidsClothing]: { icon: '👧', label: 'ملابس أطفال' },
    [ProductCategory.BabyClothing]: { icon: '👶', label: 'ملابس رضع' },
    [ProductCategory.WomenShoes]: { icon: '👠', label: 'أحذية نسائية' },
    [ProductCategory.MenShoes]: { icon: '👞', label: 'أحذية رجالية' },
    [ProductCategory.KidsShoes]: { icon: '👟', label: 'أحذية أطفال' },
    [ProductCategory.Bags]: { icon: '👜', label: 'حقائب' },
    [ProductCategory.Accessories]: { icon: '💍', label: 'اكسسوارات' },
    [ProductCategory.Miscellaneous]: { icon: '✨', label: 'متنوعة' },
};

export const CATEGORY_SIZES: Record<string, string[]> = {
    [ProductCategory.WomenClothing]: [
        'One Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL',
        '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '56', '58'
    ],
    [ProductCategory.MenClothing]: [
        'One Size', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL', '6XL',
        '28', '29', '30', '31', '32', '33', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '56'
    ],
    [ProductCategory.KidsClothing]: [
        '2Y', '3Y', '4Y', '5Y', '6Y', '7Y', '8Y', '9Y', '10Y', '11Y', '12Y', '13Y', '14Y', '15Y', '16Y',
        '92', '98', '104', '110', '116', '122', '128', '134', '140', '146', '152', '158', '164', '170', '176'
    ],
    [ProductCategory.BabyClothing]: [
        'Newborn', '0-1M', '1-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M', '2-3Y', '3-4Y'
    ],
    [ProductCategory.WomenShoes]: [
        '35', '35.5', '36', '36.5', '37', '37.5', '38', '38.5', '39', '39.5', '40', '40.5', '41', '42', '43'
    ],
    [ProductCategory.MenShoes]: [
        '38', '39', '40', '40.5', '41', '41.5', '42', '42.5', '43', '43.5', '44', '44.5', '45', '46', '47', '48', '49', '50'
    ],
    [ProductCategory.KidsShoes]: [
        '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40'
    ],
    [ProductCategory.Bags]: ['Standard', 'Small', 'Medium', 'Large', 'Mini', 'XL'],
    [ProductCategory.Accessories]: ['Standard', 'S', 'M', 'L', 'One Size', 'Adjustable'],
    [ProductCategory.Miscellaneous]: ['Standard', 'One Size'],
};

export const CATEGORIES_WITHOUT_SIZES = [
    ProductCategory.Bags,
    ProductCategory.Accessories,
    ProductCategory.Miscellaneous
];
