import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useEffect, useState } from 'react';
import { FaPaypal } from 'react-icons/fa';
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";''
import { useNavigate } from 'react-router-dom';
import { useTheme } from "../../hooks/ThemeContext";

const CheckoutForm = ({ price, cart }) => {
    const { isDarkMode } = useTheme();
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setcardError] = useState('');
  const [clientSecret, setClientSecret] = useState("");

  const axiosSecure = useAxiosSecure();
  const {user} = useAuth();
  const navigate = useNavigate();

  // console.log(user.email)

  useEffect(() => {
    if (typeof price !== 'number' || price < 1) {
      console.error('Invalid price value. Must be a number greater than or equal to 1.');
      return;
    }
  
    axiosSecure.post('/create-payment-intent', { price })
      .then(res => {
        // console.log(res.data.clientSecret);
        // console.log(price);
        setClientSecret(res.data.clientSecret);
      })
  }, [price, axiosSecure]);

  // handleSubmit btn click
  const handleSubmit = async (event) => {
    // Block native form submission.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      return;
    }

    const card = elements.getElement(CardElement);

    if (card == null) {
      return;
    }

    // console.log('card: ', card)
    const {error, paymentMethod} = await stripe.createPaymentMethod({
      type: 'card',
      card,
    });

    if (error) {
      console.log('[error]', error);
      setcardError(error.message);
    } else {
      setcardError('Success!');
      // console.log('[PaymentMethod]', paymentMethod);
    }

    const {paymentIntent, error:confirmError} = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: card,
          billing_details: {
            name: user?.displayName || 'anonymous',
            email: user?.email || 'unknown'
          },
        },
      },
    );

    if(confirmError){
      console.log(confirmError)
    }

    // console.log('paymentIntent', paymentIntent)

    if(paymentIntent.status ==="succeeded") {
      const transitionId =paymentIntent.id;
      setcardError(`Your transitionId is: ${transitionId}`)

      // save payment info to server
      const paymentInfo = {
        email: user.email,
        transitionId: paymentIntent.id,
        price,
        quantity: cart.length,
        status: "Order Pending",
        itemName: cart.map(item => ({ name: item.name, quantity: item.quantity, price:item.price })),
        cartItems: cart.map(item => item._id),
        menuItems: cart.map(item => item.menuItemId)
      };
      // send payment info
      axiosSecure.post('/payments', paymentInfo)
      .then( res => {
        // console.log(res.data)
        if(res.data){
          alert('Payment info sent successfully!')
          navigate('/order')
        }
      })
    }


  };

  return (
    <div className='flex flex-col sm:flex-row justify-start items-start gap-8'>
      {/* Order Summary */}
      <div className='md:w-1/2 w-full space-y-3'>
        <h4 className='text-lg font-semibold'>Order Summary</h4>
        
        {/* Order Summary Table */}
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2 text-left">Item Name</th>
              <th className="border px-4 py-2 text-left">Quantity</th>
              <th className="border px-4 py-2 text-left">Price</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{item.name}</td>
                <td className="border px-4 py-2">{item.quantity}</td>
                <td className="border px-4 py-2">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="border px-4 py-2 font-semibold">Total</td>
              <td className="border px-4 py-2 font-semibold">{cart.reduce((sum, item) => sum + item.quantity, 0)}</td>
              <td className="border px-4 py-2 font-semibold">₹{price.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment Section */}
      <div className='md:w-1/3 w-full space-y-3 card bg-base-100 max-w-sm shrink-0 shadow-2xl px-4 py-8'>
        <h4 className='text-lg font-semibold'>Process Your Payment!</h4>
        <h5 className="font-medium">Credit/Debit Card</h5>

        {/* Stripe Form */}
        <form onSubmit={handleSubmit}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
          <button type="submit" disabled={!stripe} className='btn btn-sm mt-5 bg-primary text-white'>
            Pay
          </button>
        </form>
        {cardError && <p className='text-red italic text-sm'>{cardError}</p>}

        {/* PayPal */}
        <div className='mt-5 text-center'>
          <hr />
          <button type="submit" className='btn btn-sm mt-5 bg-orange-500 text-white'>
            <FaPaypal /> Pay with PayPal
          </button>
          <p className='mt-4 text-slate-500'>Demo Card Number:4242424242424242</p>
        </div>
      </div>
    </div>
  );
}

export default CheckoutForm;
