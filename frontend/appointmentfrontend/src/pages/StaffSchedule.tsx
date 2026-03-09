import { useState } from "react";
import { useGetStaffScheduleQuery, useCancelAppointmentMutation } from "../store/api/authApi";
import type { IAppointment } from "../types/auth";
import { utcIsoToLocalTime, utcIsoToLocalDate } from "../utils/timezone";

function getPopulated<T extends { _id: string; name: string; email: string }>(
    val: string | T
): T | null {
    if (typeof val === "object" && "_id" in val) return val;
    return null;
}

export default function StaffSchedule() {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const { data: appointments, isLoading } = useGetStaffScheduleQuery(date);
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
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Schedule</h1>

            <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by date (UTC):</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="p-2 rounded-lg border dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
            </div>

            {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}

            {isLoading ? (
                <p className="text-gray-500">Loading schedule...</p>
            ) : !appointments?.length ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-500">
                    No appointments scheduled for {date} (UTC).
                </div>
            ) : (
                <div className="space-y-3">
                    {appointments.map((appt: IAppointment) => {
                        const user = getPopulated(appt.userId);
                        const service = appt.serviceId && typeof appt.serviceId === "object" ? appt.serviceId : null;
                        return (
                            <div
                                key={appt._id}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm"
                            >
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {utcIsoToLocalTime(appt.startTime)} – {utcIsoToLocalTime(appt.endTime)}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {utcIsoToLocalDate(appt.startTime)}
                                    </p>
                                    {service && (
                                        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                                            {service.name} · {service.duration}min
                                        </p>
                                    )}
                                    {user && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {user.name} ({user.email})
                                        </p>
                                    )}
                                    {appt.notes && (
                                        <p className="text-xs text-gray-400 mt-1 italic">{appt.notes}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${appt.status === "booked" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                        }`}>
                                        {appt.status}
                                    </span>
                                    {appt.status === "booked" && (
                                        <button
                                            onClick={() => handleCancel(appt._id)}
                                            className="text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
