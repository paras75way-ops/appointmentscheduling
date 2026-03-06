export interface TimeSlot {
    startTime: string;
    endTime: string;
}

export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

export function minutesToTime(total: number): string {
    const h = Math.floor(total / 60).toString().padStart(2, "0");
    const m = (total % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
}

export function generateSlotsForDay(
    openTime: string,
    closeTime: string,
    slotDuration: number
): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const start = timeToMinutes(openTime);
    const end = timeToMinutes(closeTime);

    let current = start;
    while (current + slotDuration <= end) {
        slots.push({
            startTime: minutesToTime(current),
            endTime: minutesToTime(current + slotDuration),
        });
        current += slotDuration;
    }

    return slots;
}
