const IST_TZ = "Asia/Kolkata";
const IST_LOCALE = "en-IN";

export function utcIsoToLocalTime(utcIso: string): string {
    return new Date(utcIso).toLocaleTimeString(IST_LOCALE, {
        timeZone: IST_TZ,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export function utcIsoToLocalDateTime(utcIso: string): string {
    return new Date(utcIso).toLocaleString(IST_LOCALE, {
        timeZone: IST_TZ,
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export function utcIsoToLocalDate(utcIso: string): string {
    return new Date(utcIso).toLocaleDateString(IST_LOCALE, {
        timeZone: IST_TZ,
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function todayIstDateStr(): string {
    return new Date().toLocaleDateString("en-CA", { timeZone: IST_TZ });
}

export function isInFuture(utcIso: string): boolean {
    return new Date(utcIso).getTime() > Date.now();
}

export function istSlotToUtcIso(date: string, slotHHmm: string): string {
    return new Date(`${date}T${slotHHmm}:00.000+05:30`).toISOString();
}
