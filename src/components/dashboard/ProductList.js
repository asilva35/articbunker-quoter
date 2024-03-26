import React from 'react';
import ProductCard from '@/components/dashboard/ProductCard';
import styles from '@/styles/ProductList.module.css';
import { CircularProgress } from '@nextui-org/react';

export default function ProductList({ theme, products, isLoading }) {
  return (
    <div className={`${styles.ProductList}`}>
      {isLoading ? (
        <div className={`${styles.loading}`}>
          <CircularProgress size="sm" aria-label="Loading..." />
        </div>
      ) : (
        products.map((product) => (
          <div key={product.id} className={`${styles.ProductCard}`}>
            <ProductCard product={product} theme={theme} />
          </div>
        ))
      )}
    </div>
  );
}
