import React, { useState } from "react";
import axios from "../axiosConfig";
import { useUser } from "../context/UserContext";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
    const { saveLogin } = useUser();
    const navigate = useNavigate();

    const [mode, setMode] = useState("user"); // "user" | "admin"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await axios.post("http://localhost:5000/api/users/login", {
                email,
                password,
            });

            const { user, token } = res.data;

            // 如果当前是“管理员模式”，但账号不是 admin，禁止登录
            if (mode === "admin" && user.role !== "admin") {
                setError("This account is not an admin. Please use User Login.");
                return;
            }

            // 保存登录状态
            saveLogin(user, token);

            // 登录后跳转逻辑
            if (user.role === "admin") {
                navigate("/admin/menu");
            } else {
                navigate("/");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    const isAdmin = mode === "admin";

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#f5f5f7]">
            <div className="bg-white shadow-xl rounded-2xl w-[380px] p-8">
                {/* Tabs */}
                <div className="flex mb-6 border-b">
                    <button
                        onClick={() => setMode("user")}
                        className={`flex-1 py-2 text-center ${!isAdmin
                            ? "text-[#A678E3] font-semibold border-b-2 border-[#A678E3]"
                            : "text-gray-500"
                            }`}
                    >
                        User Login
                    </button>
                    <button
                        onClick={() => setMode("admin")}
                        className={`flex-1 py-2 text-center ${isAdmin
                            ? "text-[#A678E3] font-semibold border-b-2 border-[#A678E3]"
                            : "text-gray-500"
                            }`}
                    >
                        Admin Login
                    </button>
                </div>

                <h1 className="text-2xl font-bold text-center mb-4 text-[#A678E3]">
                    {isAdmin ? "Admin Login" : "Login"}
                </h1>

                {error && (
                    <p className="text-red-500 text-sm text-center mb-4">{error}</p>
                )}

                <form onSubmit={handleLogin}>
                    <label className="block text-gray-700 mb-1 text-sm">Email:</label>
                    <input
                        type="email"
                        className="w-full border rounded-lg px-3 py-2 mb-4 text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label className="block text-gray-700 mb-1 text-sm">Password:</label>
                    <input
                        type="password"
                        className="w-full border rounded-lg px-3 py-2 mb-6 text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="w-full py-2 rounded-lg text-white text-sm font-semibold"
                        style={{ backgroundColor: "#A678E3" }}
                    >
                        {isAdmin ? "Login as Admin" : "Login"}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-600">
                    No account yet?{" "}
                    <Link
                        to="/register"
                        className="text-[#A678E3] hover:underline font-medium"
                    >
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
}
