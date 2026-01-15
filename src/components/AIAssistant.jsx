import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function AIAssistant() {
    const [recommendations, setRecommendations] = useState([]);
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: "ai", text: "👋 Hi! I’m your Smart Assistant. Ask me about today’s specials, vegan options, or gluten-free meals!" },
    ]);
    const [input, setInput] = useState("");
    const chatBoxRef = useRef(null);

    // ✅ 获取推荐菜（基于用户或热门）
    useEffect(() => {
        axios
            .get("http://localhost:5000/api/ai/recommend?userId=guest")
            .then((res) => setRecommendations(res.data))
            .catch(() => setRecommendations([]));
    }, []);

    // ✅ 自动滚动到底部
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    // ✅ 发送消息
    // ✅ 发送消息
    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { from: "user", text: input };

        // 把用户消息加到对话里
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        try {
            const { data } = await axios.post("http://localhost:5000/api/ai/chat", {
                message: input,
                userId: "guest",
            });

            // 把 AI 回复加到对话里
            setMessages((prev) => [...prev, { from: "ai", text: data.reply }]);
        } catch (err) {
            // 出错时给一个友好提示，不让应用崩溃
            setMessages((prev) => [
                ...prev,
                { from: "ai", text: "⚠️ Sorry, I couldn’t process that right now." },
            ]);
        }
    };

    return (
        <>
            {/* ✅ 推荐卡片 */}
            <div className="bg-white shadow rounded-xl p-5 mb-6 border border-gray-100">
                <h2 className="text-lg font-semibold mb-3 flex items-center text-[#A678E3]">
                    🤖 Smart Recommendation
                </h2>
                {recommendations.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                        Loading personalized recommendations...
                    </p>
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
                    className="mt-4 px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: "#A678E3" }}
                >
                    Ask AI a Question
                </button>
            </div>

            {/* ✅ 浮动聊天按钮 */}
            <button
                onClick={() => setChatOpen((p) => !p)}
                className="fixed bottom-5 right-5 bg-[#A678E3] text-white p-3 rounded-full shadow-lg hover:scale-105 transition"
            >
                💬
            </button>

            {/* ✅ 聊天窗口 */}
            {chatOpen && (
                <div className="fixed bottom-20 right-5 w-80 h-96 bg-white border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-2 border-b bg-[#A678E3] text-white">
                        <span className="font-semibold">Smart Assistant</span>
                        <button onClick={() => setChatOpen(false)}>✖</button>
                    </div>

                    {/* 聊天内容 */}
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
                    </div>

                    {/* 输入框 */}
                    <div className="flex items-center border-t p-2 bg-white">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Ask about specials or vegan meals..."
                            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
                        />
                        <button
                            onClick={sendMessage}
                            className="ml-2 px-3 py-2 rounded-lg text-white text-sm"
                            style={{ backgroundColor: "#A678E3" }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
