import { Response } from "express";
import { AuthRequest } from "../../middleware/rbac.middleware";
import * as apptService from "./appointment.service";


const asString = (value: unknown, name: string): string => {
  if (!value) throw new Error(`${name} is required`);
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  throw new Error(`${name} must be a string`);
};


export const getOrganizationStaff = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = asString(req.params.organizationId, "organizationId");
    const staff = await apptService.getOrganizationStaff(organizationId);
    return res.json(staff);
  } catch (err: unknown) {
    return res.status(400).json({ message: err instanceof Error ? err.message : "Error" });
  }
};

export const getAvailableSlots = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = asString(req.params.organizationId, "organizationId");
    const staffId = asString(req.params.staffId, "staffId");
    const date = asString(req.query.date, "date");
    const serviceId = req.query.serviceId as string | undefined;

    const slots = await apptService.getAvailableSlots({ organizationId, staffId, date, serviceId });
    return res.json({ date, slots });
  } catch (err: unknown) {
    return res.status(400).json({ message: err instanceof Error ? err.message : "Error" });
  }
};


export const bookAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { organizationId, staffId, serviceId, startTimeUtc, notes } = req.body as {
      organizationId: string;
      staffId: string;
      serviceId: string;
      startTimeUtc: string;
      notes?: string;
    };

    if (!organizationId || !staffId || !serviceId || !startTimeUtc) {
      return res.status(400).json({
        message: "organizationId, staffId, serviceId, and startTimeUtc are required",
      });
    }

    const appointment = await apptService.bookAppointment({
      organizationId,
      staffId,
      userId,
      serviceId,
      startTimeUtc,
      notes,
    });

    return res.status(201).json(appointment);
  } catch (err: unknown) {
    return res.status(400).json({ message: err instanceof Error ? err.message : "Failed to book appointment" });
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role ?? "";
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const appointmentId = asString(req.params.id, "appointmentId");
    const result = await apptService.cancelAppointment(appointmentId, userId, role);

    return res.json(result);
  } catch (err: unknown) {
    return res.status(400).json({ message: err instanceof Error ? err.message : "Failed to cancel appointment" });
  }
};

export const rescheduleAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role ?? "";
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const appointmentId = asString(req.params.id, "appointmentId");
    const { startTimeUtc, notes } = req.body as { startTimeUtc: string; notes?: string };

    const appointment = await apptService.rescheduleAppointment(
      appointmentId,
      userId,
      role,
      startTimeUtc,
      notes
    );

    return res.json(appointment);
  } catch (err: unknown) {
    return res.status(400).json({ message: err instanceof Error ? err.message : "Failed to reschedule appointment" });
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
    return res.status(400).json({ message: err instanceof Error ? err.message : "Error" });
  }
};

export const getMyStaffAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const staffId = req.user?.id;
    if (!staffId) return res.status(401).json({ message: "Unauthorized" });

    const date = req.query.date ? asString(req.query.date, "date") : undefined;
    const appointments = await apptService.getStaffAppointments(staffId, date);

    return res.json(appointments);
  } catch (err: unknown) {
    return res.status(400).json({ message: err instanceof Error ? err.message : "Error" });
  }
};

export const getOrganizationAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) return res.status(400).json({ message: "Admin has no associated organization" });

    const date = req.query.date ? asString(req.query.date, "date") : undefined;
    const upcoming = req.query.upcoming === "true";

    const appointments = await apptService.getOrganizationAppointments(orgId, date, upcoming);
    return res.json(appointments);
  } catch (err: unknown) {
    return res.status(400).json({ message: err instanceof Error ? err.message : "Error" });
  }
};


export const getReschedulePolicyHandler = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) return res.status(400).json({ message: "Admin has no associated organization" });

    const policy = await apptService.getReschedulePolicy(orgId);
    return res.json(policy);
  } catch (err: unknown) {
    return res.status(400).json({ message: err instanceof Error ? err.message : "Error" });
  }
};

export const upsertReschedulePolicyHandler = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) return res.status(400).json({ message: "Admin has no associated organization" });

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
    return res.status(400).json({ message: err instanceof Error ? err.message : "Error" });
  }
};