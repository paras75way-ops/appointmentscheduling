import { useState, useEffect } from "react";
import {
    useGetReschedulePolicyQuery,
    useUpsertReschedulePolicyMutation,
} from "../store/api/authApi";

export default function ReschedulePolicy() {
    const { data: policy, isLoading } = useGetReschedulePolicyQuery();
    const [upsert, { isLoading: saving }] = useUpsertReschedulePolicyMutation();

    const [minHoursBefore, setMinHoursBefore] = useState(24);
    const [maxReschedules, setMaxReschedules] = useState(2);
    const [penaltyLastMinute, setPenaltyLastMinute] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (policy) {
            setMinHoursBefore(policy.minHoursBefore);
            setMaxReschedules(policy.maxReschedules);
            setPenaltyLastMinute(policy.penaltyLastMinute);
        }
    }, [policy]);

    const handleSave = async () => {
        try {
            setError("");
            setMessage("");
            await upsert({ minHoursBefore, maxReschedules, penaltyLastMinute }).unwrap();
            setMessage("Policy saved successfully");
        } catch (err: unknown) {
            const e = err as { data?: { message?: string } };
            setError(e.data?.message || "Failed to save policy");
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-lg mx-auto space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Reschedule Policy
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Configure reschedule rules for your organization.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Minimum hours before appointment
                    </label>
                    <input
                        type="number"
                        min={0}
                        value={minHoursBefore}
                        onChange={(e) => setMinHoursBefore(Number(e.target.value))}
                        className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Users cannot reschedule if fewer than this many hours remain.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Maximum reschedules per appointment
                    </label>
                    <input
                        type="number"
                        min={0}
                        value={maxReschedules}
                        onChange={(e) => setMaxReschedules(Number(e.target.value))}
                        className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Set to 0 to disallow rescheduling entirely.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={penaltyLastMinute}
                        onClick={() => setPenaltyLastMinute(!penaltyLastMinute)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${penaltyLastMinute
                            ? "bg-indigo-600"
                            : "bg-gray-300 dark:bg-gray-600"
                            }`}
                    >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition-transform duration-200 ${penaltyLastMinute ? "translate-x-5" : "translate-x-0"
                                }`}
                        />
                    </button>
                    <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Penalty for last-minute reschedules
                        </span>
                        <p className="text-xs text-gray-400">
                            Flag a warning when rescheduling within half the minimum-hours window.
                        </p>
                    </div>
                </div>

                {message && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                        {message}
                    </p>
                )}
                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
                    >
                        {saving ? "Saving…" : "Save Policy"}
                    </button>
                </div>
            </div>
        </div>
    );
}
