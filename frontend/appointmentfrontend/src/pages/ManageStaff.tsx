import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    useGetStaffQuery,
    useAddStaffMutation,
    useRemoveStaffMutation,
} from "../store/api/authApi";
import type { IAddStaffForm } from "../types/auth";

export default function ManageStaff() {
    const { data: staffList, isLoading } = useGetStaffQuery();
    const [addStaff, { isLoading: isAdding }] = useAddStaffMutation();
    const [removeStaff] = useRemoveStaffMutation();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<IAddStaffForm>();

    const [message, setMessage] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const onSubmit = async (data: IAddStaffForm) => {
        try {
            setMessage(null);
            setErrorMsg(null);
            const result = await addStaff(data).unwrap();
            setMessage(result.message);
            reset();
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            setErrorMsg(error.data?.message || "Failed to add staff");
        }
    };

    const handleRemove = async (staffId: string) => {
        if (!confirm("Are you sure you want to remove this staff member?")) return;
        try {
            setMessage(null);
            setErrorMsg(null);
            const result = await removeStaff(staffId).unwrap();
            setMessage(result.message);
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            setErrorMsg(error.data?.message || "Failed to remove staff");
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manage Staff
            </h1>

            {/* Add Staff Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Add Staff Member
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                                Name
                            </label>
                            <input
                                type="text"
                                {...register("name", { required: "Name is required" })}
                                className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                placeholder="Staff name"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                                Email
                            </label>
                            <input
                                type="email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: "Invalid email",
                                    },
                                })}
                                className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                placeholder="staff@example.com"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <input
                            type="password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: { value: 6, message: "Minimum 6 characters" },
                            })}
                            className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            placeholder="Initial password for staff"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isAdding}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {isAdding ? "Adding..." : "Add Staff"}
                    </button>
                </form>

                {message && (
                    <p className="mt-3 text-sm text-green-600 dark:text-green-400">
                        {message}
                    </p>
                )}
                {errorMsg && (
                    <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                        {errorMsg}
                    </p>
                )}
            </div>

            {/* Staff List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Current Staff ({staffList?.length || 0})
                </h2>

                {isLoading ? (
                    <p className="text-gray-500">Loading staff...</p>
                ) : !staffList || staffList.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">
                        No staff members yet. Add one above.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {staffList.map((staff) => (
                            <div
                                key={staff._id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {staff.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {staff.email}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRemove(staff._id)}
                                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
