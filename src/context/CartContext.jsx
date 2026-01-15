import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const API_BASE = "http://localhost:5000";

    // 本地存储加载
    useEffect(() => {
        const saved = localStorage.getItem("cart");
        if (saved) setCart(JSON.parse(saved));
    }, []);

    // 同步到本地存储
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    // 加入购物车
    const addToCart = (item) => {
        setCart((prev) => {
            const existing = prev.find((i) => i._id === item._id);
            return existing
                ? prev.map((i) =>
                    i._id === item._id ? { ...i, qty: i.qty + 1 } : i
                )
                : [...prev, { ...item, qty: 1 }];
        });
    };

    // 删除某一项
    const removeFromCart = (id) =>
        setCart((prev) => prev.filter((i) => i._id !== id));

    // 数量 +1
    const increaseQty = (id) => {
        setCart((prev) =>
            prev.map((i) =>
                i._id === id ? { ...i, qty: i.qty + 1 } : i
            )
        );
    };

    // 数量 -1，减到 0 就移除
    const decreaseQty = (id) => {
        setCart((prev) =>
            prev
                .map((i) =>
                    i._id === id ? { ...i, qty: i.qty - 1 } : i
                )
                .filter((i) => i.qty > 0)
        );
    };

    // 清空购物车
    const clearCart = () => setCart([]);

    // 结算（当前流程主要用 CartPage，下单也可以用这个）
    const checkout = async () => {
        if (cart.length === 0) {
            Swal.fire("Your cart is empty!", "", "info");
            return;
        }

        try {
            const res = await axios.post(`${API_BASE}/api/orders`, {
                items: cart,
                total: cart.reduce((sum, i) => sum + i.price * i.qty, 0),
            });
            if (res.data) {
                Swal.fire("Order placed successfully!", "", "success");
                setCart([]);
                localStorage.removeItem("cart");
            }
        } catch (err) {
            console.error("❌ Failed to submit order:", err);
            Swal.fire("Failed to send order", "Please try again", "error");
        }
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                clearCart,
                checkout,
                increaseQty,
                decreaseQty,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
