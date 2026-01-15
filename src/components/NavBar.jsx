import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function NavBar() {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useUser();

    // 点击菜单外部关闭 Admin 下拉
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isActive = (path) =>
        location.pathname === path ? "text-[#A678E3] font-semibold" : "";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center space-x-2 hover:opacity-80 transition"
                >
                    <img
                        src="/logo192.png"
                        alt="logo"
                        className="w-6 h-6"
                        style={{
                            filter:
                                "brightness(0) saturate(100%) invert(68%) sepia(36%) saturate(661%) hue-rotate(221deg) brightness(101%) contrast(96%)",
                        }}
                    />
                    <span className="font-bold text-black text-lg">SRMS</span>
                </Link>

                {/* 右侧导航 */}
                <div className="flex space-x-6 font-medium text-gray-700 items-center">
                    {/* 这些路由在 App.jsx 里已经被 ProtectedRoute 保护了 */}
                    <Link to="/" className={`hover:text-[#A678E3] transition ${isActive("/")}`}>
                        Home
                    </Link>
                    <Link
                        to="/menu"
                        className={`hover:text-[#A678E3] transition ${isActive("/menu")}`}
                    >
                        Menu
                    </Link>
                    <Link
                        to="/reservation"
                        className={`hover:text-[#A678E3] transition ${isActive("/reservation")}`}
                    >
                        Reservation
                    </Link>
                    <Link
                        to="/cart"
                        className={`hover:text-[#A678E3] transition ${isActive("/cart")}`}
                    >
                        Cart
                    </Link>

                    {/* 只有管理员才显示 Admin 下拉菜单 */}
                    {user?.role === "admin" && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setOpen((v) => !v)}
                                className={`hover:text-[#A678E3] transition ${location.pathname.startsWith("/admin") ? "text-[#A678E3]" : ""
                                    }`}
                            >
                                Admin ▾
                            </button>

                            {open && (
                                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md animate-fadeIn">
                                    <Link
                                        to="/admin/menu"
                                        onClick={() => setOpen(false)}
                                        className="block px-4 py-2 hover:bg-gray-100"
                                    >
                                        Manage Menu
                                    </Link>
                                    <Link
                                        to="/admin/orders"
                                        onClick={() => setOpen(false)}
                                        className="block px-4 py-2 hover:bg-gray-100"
                                    >
                                        View Orders
                                    </Link>
                                    <Link
                                        to="/admin/reservations"
                                        onClick={() => setOpen(false)}
                                        className="block px-4 py-2 hover:bg-gray-100"
                                    >
                                        Reservations
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 登录 / 注册 / 登出 区域 */}
                    {!user ? (
                        <>
                            <Link
                                to="/login"
                                className={`px-4 py-1 rounded-lg text-sm ${location.pathname === "/login"
                                        ? "bg-[#A678E3] text-white"
                                        : "border border-[#A678E3] text-[#A678E3] hover:bg-[#A678E3] hover:text-white"
                                    }`}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className={`px-4 py-1 rounded-lg text-sm ${location.pathname === "/register"
                                        ? "bg-gray-300 text-black"
                                        : "border border-gray-300 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                Register
                            </Link>
                        </>
                    ) : (
                        <>
                            <span className="text-sm text-gray-700">
                                Hello, <span className="font-semibold">{user.name}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-1 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
