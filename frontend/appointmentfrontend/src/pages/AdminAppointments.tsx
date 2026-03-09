import { useState } from "react";
import { useGetAdminAppointmentsQuery, useCancelAppointmentMutation } from "../store/api/authApi";
import type { IAppointment } from "../types/auth";
import { utcIsoToLocalTime, utcIsoToLocalDate } from "../utils/timezone";

function getPopulated<T extends { _id: string; name: string; email?: string }>(
    val: string | T
): T | null {
    if (typeof val === "object" && "_id" in val) return val;
    return null;
}

const STATUS_COLORS: Record<string, string> = {
    booked: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
    completed: "bg-blue-100 text-blue-700",
};

export default function AdminAppointments() {
    const [date, setDate] = useState("");
    const { data: appointments, isLoading } = useGetAdminAppointmentsQuery(
        date || undefined
    );
    const [cancel] = useCancelAppointmentMutation();
    const [message, setMessage] = useState("");

    const handleCancel = async (id: string) => {
        if (!confirm("Cancel this appointment?")) return;
        try {
            const r = await cancel(id).unwrap();
            setMessage(r.message);
        } catch {
            setMessage("Failed to cancel");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        All Appointments
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Showing all past and upcoming appointments — newest first.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Filter by date:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="p-2 rounded-lg border dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
                    />
                    {date && (
                        <button
                            onClick={() => setDate("")}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}

            {isLoading ? (
                <p className="text-gray-500">Loading appointments...</p>
            ) : !appointments?.length ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500">
                    No appointments found.
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            <tr>
                                <th className="text-left p-3 font-medium">Date (local)</th>
                                <th className="text-left p-3 font-medium">Time (local)</th>
                                <th className="text-left p-3 font-medium">Service</th>
                                <th className="text-left p-3 font-medium">Staff</th>
                                <th className="text-left p-3 font-medium">User</th>
                                <th className="text-left p-3 font-medium">Status</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            {appointments.map((appt: IAppointment) => {
                                const staff = getPopulated(appt.staffId);
                                const user = getPopulated(appt.userId);
                                const service = appt.serviceId && typeof appt.serviceId === "object" ? appt.serviceId : null;
                                const isPast = new Date(appt.startTime).getTime() < Date.now();
                                return (
                                    <tr key={appt._id} className={`transition hover:bg-gray-50 dark:hover:bg-gray-750 ${isPast ? "opacity-60" : ""}`}>
                                        <td className="p-3 text-gray-700 dark:text-gray-300">
                                            {utcIsoToLocalDate(appt.startTime)}
                                        </td>
                                        <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">
                                            {utcIsoToLocalTime(appt.startTime)} – {utcIsoToLocalTime(appt.endTime)}
                                        </td>
                                        <td className="p-3 text-indigo-600 dark:text-indigo-400">{service?.name ?? "—"}</td>
                                        <td className="p-3 text-gray-700 dark:text-gray-300">{staff?.name ?? "—"}</td>
                                        <td className="p-3 text-gray-700 dark:text-gray-300">{user?.name ?? "—"}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[appt.status] ?? "bg-gray-100 text-gray-500"}`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            {appt.status === "booked" && !isPast && (
                                                <button
                                                    onClick={() => handleCancel(appt._id)}
                                                    className="text-xs text-red-600 hover:underline"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
