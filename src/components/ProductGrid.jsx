import { Card, Badge } from 'flowbite-react';
import { FaShoppingCart } from 'react-icons/fa';
import PropTypes from 'prop-types';

const ProductGrid = ({ products, onAddToCart }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-white border-none">
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
            />
            
          { product.category  != ''  ? <Badge color="blue" className="absolute top-2 right-2">
              {product.category || ''}
            </Badge> : ''}
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">{product.name}</h3>
            <p className="text-sm mb-3 text-gray-600">Sisa stok: {product.stock}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-blue-600 mr-1">
                Rp {product.price.toLocaleString()}
              </span>
              <button
                onClick={() => onAddToCart(product)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-1 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                <FaShoppingCart />
                <span className="hidden sm:inline text-xs px-1">Add to Cart</span>
              </button>
            </div>
          </div> 
        </Card>
      ))}
    </div>
  );
};

ProductGrid.propTypes = {
  products: PropTypes.array.isRequired,
  onAddToCart: PropTypes.func.isRequired
};

export default ProductGrid;