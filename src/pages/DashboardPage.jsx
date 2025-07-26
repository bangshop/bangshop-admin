// admin/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// Product Form Component
const ProductForm = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !imageUrl) {
        alert("Please fill in all fields.");
        return;
    }
    const newProduct = { name, price: parseFloat(price), description, imageUrl };
    try {
        // Use our backend API to add the product
        await fetch('https://bangshop.onrender.com/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });
        // Reset form
        setName(''); setPrice(''); setDescription(''); setImageUrl('');
    } catch(err) {
        console.error("Error adding product: ", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h3>Add New Product</h3>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" required/>
      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" required/>
      <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" required/>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description"></textarea>
      <button type="submit">Add Product</button>
    </form>
  );
};

// Main Dashboard Page
const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Auth observer
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
    });

    // Firestore listener for orders
    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);
    });

    return () => {
        unsubscribeAuth();
        unsubscribeOrders();
    };
  }, [navigate]);


  const handleLogout = () => {
    signOut(auth);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <main className="dashboard-main">
        <div className="dashboard-section">
          <ProductForm />
        </div>
        <div className="dashboard-section">
          <h2>New Orders</h2>
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <ul>
                    {order.items.map(item => <li key={item.id}>{item.name} (x{item.quantity})</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;