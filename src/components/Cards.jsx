import React, { useContext, useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthProvider";
import Swal from 'sweetalert2';
import useCart from "../hooks/useCart";
import axios from 'axios';

const Cards = ({ item }) => {
  const { name, image, price, recipe, _id } = item;
  const { user } = useContext(AuthContext);
  const [cart, refetch] = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHeartFilled, setIsHeartFilled] = useState(false);

  // Load heart state from local storage
  useEffect(() => {
    const savedState = localStorage.getItem(`heart-${_id}`);
    if (savedState) {
      setIsHeartFilled(JSON.parse(savedState));
    }
  }, [_id]);

  // Handle heart click
  const handleHeartClick = () => {
    const newHeartState = !isHeartFilled;
    setIsHeartFilled(newHeartState);
    localStorage.setItem(`heart-${_id}`, JSON.stringify(newHeartState));
  };

  // Add to cart handler
  const handleAddToCart = (item) => {
    if (user && user.email) {
      const cartItem = { menuItemId: _id, name, quantity: 1, image, price, email: user.email };

      axios.post('http://localhost:5000/carts', cartItem)
        .then((response) => {
          if (response) {
            refetch(); // refetch cart
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Food added to the cart.',
              showConfirmButton: false,
              timer: 1500
            });
          }
        })
        .catch((error) => {
          const errorMessage = error.response.data.message;
          Swal.fire({
            position: 'center',
            icon: 'warning',
            title: `${errorMessage}`,
            showConfirmButton: false,
            timer: 1500
          });
        });
    } else {
      Swal.fire({
        title: 'Please login to order the food',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Login now!'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login', { state: { from: location } });
        }
      });
    }
  };

  return (
    <div className="card shadow-xl relative mr-5 md:my-5">
      {/* Heart icon for like functionality */}
      <div
        className={`absolute right-4 top-4 p-2 rounded-full bg-white shadow-md z-30 ${isHeartFilled ? "text-rose-500" : "text-gray-400"}`}
        onClick={handleHeartClick}
        style={{ cursor: 'pointer' }}
      >
        <FaHeart className="w-6 h-6" />
      </div>

      <Link to={`/menu/${item._id}`}>
        <figure className="relative">
          <img
            src={image}
            alt={name}
            className="w-full object-cover md:h-48 relative z-10 rounded-t-xl"
          />
          {/* Bottom to top gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-20 rounded-t-xl"></div>
        </figure>
      </Link>

      <div className="card-body relative z-30">
        <Link to={`/menu/${item._id}`}>
          <h2 className="card-title">{name}</h2>
        </Link>
        <p className="truncate-description">{recipe}</p>
        <div className="card-actions justify-between items-center mt-2">
          <h5 className="font-semibold">
            <span className="text-sm text-red">₹ </span> {price}
          </h5>
          <button onClick={() => handleAddToCart(item)} className="btn bg-green text-white">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default Cards;
