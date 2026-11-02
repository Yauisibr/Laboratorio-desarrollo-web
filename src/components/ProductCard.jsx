import { Link } from "react-router-dom";

function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="product-card">
      <img src={product.thumbnail} alt={product.title} />
      <h3>{product.title}</h3>
      <p>{product.category}</p>
      <p>${product.price}</p>
      
      {/* Enlace al detalle del producto */}
      <Link to={`/products/${product.id}`}>Ver detalle</Link>
      
      <button onClick={() => onEdit(product)}>Editar</button>
      <button onClick={() => onDelete(product.id)}>Eliminar</button>
    </div>
  );
}

export default ProductCard;