import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    useGetStaffQuery,
    useAddStaffMutation,
    useRemoveStaffMutation,
    useGetMyOrganizationQuery,
    useGetServicesByOrganizationQuery,
    useAssignServiceToStaffMutation,
    useRemoveServiceFromStaffMutation,
} from "../store/api/authApi";
import type { IAddStaffForm, IStaffMember, IService } from "../types/auth";

interface StaffWithServices extends IStaffMember {
    services?: { _id: string; name: string }[];
}

export default function ManageStaff() {
    const { data: org } = useGetMyOrganizationQuery();
    const orgId = org?._id ?? "";

    const { data: staffList, isLoading } = useGetStaffQuery();
    const { data: orgServices } = useGetServicesByOrganizationQuery(orgId, {
        skip: !orgId,
    });

    const [addStaff, { isLoading: isAdding }] = useAddStaffMutation();
    const [removeStaff] = useRemoveStaffMutation();
    const [assignService] = useAssignServiceToStaffMutation();
    const [removeService] = useRemoveServiceFromStaffMutation();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<IAddStaffForm>();

    const [message, setMessage] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [expandedStaff, setExpandedStaff] = useState<string | null>(null);

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

    const handleAssignService = async (staffId: string, serviceId: string) => {
        try {
            setErrorMsg(null);
            const result = await assignService({ staffId, serviceId }).unwrap();
            setMessage(result.message);
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            setErrorMsg(error.data?.message || "Failed to assign service");
        }
    };

    const handleRemoveService = async (staffId: string, serviceId: string) => {
        try {
            setErrorMsg(null);
            const result = await removeService({ staffId, serviceId }).unwrap();
            setMessage(result.message);
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            setErrorMsg(error.data?.message || "Failed to remove service");
        }
    };

    const getStaffServices = (staff: StaffWithServices): { _id: string; name: string }[] => {
        return staff.services ?? [];
    };

    const getUnassignedServices = (staff: StaffWithServices): IService[] => {
        const assignedIds = new Set(getStaffServices(staff).map((s) => s._id));
        return (orgServices ?? []).filter((svc) => !assignedIds.has(svc._id));
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manage Staff
            </h1>


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
                        {(staffList as StaffWithServices[]).map((staff) => (
                            <div
                                key={staff._id}
                                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {staff.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {staff.email}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                setExpandedStaff(
                                                    expandedStaff === staff._id ? null : staff._id
                                                )
                                            }
                                            className="px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
                                        >
                                            {expandedStaff === staff._id ? "Hide Services" : "Manage Services"}
                                        </button>
                                        <button
                                            onClick={() => handleRemove(staff._id)}
                                            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                {expandedStaff === staff._id && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-3">

                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                                Assigned Services
                                            </p>
                                            {getStaffServices(staff).length === 0 ? (
                                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                                    No services assigned yet.
                                                </p>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {getStaffServices(staff).map((svc) => (
                                                        <span
                                                            key={svc._id}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                                                        >
                                                            {svc.name}
                                                            <button
                                                                onClick={() =>
                                                                    handleRemoveService(staff._id, svc._id)
                                                                }
                                                                className="ml-1 text-indigo-400 hover:text-red-500 transition"
                                                                title="Remove"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>


                                        {getUnassignedServices(staff).length > 0 && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                                    Assign a Service
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {getUnassignedServices(staff).map((svc) => (
                                                        <button
                                                            key={svc._id}
                                                            onClick={() =>
                                                                handleAssignService(staff._id, svc._id)
                                                            }
                                                            className="px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                                                        >
                                                            + {svc.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {!orgServices?.length && (
                                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                                No services created yet. Create services first in Manage Services.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
