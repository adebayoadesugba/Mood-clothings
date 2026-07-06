import React, { useEffect, useState } from 'react';
import { fetchAllProducts } from '../api';
import { ProductCard } from './ProductCard';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetchAllProducts();
        
        const formattedProducts = response.data.data.map((p) => ({
          ...p,
          id: p._id, 
          badge: p.tags && p.tags.length > 0 ? p.tags[0] : null, 
          colors: p.colors && p.colors.length > 0 ? p.colors : ['#000000'] 
        }));
        
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Database catalog synchronization error:', err);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-[11px] uppercase tracking-widest text-muted-foreground animate-pulse">
        Loading premium collection...
      </div>
    );
  }

  return (
    /* 
      This wrapper matches your theme layout completely:
      - grid-cols-2: Forces exactly 2 cards per row on mobile screens
      - md:grid-cols-3: Transitions smoothly to 3 columns on tablets
      - lg:grid-cols-4: Snaps to exactly 4 items per row on desktop screens
    */
    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductCatalog;