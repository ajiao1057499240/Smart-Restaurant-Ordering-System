import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import Swal from "sweetalert2";

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        fetchReservations();
    }, []);

    // 获取预订列表
    const fetchReservations = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/reservations");
            setReservations(res.data);
        } catch (err) {
            console.error("❌ Error fetching reservations:", err);
            Swal.fire("Error", "Failed to load reservation data.", "error");
        }
    };

    // 确认预订
    const handleConfirm = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/reservations/${id}`, {
                status: "Confirmed",
            });
            Swal.fire({
                icon: "success",
                title: "✅ Reservation Confirmed!",
                text: "The reservation has been marked as confirmed.",
                confirmButtonColor: "#A678E3",
            });
            fetchReservations();
        } catch (err) {
            console.error("❌ Confirm reservation failed:", err);
            Swal.fire("Error", "Failed to confirm reservation.", "error");
        }
    };

    // 删除预订
    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This reservation will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#A678E3",
            cancelButtonColor: "#aaa",
            confirmButtonText: "Yes, delete it",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:5000/api/reservations/${id}`);
                    Swal.fire("Deleted!", "Reservation deleted successfully.", "success");
                    fetchReservations();
                } catch (err) {
                    console.error("❌ Delete reservation failed:", err);
                    Swal.fire("Error", "Failed to delete reservation.", "error");
                }
            }
        });
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center">
            <h1 className="text-3xl font-semibold text-purple-600 mb-6 text-center">
                📅 Admin: Reservation Management
            </h1>

            <div className="overflow-x-auto bg-white rounded-lg shadow w-full max-w-5xl">
                <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-purple-100 text-left">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Contact</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Guests</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="text-center py-6 text-gray-400 italic"
                                >
                                    No reservations found.
                                </td>
                            </tr>
                        ) : (
                            reservations.map((r) => (
                                <tr
                                    key={r._id}
                                    className="border-b hover:bg-gray-50 transition"
                                >
                                    <td className="px-4 py-3 font-medium">{r.name || "N/A"}</td>
                                    <td className="px-4 py-3">{r.phone || r.contact || "N/A"}</td>
                                    <td className="px-4 py-3">{r.date || "N/A"}</td>
                                    <td className="px-4 py-3">{r.time || "N/A"}</td>
                                    <td className="px-4 py-3">{r.guests || "N/A"}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${r.status === "Confirmed"
                                                ? "bg-green-200 text-green-800"
                                                : "bg-yellow-200 text-yellow-800"
                                                }`}
                                        >
                                            {r.status || "Pending"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center space-x-2">
                                        {r.status !== "Confirmed" && (
                                            <button
                                                onClick={() => handleConfirm(r._id)}
                                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                                            >
                                                Confirm
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(r._id)}
                                            className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
