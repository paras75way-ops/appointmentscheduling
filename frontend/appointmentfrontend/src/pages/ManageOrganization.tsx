import { useState } from "react";
import {
    useGetMyOrganizationQuery,
    useUpdateOrganizationMutation,
} from "../store/api/authApi";

const ORG_TYPE_LABELS: Record<string, string> = {
    clinic: "Clinic",
    salon: "Salon",
    service_provider: "Service Provider",
    coworking_space: "Coworking Space",
};

export default function ManageOrganization() {
    const { data: org, isLoading, error } = useGetMyOrganizationQuery();
    const [updateOrg, { isLoading: isUpdating }] =
        useUpdateOrganizationMutation();

    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [message, setMessage] = useState<string | null>(null);

    const startEdit = () => {
        if (org) {
            setName(org.name);
            setType(org.type);
            setEditMode(true);
            setMessage(null);
        }
    };

    const handleSave = async () => {
        if (!org) return;
        try {
            await updateOrg({
                id: org._id,
                data: {
                    name,
                    type: type as "clinic" | "salon" | "service_provider" | "coworking_space",
                },
            }).unwrap();
            setEditMode(false);
            setMessage("Organization updated successfully");
        } catch (err: unknown) {
            setMessage(err instanceof Error ? err.message : "Update failed");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading organization...</p>
            </div>
        );
    }

    if (error || !org) {
        return (
            <div className="text-center text-red-500 mt-10">
                Failed to load organization data.
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manage Organization
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                {!editMode ? (
                    <>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Organization Name
                            </p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                {org.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                {ORG_TYPE_LABELS[org.type] || org.type}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Staff Members
                            </p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                {org.staff?.length || 0}
                            </p>
                        </div>

                        <button
                            onClick={startEdit}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            Edit Organization
                        </button>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                                Organization Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                                Organization Type
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            >
                                <option value="clinic">Clinic</option>
                                <option value="salon">Salon</option>
                                <option value="service_provider">Service Provider</option>
                                <option value="coworking_space">Coworking Space</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                onClick={() => setEditMode(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                )}

                {message && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
