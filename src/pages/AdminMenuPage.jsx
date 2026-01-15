import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import Swal from "sweetalert2";

export default function AdminMenuPage() {
    const [menu, setMenu] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ name: "", category: "", price: "", description: "" });
    const [unsaved, setUnsaved] = useState(false); // 🟡 新增状态

    useEffect(() => {
        fetchMenu();

        // 🧠 页面关闭或刷新时提示未保存修改
        const handleBeforeUnload = (e) => {
            if (unsaved) {
                e.preventDefault();
                e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [unsaved]);

    const fetchMenu = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/menu");
            setMenu(res.data);
        } catch (err) {
            console.error("❌ Failed to fetch menu:", err);
            Swal.fire("Error", "Failed to load menu data.", "error");
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setUnsaved(true); // 🟡 输入变动 → 标记为未保存
    };

    const handleAdd = async () => {
        try {
            const { name, category, price, description } = form;
            if (!name || !category || !price) {
                Swal.fire("Warning", "Please fill in name, category, and price.", "warning");
                return;
            }
            await axios.post("http://localhost:5000/api/menu", {
                name,
                category,
                price: parseFloat(price),
                description,
            });
            Swal.fire("✅ Added!", "Menu item added successfully.", "success");
            setForm({ name: "", category: "", price: "", description: "" });
            setUnsaved(false);
            fetchMenu();
        } catch (err) {
            console.error("❌ Add item failed:", err);
            Swal.fire("Error", "Something went wrong while adding item.", "error");
        }
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setForm({
            name: item.name,
            category: item.category,
            price: item.price,
            description: item.description,
        });
        setUnsaved(false);
    };

    const handleUpdate = async () => {
        try {
            if (!editItem) return;
            const { name, category, price, description } = form;
            await axios.put(`http://localhost:5000/api/menu/${editItem._id}`, {
                name,
                category,
                price: parseFloat(price),
                description,
            });
            Swal.fire({
                icon: "success",
                title: "✅ Updated!",
                text: "Menu item updated successfully.",
                confirmButtonColor: "#A678E3",
            });
            setEditItem(null);
            setForm({ name: "", category: "", price: "", description: "" });
            setUnsaved(false); // ✅ 保存后清除标记
            fetchMenu();
        } catch (err) {
            console.error("❌ Update item failed:", err);
            Swal.fire("Error", "Something went wrong while updating item.", "error");
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete the item.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#A678E3",
            cancelButtonColor: "#aaa",
            confirmButtonText: "Yes, delete it",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await axios.delete(`http://localhost:5000/api/menu/${id}`);
                Swal.fire("Deleted!", "Menu item deleted successfully.", "success");
                fetchMenu();
            }
        });
    };

    return (
        <div className="relative max-w-5xl mx-auto py-10">
            {/* 🔔 未保存提示浮动栏 */}
            {unsaved && (
                <div className="absolute top-2 right-4 bg-yellow-300 text-black px-4 py-1 rounded-full shadow-md text-sm animate-pulse">
                    💾 Unsaved changes
                </div>
            )}

            <h1 className="text-3xl font-bold text-center mb-8 text-[#A678E3]">
                🍴 Admin: Menu Management
            </h1>


            {/* ===== 表单区域 ===== */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Name"
                        className="border rounded-lg p-2"
                    />
                    <input
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        placeholder="Category"
                        className="border rounded-lg p-2"
                    />
                    <input
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="Price"
                        className="border rounded-lg p-2"
                    />
                    <input
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Description"
                        className="border rounded-lg p-2 col-span-2"
                    />
                </div>

                {/* 按钮逻辑 */}
                {editItem ? (
                    <button
                        onClick={handleUpdate}
                        className="w-full py-2 bg-black text-white rounded-full hover:bg-[#A678E3] transition"
                    >
                        Update Item
                    </button>
                ) : (
                    <button
                        onClick={handleAdd}
                        className="w-full py-2 bg-[#A678E3] text-white rounded-full hover:bg-[#8C5DD8] transition"
                    >
                        Add Item
                    </button>
                )}
            </div>

            {/* ===== 菜单表格 ===== */}
            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 border-b">Name</th>
                            <th className="p-3 border-b">Category</th>
                            <th className="p-3 border-b">Price ($)</th>
                            <th className="p-3 border-b">Description</th>
                            <th className="p-3 border-b text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menu.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50">
                                <td className="p-3">{item.name}</td>
                                <td className="p-3">{item.category}</td>
                                <td className="p-3">{item.price.toFixed(2)}</td>
                                <td className="p-3">{item.description}</td>
                                <td className="p-3 text-center space-x-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="px-3 text-xs font-medium rounded-full bg-black text-white hover:bg-[#A678E3] transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="px-3 text-xs font-medium rounded-full bg-[#E57373] text-white hover:bg-[#D64F4F] transition"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {menu.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-gray-500">
                                    No menu items found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
