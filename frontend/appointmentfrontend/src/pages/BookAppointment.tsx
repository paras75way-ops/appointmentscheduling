import { useState } from "react";
import {
    useGetOrganizationStaffQuery,
    useGetAvailableSlotsQuery,
    useBookAppointmentMutation,
} from "../store/api/authApi";
import type { IUtcSlot } from "../types/auth";
import { useRouteLoaderData } from "react-router";
import type { IUser } from "../types/auth";
import { utcIsoToLocalTime } from "../utils/timezone";

export default function BookAppointment() {
    const user = useRouteLoaderData("private-layout") as IUser;
    const orgId = user.organizationId ?? "";

    const [selectedStaffId, setSelectedStaffId] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState<IUtcSlot | null>(null);
    const [notes, setNotes] = useState("");
    const [success, setSuccess] = useState("");
    const [apiError, setApiError] = useState("");

    const { data: staffList, isLoading: staffLoading } =
        useGetOrganizationStaffQuery(orgId, { skip: !orgId });

    const { data: slotsData, isFetching: slotsLoading } = useGetAvailableSlotsQuery(
        { organizationId: orgId, staffId: selectedStaffId, date: selectedDate },
        { skip: !orgId || !selectedStaffId || !selectedDate }
    );

    const [bookAppointment, { isLoading: isBooking }] = useBookAppointmentMutation();

    const handleBook = async () => {
        if (!selectedSlot) return;
        try {
            setApiError("");
            setSuccess("");
            await bookAppointment({
                organizationId: orgId,
                staffId: selectedStaffId,
                startTimeUtc: selectedSlot.startTimeUtc,
                notes,
            }).unwrap();
            setSuccess("Appointment booked successfully!");
            setSelectedSlot(null);
            setNotes("");
        } catch (err: unknown) {
            const e = err as { data?: { message?: string } };
            setApiError(e.data?.message ?? "Failed to book appointment");
        }
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Book an Appointment
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-5">

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        1. Select Staff Member
                    </label>
                    {staffLoading ? (
                        <p className="text-sm text-gray-500">Loading staff...</p>
                    ) : (
                        <select
                            value={selectedStaffId}
                            onChange={(e) => { setSelectedStaffId(e.target.value); setSelectedSlot(null); }}
                            className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        >
                            <option value="">Select a staff member</option>
                            {staffList?.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.name} — {s.email}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {selectedStaffId && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            2. Select Date
                        </label>
                        <input
                            type="date"
                            min={today}
                            value={selectedDate}
                            onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
                            className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                    </div>
                )}

                {selectedDate && selectedStaffId && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            3. Select Time Slot
                            <span className="ml-1 text-xs text-gray-400 font-normal">(your local time)</span>
                        </label>
                        {slotsLoading ? (
                            <p className="text-sm text-gray-500">Fetching available slots...</p>
                        ) : !slotsData?.slots?.length ? (
                            <p className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                No available slots for this date. Try another day.
                            </p>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {slotsData.slots.map((slot) => (
                                    <button
                                        key={slot.startTimeUtc}
                                        type="button"
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${selectedSlot?.startTimeUtc === slot.startTimeUtc
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-indigo-400"
                                            }`}
                                    >
                                        {utcIsoToLocalTime(slot.startTimeUtc)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {selectedSlot && (
                    <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                            Selected: {utcIsoToLocalTime(selectedSlot.startTimeUtc)} – {utcIsoToLocalTime(selectedSlot.endTimeUtc)} on {selectedDate}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Notes (optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                placeholder="Any notes for your appointment..."
                                className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
                            />
                        </div>
                        <button
                            onClick={handleBook}
                            disabled={isBooking}
                            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {isBooking ? "Booking..." : "Confirm Booking"}
                        </button>
                    </div>
                )}

                {success && <p className="text-sm text-green-600 dark:text-green-400 font-medium">{success}</p>}
                {apiError && <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>}
            </div>
        </div>
    );
}
