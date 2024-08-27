import React, { useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { FaArrowLeft, FaArrowRight, FaTrashAlt } from "react-icons/fa";
import { GiConfirmed } from "react-icons/gi";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

const ManageBookings = () => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("access_token");
  const { refetch, data: orders = [] } = useQuery({
    queryKey: ["orders", user?.email],
    enabled: !loading,
    queryFn: async () => {
      const res = await fetch(`https://food-carts-server.onrender.com/payments/all`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      return res.json();
    },
  });

  const axiosSecure = useAxiosSecure();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const items_Per_Page = 10;
  const indexOfLastItem = currentPage * items_Per_Page;
  const indexOfFirstItem = indexOfLastItem - items_Per_Page;
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
  // console.log(orders);

  // State for modal popup
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
// console.log(selectedItems);
  // Delete item
  const handleDeleteItem = (item) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axiosSecure.delete(`/payments/${item._id}`).then((res) => {
          refetch();
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: `Booking Deleted!`,
            showConfirmButton: false,
            timer: 1500,
          });
        });
      }
    });
  };

  // Confirm order
  const confirmOrder = async (item) => {
    await axiosSecure.patch(`/payments/${item._id}`).then((res) => {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: `Order Confirmed Now!`,
        showConfirmButton: false,
        timer: 1500,
      });
      refetch();
    });
  };
  // Handle opening the modal and setting selected items
  const handleViewItems = (items) => {
    setSelectedItems(items);
    setShowModal(true);
  };

  return (
    <div className="w-full md:w-[870px] mx-auto px-4">
      <h2 className="text-2xl font-semibold my-4">
        Manage All <span className="text-green">Bookings!</span>
      </h2>

      {/* Menu items table */}
      <div>
        <div className="overflow-x-auto lg:overflow-x-visible">
          <table className="table w-full">
            {/* head */}
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Transaction Id</th>
                <th>Price</th>
                <th>Status</th>
                <th>View Items</th>
                <th>Confirm Order</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.email}</td>
                  <td>{item.transitionId}</td>
                  <td>₹{item.price}</td>
                  <td>{item.status}</td>
                  <td>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleViewItems(item.itemName)}
                    >
                      View Items
                    </button>
                  </td>
                  <td className="text-center">
                    {item.status === "confirmed" ? (
                      "done"
                    ) : (
                      <button
                        className="btn bg-green text-white btn-xs text-center"
                        onClick={() => confirmOrder(item)}
                      >
                        <GiConfirmed />
                      </button>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="btn btn-ghost btn-xs"
                    >
                      <FaTrashAlt className="text-red" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center my-4">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-sm mr-2 btn-warning"
        >
          <FaArrowLeft /> Previous
        </button>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={indexOfLastItem >= orders.length}
          className="btn btn-sm bg-green text-white"
        >
          Next <FaArrowRight />
        </button>
      </div>

      {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-8 w-[90%] md:w-[50%]">
      <h3 className="text-lg font-semibold mb-4">Ordered Items</h3>
      <ul>
        {selectedItems && selectedItems.map((item, idx) => (
          <li key={idx} className="mb-2">
            {item.name} - Quantity: {item.quantity}
          </li>
        ))}
      </ul>
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
  );
};

export default ManageBookings;
