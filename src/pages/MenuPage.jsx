import React, { useEffect, useState, useRef } from "react";
import axios from "../axiosConfig";
import { useCart } from "../context/CartContext";
import Swal from "sweetalert2";

export default function MenuPage() {
    const [menu, setMenu] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [priceMax, setPriceMax] = useState(50);

    const { addToCart, cart } = useCart();

    const token = localStorage.getItem("token");

    // === AI Assistant State ===
    const [recommendations, setRecommendations] = useState([]);
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const chatBoxRef = useRef(null);

    // =============================
    // 载入菜单
    // =============================
    useEffect(() => {
        axios
            .get("http://localhost:5000/api/menu")
            .then((res) => setMenu(res.data))
            .catch((err) => console.error("❌ Failed to load menu:", err));
    }, []);

    // =============================
    // 初始化 AI 问候语
    // =============================
    useEffect(() => {
        const hour = new Date().getHours();
        let greet = "Hello!";
        if (hour < 12) greet = "Good morning 🌞";
        else if (hour < 18) greet = "Good afternoon ☕";
        else greet = "Good evening 🌙";

        setMessages([
            { from: "ai", text: `${greet} I'm your Smart Assistant.` },
            {
                from: "ai",
                text: "I can recommend dishes based on what you like or add to your cart 🛒.",
            },
        ]);
    }, []);

    // =============================
    // AI 推荐系统
    // =============================
    useEffect(() => {
        const url =
            cart.length > 0
                ? `http://localhost:5000/api/ai/recommend?type=${cart[cart.length - 1].category}`
                : "http://localhost:5000/api/ai/recommend";

        axios
            .get(url, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setRecommendations(res.data))
            .catch(() => setRecommendations([]));
    }, [cart]);

    // 聊天窗口自动滚动到底部
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    // =============================
    // 发送聊天
    // =============================
    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { from: "user", text: input };

        // 先把用户消息加到对话里
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setTyping(true);

        try {
            const { data } = await axios.post(
                "http://localhost:5000/api/ai/chat",
                { message: input },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setTimeout(() => {
                setTyping(false);
                setMessages((prev) => [...prev, { from: "ai", text: data.reply }]);
            }, 900);
        } catch (err) {
            setTyping(false);
            setMessages((prev) => [
                ...prev,
                { from: "ai", text: "⚠️ Sorry, I couldn’t process that right now." },
            ]);
        }
    };

    // =============================
    // Add to Cart + 通知 AI 偏好学习
    // =============================
    const handleAdd = (item) => {
        addToCart(item);

        Swal.fire({
            position: "top-end",
            icon: "success",
            title: `${item.name} added to cart!`,
            showConfirmButton: false,
            timer: 800,
        });

        axios
            .post(
                "http://localhost:5000/api/ai/learn",
                { category: item.category, name: item.name },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .catch((err) => {
                console.warn("AI learn failed:", err?.response?.status, err?.message);
            });
    };


    // =============================
    // 过滤菜单
    // =============================
    const filtered = menu
        .filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase().trim())
        )
        .filter((item) => (category === "All" ? true : item.category === category))
        .filter((item) => (priceMax ? Number(item.price) <= Number(priceMax) : true));

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* === AI 推荐卡片 === */}
            <div className="bg-white shadow rounded-xl p-5 mb-6 border border-gray-100">
                <h2 className="text-lg font-semibold mb-3 flex items-center text-[#A678E3]">
                    🤖 Personalized Recommendations
                </h2>

                {recommendations.length === 0 ? (
                    <p className="text-gray-500 text-sm">Loading smart recommendations...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {recommendations.map((r, i) => (
                            <div
                                key={i}
                                className="border rounded-lg p-3 hover:shadow-md transition bg-white"
                            >
                                <h3 className="font-semibold text-gray-800">{r.name}</h3>
                                <p className="text-xs text-gray-500">{r.reason}</p>
                                <p className="text-sm text-gray-700 mt-1">${r.price}</p>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={() => setChatOpen(true)}
                    className="mt-4 px-4 py-2 rounded-lg text-white bg-[#A678E3]"
                >
                    Ask AI a Question
                </button>
            </div>

            {/* === 菜单标题 === */}
            <h1 className="text-3xl font-bold mb-6 text-center text-[#A678E3]">
                🍴 Our Menu
            </h1>

            {/* 搜索框 */}
            <input
                type="text"
                placeholder="Search menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 mb-6"
            />

            {/* 筛选条 */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                {["All", "Starter", "Main", "Dessert", "Beverage"].map((c) => (
                    <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-3 py-1 rounded-full border transition ${category === c
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-800 hover:bg-gray-100"
                            }`}
                    >
                        {c}
                    </button>
                ))}

                <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm text-gray-600">Max Price</span>
                    <input
                        type="range"
                        min="3"
                        max="50"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                    />
                    <span className="w-10 text-right">${Number(priceMax).toFixed(0)}</span>
                </div>
            </div>

            {/* 菜单卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered.length === 0 ? (
                    <p className="text-gray-500 text-center col-span-full">
                        No menu items match your filters.
                    </p>
                ) : (
                    filtered.map((item) => (
                        <div
                            key={item._id}
                            className="bg-white shadow-md rounded-xl p-4 flex flex-col justify-between hover:shadow-lg transition"
                        >
                            <div>
                                <h2 className="text-lg font-semibold mb-1">{item.name}</h2>
                                <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                                <p className="text-gray-700 text-sm mb-3">{item.description}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-lg">${item.price}</span>
                                <button
                                    onClick={() => handleAdd(item)}
                                    className="px-3 py-1 rounded-lg bg-black text-white hover:bg-gray-800 transition"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* === 悬浮聊天按钮 === */}
            <button
                onClick={() => setChatOpen(true)}
                className="fixed bottom-[95px] right-5 bg-[#A678E3] text-white p-3 rounded-full shadow-lg hover:scale-105 transition"
            >
                💬
            </button>

            {/* === 聊天窗口 === */}
            {chatOpen && (
                <div className="fixed bottom-[165px] right-5 w-80 h-96 bg-white border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
                    <div className="flex justify-between items-center px-4 py-2 border-b bg-[#A678E3] text-white">
                        <span className="font-semibold">Smart Assistant</span>
                        <button onClick={() => setChatOpen(false)}>✖</button>
                    </div>

                    <div
                        ref={chatBoxRef}
                        className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50"
                    >
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${m.from === "ai"
                                    ? "bg-gray-200 text-gray-800"
                                    : "bg-[#A678E3] text-white ml-auto"
                                    }`}
                            >
                                {m.text}
                            </div>
                        ))}

                        {typing && (
                            <div className="text-sm text-gray-400 italic">AI is typing...</div>
                        )}
                    </div>

                    <div className="flex items-center border-t p-2 bg-white">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Ask about specials, vegan meals..."
                            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
                        />
                        <button
                            onClick={sendMessage}
                            className="ml-2 px-3 py-2 rounded-lg text-white text-sm bg-[#A678E3]"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
