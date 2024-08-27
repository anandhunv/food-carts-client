import { useQuery } from "@tanstack/react-query";

import useAuth from "../../../hooks/useAuth";
import { Link } from "react-router-dom";
import { useState } from "react";

const Order = () => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("access_token");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { refetch, data: orders = [] } = useQuery({
    queryKey: ["orders", user?.email],
    enabled: !loading,
    queryFn: async () => {
      const res = await fetch(
        `https://food-carts-server.onrender.com/payments?email=${user?.email}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      return res.json();
    },
  });

  // console.log(orders)

    // Handle opening the modal and setting selected items
    const handleViewItems = (items,transitionId,totalPrice) => {
      setSelectedItems([{item:items, transitionId:transitionId,totalPrice:totalPrice }]);   
         setShowModal(true);
    };
    // console.log(selectedItems)
  // date format
  const formatDate = (createdAt) => {
    const createdAtDate = new Date(createdAt);
    return createdAtDate.toLocaleDateString(); // You can adjust options as needed
  };
  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4">
      {/* banner */}
      <div className=" bg-gradient-to-r from-0% from-[#FAFAFA] to-[#FCFCFC] to-100%">
        <div className="py-28 flex flex-col items-center justify-center">
          {/* content */}
          <div className=" text-center px-4 space-y-7">
            <h2 className="md:text-5xl text-4xl font-bold md:leading-snug leading-snug">
              Track Your All<span className="text-green"> Orders</span>
            </h2>
          </div>
        </div>
      </div>

      {/* table content */}
      <div>
        {
          <div>
            <div>
              <div className="overflow-x-auto">
                <table className="table text-center">
                  {/* head */}
                  <thead className="bg-green text-white rounded-sm">
                    <tr>
                      <th>#</th>
                      <th>Order Date</th>
                      <th>Bill</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((item,index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{formatDate(item.createdAt)}</td>
                        <td>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleViewItems(item.itemName,item.transitionId,item.price)}
                    >
                      View Items
                    </button>
                  </td>
                        <td>{item.status}</td>
                        <td>
                          <button className="btn btn-sm border-none text-orange-400 bg-transparent">
                            Contact
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* foot */}
                </table>
              </div>
            </div>
            <hr />
          </div>
        }
       {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-8 w-[90%] md:w-[50%]">
      <h3 className="text-lg font-semibold mb-4">Ordered Items</h3>
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2 text-left">Item Name</th>
            <th className="border px-4 py-2 text-left">Quantity</th>
            <th className="border px-4 py-2 text-left">Price</th>
          </tr>
        </thead>
        <tbody>
          {selectedItems[0]?.item.map((item, idx) => {
            const price = parseFloat(item.price);
            return (
              <tr key={idx}>
                <td className="border px-4 py-2">{item.name}</td>
                <td className="border px-4 py-2">{item.quantity}</td>
                <td className="border px-4 py-2">₹{price.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td className="border px-4 py-2 font-semibold" colSpan="2">Total</td>
            <td className="border px-4 py-2 font-semibold">
              {selectedItems[0]?.totalPrice}
            </td>
          </tr>
        </tfoot>
      </table>
      <p className="mt-4">Transition ID: {selectedItems[0]?.transitionId}</p>

      <button
        className="btn btn-sm bg-red text-blue mt-4"
        onClick={() => setShowModal(false)}
      >
        Close
      </button>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default Order;
