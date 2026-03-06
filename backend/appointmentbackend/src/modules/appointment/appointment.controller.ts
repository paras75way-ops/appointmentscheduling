import { Response } from "express";
import { AuthRequest } from "../../middleware/rbac.middleware";
import * as apptService from "./appointment.service";

export const getOrganizationStaff = async (req: AuthRequest, res: Response) => {
    try {
        const { organizationId } = req.params;
        const staff = await apptService.getOrganizationStaff(organizationId as string);
        return res.json(staff);
    } catch (err: unknown) {
        return res.status(400).json({
            message: err instanceof Error ? err.message : "Error",
        });
    }
};

export const getAvailableSlots = async (req: AuthRequest, res: Response) => {
    try {
        const { organizationId, staffId } = req.params;
        const { date } = req.query;

        if (!date || typeof date !== "string") {
            return res
                .status(400)
                .json({ message: 'Query param "date" is required (YYYY-MM-DD)' });
        }

        const slots = await apptService.getAvailableSlots({
            organizationId: organizationId as string,
            staffId: staffId as string,
            date,
        });

        return res.json({ date, slots });
    } catch (err: unknown) {
        return res.status(400).json({
            message: err instanceof Error ? err.message : "Error",
        });
    }
};

export const bookAppointment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { organizationId, staffId, startTimeUtc, notes } = req.body as {
            organizationId: string;
            staffId: string;
            startTimeUtc: string;
            notes?: string;
        };

        if (!organizationId || !staffId || !startTimeUtc) {
            return res.status(400).json({
                message: "organizationId, staffId, and startTimeUtc are required",
            });
        }

        const appointment = await apptService.bookAppointment({
            organizationId,
            staffId,
            userId,
            startTimeUtc,
            notes,
        });

        return res.status(201).json(appointment);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to book appointment";
        return res.status(400).json({ message });
    }
};

export const cancelAppointment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role ?? "";
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const result = await apptService.cancelAppointment(
            req.params.id as string,
            userId,
            role
        );
        return res.json(result);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to cancel appointment";
        return res.status(400).json({ message });
    }
};

export const rescheduleAppointment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role ?? "";
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { startTimeUtc, notes } = req.body as { startTimeUtc: string; notes?: string; };
        if (!startTimeUtc) {
            return res.status(400).json({ message: "startTimeUtc is required" });
        }

        const appointment = await apptService.rescheduleAppointment(
            req.params.id as string,
            userId,
            role,
            startTimeUtc,
            notes
        );
        return res.json(appointment);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to reschedule appointment";
        return res.status(400).json({ message });
    }
};

export const getMyAppointments = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const history = req.query.history === "true";
        const appointments = await apptService.getUserAppointments(userId, !history);
        return res.json(appointments);
    } catch (err: unknown) {
        return res.status(400).json({
            message: err instanceof Error ? err.message : "Error",
        });
    }
};

export const getMyStaffAppointments = async (req: AuthRequest, res: Response) => {
    try {
        const staffId = req.user?.id;
        if (!staffId) return res.status(401).json({ message: "Unauthorized" });
        const { date } = req.query;
        const appointments = await apptService.getStaffAppointments(
            staffId,
            typeof date === "string" ? date : undefined
        );
        return res.json(appointments);
    } catch (err: unknown) {
        return res.status(400).json({
            message: err instanceof Error ? err.message : "Error",
        });
    }
};

export const getOrganizationAppointments = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId) {
            return res
                .status(400)
                .json({ message: "Admin has no associated organization" });
        }
        const { date, upcoming } = req.query;
        const appointments = await apptService.getOrganizationAppointments(
            orgId,
            typeof date === "string" ? date : undefined,
            upcoming === "true"
        );
        return res.json(appointments);
    } catch (err: unknown) {
        return res.status(400).json({
            message: err instanceof Error ? err.message : "Error",
        });
    }
};

export const getReschedulePolicyHandler = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId) {
            return res
                .status(400)
                .json({ message: "Admin has no associated organization" });
        }
        const policy = await apptService.getReschedulePolicy(orgId);
        return res.json(policy);
    } catch (err: unknown) {
        return res.status(400).json({
            message: err instanceof Error ? err.message : "Error",
        });
    }
};

export const upsertReschedulePolicyHandler = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId) {
            return res
                .status(400)
                .json({ message: "Admin has no associated organization" });
        }
        const { minHoursBefore, maxReschedules, penaltyLastMinute } = req.body as {
            minHoursBefore?: number;
            maxReschedules?: number;
            penaltyLastMinute?: boolean;
        };
        const policy = await apptService.upsertReschedulePolicy(orgId, {
            minHoursBefore,
            maxReschedules,
            penaltyLastMinute,
        });
        return res.json(policy);
    } catch (err: unknown) {
        return res.status(400).json({
            message: err instanceof Error ? err.message : "Error",
        });
    }
};
