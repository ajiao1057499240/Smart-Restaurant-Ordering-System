import React from "react";
import { Link } from "react-router-dom";
import bgImage from "../assets/bg.jpg";  // 使用本地图片

export default function HomePage() {
    return (
        <section
            className="relative w-full min-h-screen text-white flex items-center justify-center bg-zoom"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* 顶层遮罩（增强文字可读性） */}
            <div className="absolute inset-0 bg-black/40"></div>

            <div className="relative z-10 text-center px-4">
                <h1 className="text-5xl font-bold mb-4">
                    <span className="text-purple-300">Welcome to </span>
                    <span className="text-white/90">Smart Restaurant</span>
                </h1>

                <p className="text-lg mb-8 max-w-xl mx-auto text-gray-200">
                    Where fine dining meets modern simplicity — explore, reserve, and taste excellence.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <Link
                        to="/menu"
                        className="px-6 py-3 bg-purple-400 text-white rounded-lg font-semibold hover:bg-purple-500 transition shadow"
                    >
                        View Menu
                    </Link>

                    <Link
                        to="/reservation"
                        className="px-6 py-3 border border-gray-300 text-white rounded-lg font-semibold hover:bg-white hover:text-black transition shadow"
                    >
                        Book a Table
                    </Link>
                </div>
            </div>
        </section>
    );
}
