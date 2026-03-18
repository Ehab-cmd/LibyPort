
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

export interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
    return (
        <nav className={`flex text-[11px] md:text-xs text-gray-400 dark:text-gray-500 mb-6 font-bold ${className}`} aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-2 space-x-reverse">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={index} className="inline-flex items-center">
                            {index > 0 && (
                                <span className="mx-2 text-gray-300 dark:text-gray-700 font-normal">/</span>
                            )}
                            {item.path && !isLast ? (
                                <ReactRouterDOM.Link 
                                    to={item.path} 
                                    className="inline-flex items-center hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors"
                                >
                                    {item.label}
                                </ReactRouterDOM.Link>
                            ) : (
                                <span className={`${isLast ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
