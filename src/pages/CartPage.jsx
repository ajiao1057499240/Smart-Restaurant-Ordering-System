import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import axios from "../axiosConfig";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
    const { cart, clearCart } = useCart();
    const [customerName, setCustomerName] = useState("");
    const [contact, setContact] = useState("");
    const [orderType, setOrderType] = useState("pickup");
    const navigate = useNavigate();

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2);

    // ✅ 提交订单逻辑
    const handlePlaceOrder = async () => {
        if (!customerName.trim() || !contact.trim()) {
            Swal.fire({
                title: "⚠️ Missing Information",
                text: "Please fill in your name and contact number.",
                icon: "warning",
                confirmButtonColor: "#7C3AED",
            });
            return;
        }

        if (cart.length === 0) {
            Swal.fire({
                title: "🛒 Empty Cart",
                text: "Please add some items before placing an order.",
                icon: "info",
                confirmButtonColor: "#7C3AED",
            });
            return;
        }

        const orderData = {
            customerName,
            contact,
            orderType,
            items: cart,
            total: parseFloat(total),
        };

        try {
            const res = await axios.post("http://localhost:5000/api/orders", orderData);

            if (res.status === 200) {
                // ✅ 提取订单数据返回结果
                const insertedId = res.data.insertedId || res.data._id;
                const shortId = insertedId ? insertedId.slice(-6) : "N/A";

                Swal.fire({
                    title: "✅ Order placed successfully!",
                    html: `
            <div style="text-align:left;line-height:1.6;">
              <b>Order ID:</b> ${shortId}<br/>
              <b>Name:</b> ${customerName}<br/>
              <b>Contact:</b> ${contact}<br/>
              <b>Order Type:</b> ${orderType}<br/>
              <b>Time:</b> ${new Date().toLocaleString()}<br/>
              <b>Total:</b> $${total}
            </div>
          `,
                    icon: "success",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#7C3AED",
                    width: 400,
                }).then(() => {
                    clearCart();
                    navigate("/menu");
                });
            }
        } catch (err) {
            console.error("❌ Failed to place order:", err);
            Swal.fire({
                title: "❌ Order failed",
                text: "Something went wrong. Please try again later.",
                icon: "error",
                confirmButtonColor: "#7C3AED",
            });
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container mx-auto py-10 text-center">
                <h1 className="text-2xl font-bold mb-4">Your cart is empty 🛒</h1>
                <button
                    onClick={() => navigate("/menu")}
                    className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
                >
                    Back to Menu
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center">🧾 Checkout</h1>

            {/* ✅ 顾客信息输入 */}
            <div className="bg-white shadow-md rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Customer Information</h2>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                        Name<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                        Contact Number<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Enter your phone number"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                        Order Type
                    </label>
                    <select
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="pickup">Pickup</option>
                        <option value="delivery">Delivery</option>
                    </select>
                </div>
            </div>

            {/* ✅ 订单预览 */}
            <div className="bg-white shadow-md rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                {cart.map((item) => (
                    <div
                        key={item._id || item.id}
                        className="flex justify-between border-b py-2"
                    >
                        <span>
                            {item.name} × {item.qty}
                        </span>
                        <span>${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                ))}

                <div className="mt-4 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${total}</span>
                </div>

                <button
                    onClick={handlePlaceOrder}
                    className="mt-6 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
                >
                    Place Order
                </button>
            </div>
        </div>
    );
}
