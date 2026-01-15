import React, { useState } from "react";
import axios from "../axiosConfig";
import Swal from "sweetalert2";

export default function ReservationPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        guests: "",
        notes: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const { name, email, phone, date, time, guests } = form;
        if (!name || !email || !phone || !date || !time || !guests) {
            Swal.fire("⚠️ Missing Fields", "Please fill out all required fields.", "warning");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Swal.fire("⚠️ Invalid Email", "Please enter a valid email address.", "warning");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await axios.post("http://localhost:5000/api/reservations", form);
            Swal.fire({
                icon: "success",
                title: "✅ Reservation Confirmed!",
                html: `
          <p><b>${form.name}</b>, your table for <b>${form.guests}</b> guests is booked.</p>
          <p>${form.date} at ${form.time}</p>
          <p>We’ll contact you at <b>${form.email}</b>.</p>
        `,
                confirmButtonColor: "#A678E3",
            });
            setForm({ name: "", email: "", phone: "", date: "", time: "", guests: "", notes: "" });
        } catch (err) {
            console.error("❌ Reservation failed:", err);
            Swal.fire("Error", "Something went wrong while submitting.", "error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-5xl">
                <h1 className="text-3xl font-bold text-center mb-4 text-[#A678E3]">
                    🕒 Make a Reservation
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
                >
                    {/* 左侧：个人信息 */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#A678E3]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#A678E3]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="403-555-1234"
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#A678E3]"
                            />
                        </div>
                    </div>

                    {/* 右侧：预订信息 */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date *</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#A678E3]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Time *</label>
                                <input
                                    type="time"
                                    name="time"
                                    value={form.time}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#A678E3]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Number of Guests *
                            </label>
                            <input
                                type="number"
                                name="guests"
                                min="1"
                                max="20"
                                value={form.guests}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#A678E3]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Notes (optional)
                            </label>
                            <textarea
                                name="notes"
                                rows="2"
                                value={form.notes}
                                onChange={handleChange}
                                placeholder="Any special requests?"
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#A678E3]"
                            ></textarea>
                        </div>
                    </div>

                    {/* 提交按钮 */}
                    <div className="col-span-1 md:col-span-2 flex justify-center mt-2">
                        <button
                            type="submit"
                            className="w-1/2 py-3 bg-[#A678E3] text-white rounded-full font-semibold hover:bg-[#8C5DD8] transition-all duration-300 hover:scale-105"
                        >
                            Confirm Reservation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
