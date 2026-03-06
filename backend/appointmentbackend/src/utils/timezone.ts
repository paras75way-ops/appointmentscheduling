export const IST_TIMEZONE = "Asia/Kolkata";
const IST_OFFSET_MINUTES = 330;
const IST_OFFSET_MS = IST_OFFSET_MINUTES * 60 * 1000;

export function buildUtcFromIst(dateStr: string, hhmmIst: string): Date {
    return new Date(`${dateStr}T${hhmmIst}:00.000+05:30`);
}

export function utcToIstHHmm(utcDate: Date): string {
    const istMs = utcDate.getTime() + IST_OFFSET_MS;
    const istDate = new Date(istMs);
    const h = istDate.getUTCHours().toString().padStart(2, "0");
    const m = istDate.getUTCMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
}

export function formatUtcAsIst(
    utcDate: Date,
    format: "time" | "date" | "datetime"
): string {
    const base: Intl.DateTimeFormatOptions = { timeZone: IST_TIMEZONE };

    if (format === "time") {
        return utcDate.toLocaleString("en-IN", {
            ...base,
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    }

    if (format === "date") {
        return utcDate.toLocaleString("en-IN", {
            ...base,
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    return utcDate.toLocaleString("en-IN", {
        ...base,
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export function nowIstDateStr(): string {
    return new Date().toLocaleDateString("en-CA", { timeZone: IST_TIMEZONE });
}
