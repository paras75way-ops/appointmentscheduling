import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
    useGetBusinessHoursQuery,
    useUpsertBusinessHoursMutation,
    useGetMyOrganizationQuery,
} from "../store/api/authApi";
import type { IDaySchedule, DayOfWeek } from "../types/auth";

const ALL_DAYS: DayOfWeek[] = [
    "monday", "tuesday", "wednesday", "thursday",
    "friday", "saturday", "sunday",
];

interface FormData {
    slotDuration: number;
    schedule: IDaySchedule[];
}

const defaultSchedule: IDaySchedule[] = ALL_DAYS.map((day) => ({
    day,
    isOpen: day !== "saturday" && day !== "sunday",
    openTime: "09:00",
    closeTime: "17:00",
}));

export default function BusinessHoursConfig() {
    const { data: org } = useGetMyOrganizationQuery();
    const orgId = org?._id ?? "";

    const { data: existing } = useGetBusinessHoursQuery(orgId, { skip: !orgId });
    const [upsert, { isLoading }] = useUpsertBusinessHoursMutation();

    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { register, control, handleSubmit, watch, reset, formState: { errors } } =
        useForm<FormData>({
            defaultValues: {
                slotDuration: existing?.slotDuration ?? 30,
                schedule: existing?.schedule ?? defaultSchedule,
            },
        });

    useEffect(() => {
        if (existing) {
            reset({
                slotDuration: existing.slotDuration,
                schedule: existing.schedule,
            });
        }
    }, [existing, reset]);

    const { fields } = useFieldArray({ control, name: "schedule" });
    const scheduleValues = watch("schedule");

    const onSubmit = async (data: FormData) => {
        try {
            setMessage(null);
            setError(null);
            await upsert({ ...data, organizationId: orgId }).unwrap();
            setMessage("Business hours saved successfully");
        } catch (err: unknown) {
            const e = err as { data?: { message?: string } };
            setError(e.data?.message ?? "Failed to save");
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Business Hours Configuration
            </h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5 shadow-sm"
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Slot Duration (minutes)
                    </label>
                    <input
                        type="number"
                        min={5}
                        step={5}
                        {...register("slotDuration", {
                            required: "Required",
                            min: { value: 5, message: "Minimum 5 minutes" },
                        })}
                        className="w-32 p-2 rounded-lg border dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                    {errors.slotDuration && (
                        <p className="text-red-500 text-xs mt-1">{errors.slotDuration.message}</p>
                    )}
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Weekly Schedule
                    </p>
                    {fields.map((field, i) => (
                        <div
                            key={field.id}
                            className="grid grid-cols-[120px_80px_1fr_1fr] items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                        >
                            <span className="capitalize text-sm font-medium text-gray-700 dark:text-gray-200">
                                {scheduleValues[i]?.day}
                            </span>

                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register(`schedule.${i}.isOpen`)}
                                    className="rounded"
                                />
                                Open
                            </label>

                            <div>
                                <input
                                    type="time"
                                    {...register(`schedule.${i}.openTime`, { required: true })}
                                    disabled={!scheduleValues[i]?.isOpen}
                                    className="w-full p-2 rounded border dark:bg-gray-600 border-gray-300 dark:border-gray-500 disabled:opacity-40"
                                />
                            </div>
                            <div>
                                <input
                                    type="time"
                                    {...register(`schedule.${i}.closeTime`, { required: true })}
                                    disabled={!scheduleValues[i]?.isOpen}
                                    className="w-full p-2 rounded border dark:bg-gray-600 border-gray-300 dark:border-gray-500 disabled:opacity-40"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    {isLoading ? "Saving..." : "Save Business Hours"}
                </button>

                {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}
                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            </form>
        </div>
    );
}
