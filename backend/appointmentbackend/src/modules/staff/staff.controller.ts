import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as staffService from "./staff.service";

export const addStaff = async (req: AuthRequest, res: Response) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) return res.status(401).json({ message: "Unauthorized" });

        const result = await staffService.addStaff(adminId, req.body);
        return res.status(201).json(result);
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to add staff";
        return res.status(400).json({ message });
    }
};

export const getStaff = async (req: AuthRequest, res: Response) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) return res.status(401).json({ message: "Unauthorized" });

        const staff = await staffService.getStaffByOrganization(adminId);
        return res.json(staff);
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to fetch staff";
        return res.status(400).json({ message });
    }
};

export const removeStaff = async (req: AuthRequest, res: Response) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) return res.status(401).json({ message: "Unauthorized" });

        const result = await staffService.removeStaff(adminId, req.params.id as string);
        return res.json(result);
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to remove staff";
        return res.status(400).json({ message });
    }
};

export const assignService = async (req: AuthRequest, res: Response) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) return res.status(401).json({ message: "Unauthorized" });

        const staffId = req.params.staffId as string;
        const serviceId = req.params.serviceId as string;
        const result = await staffService.assignServiceToStaff(adminId, staffId, serviceId);
        return res.status(200).json(result);
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to assign service";
        return res.status(400).json({ message });
    }
};

export const removeService = async (req: AuthRequest, res: Response) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) return res.status(401).json({ message: "Unauthorized" });

        const staffId = req.params.staffId as string;
        const serviceId = req.params.serviceId as string;
        const result = await staffService.removeServiceFromStaff(adminId, staffId, serviceId);
        return res.json(result);
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to remove service from staff";
        return res.status(400).json({ message });
    }
};

