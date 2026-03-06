import { useState } from "react";
import {
    useGetMyAppointmentsQuery,
    useCancelAppointmentMutation,
    useRescheduleAppointmentMutation,
    useGetAvailableSlotsQuery
} from "../store/api/authApi";
import type { IAppointment, IUtcSlot } from "../types/auth";
import { utcIsoToLocalTime, utcIsoToLocalDate } from "../utils/timezone";

type Tab = "upcoming" | "history";

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
    rescheduled: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
};

function RescheduleModal({ appointment, onClose }: { appointment: IAppointment, onClose: () => void }) {
    const orgId = typeof appointment.organizationId === "object" ? appointment.organizationId._id : appointment.organizationId;
    const staffId = typeof appointment.staffId === "object" ? appointment.staffId._id : appointment.staffId;

    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState<IUtcSlot | null>(null);
    const [notes, setNotes] = useState(appointment.notes || "");
    const [apiError, setApiError] = useState("");

    const { data: slotsData, isFetching: slotsLoading } = useGetAvailableSlotsQuery(
        { organizationId: orgId, staffId: staffId, date: selectedDate },
        { skip: !selectedDate }
    );

    const [reschedule, { isLoading }] = useRescheduleAppointmentMutation();

    const handleReschedule = async () => {
        if (!selectedSlot) return;
        try {
            setApiError("");
            await reschedule({
                id: appointment._id,
                startTimeUtc: selectedSlot.startTimeUtc,
                notes
            }).unwrap();
            onClose();
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            setApiError(error.data?.message || "Failed to reschedule");
        }
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Reschedule Appointment</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Date</label>
                        <input
                            type="date"
                            min={today}
                            value={selectedDate}
                            onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
                            className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                    </div>

                    {selectedDate && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Time Slot</label>
                            {slotsLoading ? (
                                <p className="text-sm text-gray-500">Fetching slots...</p>
                            ) : !slotsData?.slots?.length ? (
                                <p className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">No slots available on this date.</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {slotsData.slots.map(slot => (
                                        <button
                                            key={slot.startTimeUtc}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`px-3 py-2 text-sm font-medium rounded-lg border transition ${selectedSlot?.startTimeUtc === slot.startTimeUtc ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-indigo-400"}`}
                                        >
                                            {utcIsoToLocalTime(slot.startTimeUtc)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedSlot && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
                            />
                        </div>
                    )}

                    {apiError && <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>}

                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">Cancel</button>
                        <button onClick={handleReschedule} disabled={!selectedSlot || isLoading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50">
                            {isLoading ? "Saving..." : "Confirm"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MyAppointments() {
    const [tab, setTab] = useState<Tab>("upcoming");

    const { data: appointments, isLoading } = useGetMyAppointmentsQuery(tab === "history");
    const [cancel] = useCancelAppointmentMutation();
    const [message, setMessage] = useState("");
    const [rescheduleAppt, setRescheduleAppt] = useState<IAppointment | null>(null);

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Appointments
            </h1>

            <div className="flex border-b border-gray-200 dark:border-gray-700">
                {(["upcoming", "history"] as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => { setTab(t); setMessage(""); }}
                        className={`px-5 py-2.5 text-sm font-medium border-b-2 transition capitalize ${tab === t
                            ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : !appointments?.length ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500">
                    {tab === "upcoming"
                        ? "No upcoming appointments. Browse organizations to book one!"
                        : "No appointment history yet."}
                </div>
            ) : (
                <div className="space-y-3">
                    {appointments.map((appt: IAppointment) => {
                        const staff = getPopulated(appt.staffId);
                        const org = typeof appt.organizationId === "object" ? appt.organizationId : null;
                        const isPast = new Date(appt.startTime).getTime() < Date.now();
                        return (
                            <div
                                key={appt._id}
                                className={`bg-white dark:bg-gray-800 rounded-xl border p-4 shadow-sm flex items-start justify-between transition ${isPast
                                    ? "border-gray-100 dark:border-gray-700 opacity-70"
                                    : "border-gray-200 dark:border-gray-700"
                                    }`}
                            >
                                <div className="space-y-1">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {utcIsoToLocalTime(appt.startTime)} – {utcIsoToLocalTime(appt.endTime)}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {utcIsoToLocalDate(appt.startTime)}
                                    </p>
                                    {staff && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Staff: {staff.name}
                                        </p>
                                    )}
                                    {org && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                            {org.name} ({org.type.replace(/_/g, " ")})
                                        </p>
                                    )}
                                    {appt.previousStartTime && (
                                        <p className="text-xs text-gray-400">
                                            Previous: {utcIsoToLocalDate(appt.previousStartTime)} at {utcIsoToLocalTime(appt.previousStartTime)}
                                        </p>
                                    )}
                                    {appt.notes && (
                                        <p className="text-xs text-gray-400 italic">{appt.notes}</p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[appt.status] ?? "bg-gray-100 text-gray-500"}`}>
                                        {appt.status}
                                    </span>
                                    {(appt.status === "booked" || appt.status === "rescheduled") && !isPast && (
                                        <div className="flex flex-col items-end gap-1">
                                            <button
                                                onClick={() => setRescheduleAppt(appt)}
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                Reschedule
                                            </button>
                                            <button
                                                onClick={() => handleCancel(appt._id)}
                                                className="text-xs text-red-600 hover:underline"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {rescheduleAppt && (
                <RescheduleModal
                    appointment={rescheduleAppt}
                    onClose={() => setRescheduleAppt(null)}
                />
            )}
        </div>
    );
}
