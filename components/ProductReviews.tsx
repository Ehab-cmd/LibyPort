
import React, { useState } from 'react';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';

const StarIcon: React.FC<{ filled: boolean; onClick?: () => void }> = ({ filled, onClick }) => (
    <svg 
        onClick={onClick}
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 ${onClick ? 'cursor-pointer' : ''} ${filled ? 'text-yellow-400' : 'text-gray-300'}`} 
        viewBox="0 0 20 20" 
        fill="currentColor"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

import { useNotification } from '../context/NotificationContext';

interface ProductReviewsProps {
    product: Product;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ product }) => {
    const { addReview, currentUser } = useAppContext();
    const { showToast } = useNotification();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            showToast('الرجاء اختيار تقييم.', 'error');
            return;
        }
        setIsSubmitting(true);
        await addReview(product.id, rating, comment);
        setIsSubmitting(false);
        setRating(0);
        setComment('');
    };

    const reviews = product.reviews || [];
    const averageRating = product.averageRating || 0;

    return (
        <div className="mt-12 border-t dark:border-gray-700 pt-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">التقييمات والمراجعات</h3>
            
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl text-center">
                        <div className="text-5xl font-bold text-gray-800 dark:text-white mb-2">{averageRating.toFixed(1)}</div>
                        <div className="flex justify-center mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon key={star} filled={star <= Math.round(averageRating)} />
                            ))}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">بناءً على {reviews.length} مراجعة</p>
                    </div>

                    {currentUser && (
                        <form onSubmit={handleSubmit} className="mt-6">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">أضف تقييمك</h4>
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <StarIcon 
                                        key={star} 
                                        filled={star <= rating} 
                                        onClick={() => setRating(star)} 
                                    />
                                ))}
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="اكتب تعليقك هنا..."
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500 mb-3"
                                rows={3}
                                required
                            ></textarea>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-yellow-500 text-white py-2 rounded-lg font-bold hover:bg-yellow-600 disabled:opacity-50"
                            >
                                {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="md:col-span-2 space-y-4">
                    {reviews.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-10">لا توجد مراجعات بعد. كن أول من يقيم هذا المنتج!</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-100">{review.userName}</p>
                                        <div className="flex gap-0.5 mt-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <StarIcon key={star} filled={star <= review.rating} />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.date).toLocaleDateString('ar-LY')}</span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductReviews;
