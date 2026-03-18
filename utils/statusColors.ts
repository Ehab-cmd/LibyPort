import { DeliveryTrackingStatus } from '../types';

export const getDeliveryStatusColor = (status: DeliveryTrackingStatus) => {
    switch (status) {
        case DeliveryTrackingStatus.Delivered:
            return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200";
        case DeliveryTrackingStatus.ReturnedToCompany:
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200";
        case DeliveryTrackingStatus.Returned:
            return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200";
        case DeliveryTrackingStatus.Arrived:
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200";
        case DeliveryTrackingStatus.InternationalShipping:
            return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200";
        case DeliveryTrackingStatus.LocalShipping:
            return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200";
        case DeliveryTrackingStatus.Pending:
            return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200";
        default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200";
    }
};

export const getDeliveryStatusSelectColor = (status: DeliveryTrackingStatus) => {
    switch (status) {
        case DeliveryTrackingStatus.Delivered:
            return "bg-green-600 text-white border-green-700";
        case DeliveryTrackingStatus.ReturnedToCompany:
            return "bg-amber-500 text-white border-amber-600";
        case DeliveryTrackingStatus.Returned:
            return "bg-red-600 text-white border-red-700";
        case DeliveryTrackingStatus.Arrived:
            return "bg-blue-600 text-white border-blue-700";
        case DeliveryTrackingStatus.InternationalShipping:
            return "bg-indigo-600 text-white border-indigo-700";
        case DeliveryTrackingStatus.LocalShipping:
            return "bg-purple-600 text-white border-purple-700";
        case DeliveryTrackingStatus.Pending:
            return "bg-gray-500 text-white border-gray-600";
        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};
