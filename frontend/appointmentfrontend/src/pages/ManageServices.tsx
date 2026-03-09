import { useState } from "react";
import {
    useGetMyOrganizationQuery,
    useGetServicesByOrganizationQuery,
    useCreateServiceMutation,
    useUpdateServiceMutation,
    useDeleteServiceMutation,
} from "../store/api/authApi";
import type { IService, ICreateServiceForm, IUpdateServiceForm } from "../types/auth";

export default function ManageServices() {
    const { data: org } = useGetMyOrganizationQuery();
    const orgId = org?._id ?? "";

    const { data: services, isLoading } = useGetServicesByOrganizationQuery(orgId, {
        skip: !orgId,
    });

    const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
    const [updateService] = useUpdateServiceMutation();
    const [deleteService] = useDeleteServiceMutation();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ICreateServiceForm>({
        name: "",
        description: "",
        price: 0,
        duration: 30,
        organizationId: "",
        category: "",
    });
    const [msg, setMsg] = useState("");
    const [errMsg, setErrMsg] = useState("");

    const resetForm = () => {
        setForm({ name: "", description: "", price: 0, duration: 30, organizationId: "", category: "" });
        setEditingId(null);
        setShowForm(false);
    };

    const handleCreate = async () => {
        try {
            setErrMsg("");
            await createService({ ...form, organizationId: orgId }).unwrap();
            setMsg("Service created successfully!");
            resetForm();
        } catch (err: unknown) {
            const e = err as { data?: { message?: string } };
            setErrMsg(e.data?.message ?? "Failed to create service");
        }
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        try {
            setErrMsg("");
            const updateData: IUpdateServiceForm = {
                name: form.name,
                description: form.description,
                price: form.price,
                duration: form.duration,
                category: form.category,
            };
            await updateService({ id: editingId, data: updateData }).unwrap();
            setMsg("Service updated successfully!");
            resetForm();
        } catch (err: unknown) {
            const e = err as { data?: { message?: string } };
            setErrMsg(e.data?.message ?? "Failed to update service");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        try {
            await deleteService(id).unwrap();
            setMsg("Service deleted successfully!");
        } catch (err: unknown) {
            const e = err as { data?: { message?: string } };
            setErrMsg(e.data?.message ?? "Failed to delete service");
        }
    };

    const startEditing = (service: IService) => {
        setEditingId(service._id);
        setForm({
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
            organizationId: orgId,
            category: service.category ?? "",
        });
        setShowForm(true);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Manage Services
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Create and manage services offered by your organization.
                    </p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", description: "", price: 0, duration: 30, organizationId: "", category: "" }); }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                    >
                        + Add Service
                    </button>
                )}
            </div>

            {msg && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 text-green-700 dark:text-green-400 text-sm">
                    ✓ {msg}
                </div>
            )}
            {errMsg && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm">
                    {errMsg}
                </div>
            )}

            {showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {editingId ? "Edit Service" : "Create New Service"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Service Name *
                            </label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Haircut"
                                className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Category
                            </label>
                            <input
                                value={form.category ?? ""}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                placeholder="e.g. Hair"
                                className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Price (₹) *
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                                className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Duration (minutes) *
                            </label>
                            <input
                                type="number"
                                min={5}
                                step={5}
                                value={form.duration}
                                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                                className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description *
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={2}
                            placeholder="Brief description of this service..."
                            className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={editingId ? handleUpdate : handleCreate}
                            disabled={isCreating || !form.name || !form.description || !form.price || !form.duration}
                            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50"
                        >
                            {isCreating ? "Saving..." : editingId ? "Update Service" : "Create Service"}
                        </button>
                        <button
                            onClick={resetForm}
                            className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="grid gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : !services?.length ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    No services yet. Click "+ Add Service" to create one.
                </div>
            ) : (
                <div className="grid gap-4">
                    {services.map((svc) => (
                        <div
                            key={svc._id}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {svc.name}
                                        </h3>
                                        {svc.category && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                                                {svc.category}
                                            </span>
                                        )}
                                        {!svc.isActive && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {svc.description}
                                    </p>
                                    <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                                        <span>₹{svc.price}</span>
                                        <span>{svc.duration} min</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEditing(svc)}
                                        className="px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(svc._id)}
                                        className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
