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
