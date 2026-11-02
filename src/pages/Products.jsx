import { useEffect, useState } from "react";
import ProductList from "../components/ProductList";
import {
  getProducts,
  searchProducts,
  getCategories,          
  getProductsByCategory,  
  deleteProduct,
  updateProduct,
  createProduct,
} from "../services/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12; 
  const [editingId, setEditingId] = useState(null); 
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

async function loadCategories() {
  try {
    const data = await getCategories();
    setCategories(data);
  } catch (error) {
    setError(error.message);
  }
}

async function loadProducts(currentPage = 1) {
    try {
      setLoading(true);
      setError("");
      const data = await getProducts(limit, (currentPage - 1) * limit);
      setProducts(data.products);
      setTotal(data.total);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }

  }

  function handleNextPage() {
    if (page * limit < total) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage);
    }
  }

  function handlePrevPage() {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      loadProducts(prevPage);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      const data = await searchProducts(search);
      setProducts(data.products);
      setTotal(data.total);
      setPage(1);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleCreate(event) {
    event.preventDefault();

    try {
      const newProduct = await createProduct({
        ...form,
        price: Number(form.price),
      });

      setProducts((currentProducts) => [newProduct, ...currentProducts]);
      setForm({ title: "", price: "", description: "" });
      setError("");
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleCategory(event) {
    const selectedCategory = event.target.value;
    setCategory(selectedCategory);

    try {
      setLoading(true);
      setError("");
      setPage(1);
      if (selectedCategory === "") {
        await loadProducts(1);
        return;
      }

      const data = await getProductsByCategory(selectedCategory);
      setProducts(data.products);
      setTotal(data.total);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteProduct(id);
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id)
      );
      setError("");
    } catch (error) {
      setError(error.message);
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);
    setForm({
      title: product.title,
      price: product.price,
      description: product.description || "",
    });
  }
  async function handleUpdate(event) {
    event.preventDefault();

    try {
      const updated = await updateProduct(
        editingId,
        {
          ...form,
          price: Number(form.price),
        }
      );

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingId
            ? { ...product, ...updated }
            : product
        )
      );

      setEditingId(null);
      setForm({ title: "", price: "", description: "" });
      setError("");
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <section>
      <h1>Productos</h1>

      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>
      <select
        value={category}
        onChange={handleCategory}
      >
        <option value="">
          Todas las categorías
        </option>

        {categories.map((item) => {
          const value = item.slug ?? item;
          const label = item.name ?? item;

          return (
            <option
              key={value}
              value={value}
            >
              {label}
            </option>
          );
        })}
      </select>
      <form onSubmit={editingId ? handleUpdate : handleCreate} className="product-form">
        <input
          type="text"
          name="title"
          placeholder="Título"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={form.price}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
        />
        <button type="submit">
          {editingId ? "Actualizar" : "Guardar"}
        </button>
      </form>
      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      <div className="pagination-controls">
        <button onClick={handlePrevPage} disabled={page === 1}>
          Anterior
        </button>
        <span>
          Página {page} de {Math.ceil(total / limit) || 1}
        </span>
        <button onClick={handleNextPage} disabled={page * limit >= total}>
          Siguiente
        </button>
      </div>
    </section>
  );
}

export default Products;