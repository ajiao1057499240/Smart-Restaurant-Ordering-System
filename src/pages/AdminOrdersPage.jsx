import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
    }
  };

  const markCompleted = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}`, {
        status: "Completed",
      });
      fetchOrders();
    } catch (err) {
      console.error("❌ Error updating order:", err);
    }
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/orders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error("❌ Error deleting order:", err);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold text-center mb-8 text-[#A678E3]">
        🧾 Admin: Orders
      </h1>


      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-purple-100 text-left">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Order Type</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total ($)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-400">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-medium">
                    {order.customerName || "N/A"}
                  </td>
                  <td className="px-4 py-3">{order.contactNumber || "N/A"}</td>
                  <td className="px-4 py-3">{order.orderType || "N/A"}</td>
                  <td className="px-4 py-3">
                    {Array.isArray(order.items)
                      ? order.items.map((item, i) => (
                        <span key={i}>
                          {item.name || item.itemName} × {item.quantity}
                          {i < order.items.length - 1 && ", "}
                        </span>
                      ))
                      : "No items"}
                  </td>
                  <td className="px-4 py-3">
                    ${order.total ? order.total.toFixed(2) : "0.00"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === "Completed"
                        ? "bg-green-200 text-green-800"
                        : "bg-yellow-200 text-yellow-800"
                        }`}
                    >
                      {order.status || "In Progress"}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    {order.status !== "Completed" && (
                      <button
                        onClick={() => markCompleted(order._id)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Mark Completed
                      </button>
                    )}
                    <button
                      onClick={() => deleteOrder(order._id)}
                      className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-indigo-400 hover:bg-indigo-500 text-white px-3 py-1 rounded-md text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🔍 Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">
              Order Details
            </h2>
            <p>
              <strong>Customer:</strong> {selectedOrder.customerName}
            </p>
            <p>
              <strong>Contact:</strong> {selectedOrder.contactNumber}
            </p>
            <p>
              <strong>Order Type:</strong> {selectedOrder.orderType}
            </p>
            <p>
              <strong>Status:</strong> {selectedOrder.status}
            </p>
            <p>
              <strong>Total:</strong> ${selectedOrder.total?.toFixed(2)}
            </p>
            <p className="mt-3">
              <strong>Items:</strong>
            </p>
            <ul className="list-disc ml-6 text-gray-700">
              {selectedOrder.items?.map((item, i) => (
                <li key={i}>
                  {item.name || item.itemName} × {item.quantity}
                </li>
              ))}
            </ul>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-1 rounded-md text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
