import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { ShoppingCart, X, Plus, Minus, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // ✅ 新增

export default function FloatingCart() {
    const navigate = useNavigate(); // ✅ 新增导航钩子
    const { cart, increaseQty, decreaseQty, removeFromCart, clearCart } = useCart();
    const [open, setOpen] = useState(false);

    if (cart.length === 0) return null;

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2);

    // ✅ 改为跳转到 /cart 页面结算
    const handleCheckout = () => {
        setOpen(false);
        navigate("/cart");
    };

    return (
        <>
            {/* ✅ 悬浮按钮 */}
            <motion.button
                onClick={() => setOpen(!open)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-6 right-6 bg-black text-white rounded-full p-4 shadow-lg hover:bg-gray-800 transition flex items-center gap-2 z-40 pointer-events-auto"
            >
                <ShoppingCart className="w-5 h-5" />
                <span>{cart.reduce((sum, item) => sum + item.qty, 0)}</span>
            </motion.button>

            {/* ✅ 弹出购物车面板 */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.25 }}
                        className="fixed bottom-20 right-6 bg-white shadow-2xl rounded-2xl p-4 w-80 max-h-[70vh] overflow-y-auto z-50 pointer-events-auto"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-bold">Your Cart</h3>
                            <button onClick={() => setOpen(false)}>
                                <X className="w-5 h-5 text-gray-500 hover:text-black" />
                            </button>
                        </div>

                        {cart.map((item) => (
                            <div
                                key={item._id || item.id}
                                className="flex justify-between items-center border-b py-2"
                            >
                                <div>
                                    <p className="font-semibold text-sm">{item.name}</p>
                                    <p className="text-gray-500 text-xs">${item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => decreaseQty(item._id || item.id)}
                                        className="bg-gray-200 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-300"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span>{item.qty}</span>
                                    <button
                                        onClick={() => increaseQty(item._id || item.id)}
                                        className="bg-gray-200 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-300"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => removeFromCart(item._id || item.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* ✅ 改版结算逻辑 */}
                        <div className="mt-4 text-right">
                            <p className="font-bold text-gray-800 mb-2">Total: ${total}</p>
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition mb-2"
                            >
                                Go to Checkout
                            </button>
                            <button
                                onClick={clearCart}
                                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
