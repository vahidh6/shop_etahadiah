import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaShoppingCart } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={product.image || '/images/placeholder.png'} 
          alt={product.name}
        />
        {product.discount && (
          <span className="discount-badge">{product.discount}% تخفیف</span>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-title">
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h3>
        
        <div className="product-category">
          <span>{product.category}</span>
        </div>
        
        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <FaStar 
              key={i} 
              className={i < Math.floor(product.rating || 0) ? 'star-filled' : 'star-empty'}
            />
          ))}
          <span>({product.reviews?.length || 0})</span>
        </div>
        
        <div className="product-price">
          {product.discount ? (
            <>
              <span className="price-old">${product.price}</span>
              <span className="price-new">
                ${(product.price * (100 - product.discount) / 100).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="price-current">${product.price}</span>
          )}
        </div>
        
        <div className="product-actions">
          <button className="btn-add-to-cart">
            <FaShoppingCart /> افزودن به سبد
          </button>
          <Link to={`/products/${product._id}`} className="btn-view-details">
            مشاهده جزئیات
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;