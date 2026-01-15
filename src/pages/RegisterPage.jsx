import React, { useState } from "react";
import axios from "../axiosConfig";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const [mode, setMode] = useState("user"); // user / admin
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [adminKey, setAdminKey] = useState(""); // ⭐ 必须加这个
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        setError("");

        try {
            const res = await axios.post("http://localhost:5000/api/users/register", {
                name,
                email,
                password,
                adminKey: mode === "admin" ? adminKey : ""   // ⭐ 关键：只有 admin 模式时才传密钥
            });

            alert("Registration successful!");
            navigate("/login");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-96">

                {/* Tab buttons */}
                <div className="flex mb-6 border-b pb-2">
                    <button
                        className={`flex-1 text-center ${mode === "user" ? "text-purple-600 font-bold" : ""}`}
                        onClick={() => setMode("user")}
                    >
                        User Register
                    </button>
                    <button
                        className={`flex-1 text-center ${mode === "admin" ? "text-purple-600 font-bold" : ""}`}
                        onClick={() => setMode("admin")}
                    >
                        Admin Register
                    </button>
                </div>

                <h2 className="text-2xl font-bold text-center text-purple-600 mb-4">
                    {mode === "admin" ? "Admin Register" : "User Register"}
                </h2>

                {error && <p className="text-red-600 text-center mb-2">{error}</p>}

                {/* Name */}
                <input
                    type="text"
                    placeholder="Name"
                    className="border w-full p-2 rounded mb-3"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                {/* Email */}
                <input
                    type="email"
                    placeholder="Email"
                    className="border w-full p-2 rounded mb-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                {/* Password */}
                <input
                    type="password"
                    placeholder="Password"
                    className="border w-full p-2 rounded mb-3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* Admin Secret Key */}
                {mode === "admin" && (
                    <input
                        type="text"
                        placeholder="Admin Secret Key"
                        className="border w-full p-2 rounded mb-4"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                    />
                )}

                <button
                    onClick={handleRegister}
                    className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600"
                >
                    {mode === "admin" ? "Register as Admin" : "Register"}
                </button>

                <p className="text-center mt-4 text-sm">
                    Already have an account?{" "}
                    <a className="text-purple-600 cursor-pointer" onClick={() => navigate("/login")}>
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}
