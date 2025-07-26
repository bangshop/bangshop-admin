// admin/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Using Axios for file uploads

// Updated Product Form Component
const ProductForm = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !imageFile) {
      alert("Please fill all fields and select an image.");
      return;
    }
    setIsSubmitting(true);
    setStatusMessage('Uploading image...');

    try {
      // Step 1: Upload the image file to our server
      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadResponse = await axios.post(
        'https://bangshop.onrender.com/api/upload', // Your live server URL
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      const { imageUrl } = uploadResponse.data;
      setStatusMessage('Image uploaded! Saving product...');

      // Step 2: Save the product data with the new Cloudinary URL
      const newProduct = { name, price: parseFloat(price), description, imageUrl };
      
      await fetch('https://bangshop.onrender.com/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      
      setStatusMessage('Product added successfully!');
      setName('');
      setPrice('');
      setDescription('');
      setImageFile(null);
      e.target.reset();
      
      setTimeout(() => setStatusMessage(''), 3000);

    } catch (err) {
      console.error("Error adding product: ", err);
      setStatusMessage('Failed to add product.');
      setTimeout(() => setStatusMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h3>Add New Product</h3>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" required />
      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" required />
      
      <label htmlFor="image-upload">Product Image:</label>
      <input 
        id="image-upload" 
        type="file" 
        accept="image/*" 
        onChange={(e) => setImageFile(e.target.files[0])} 
        required 
      />
      
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description"></textarea>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Add Product'}
      </button>
      {statusMessage && <p>{statusMessage}</p>}
    </form>
  );
};


// Main Dashboard Page (No changes needed here)
const DashboardPage = () => {
      const navigate = useNavigate();
      const [user, setUser] = useState(null);
      const [orders, setOrders] = useState([]);

      useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
          } else {
            navigate('/login');
          }
        });
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

      if (!user) return <div>Loading...</div>;

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
                    <ul>{order.items.map(item => <li key={item.id}>{item.name} (x{item.quantity})</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      );
};
export default DashboardPage;