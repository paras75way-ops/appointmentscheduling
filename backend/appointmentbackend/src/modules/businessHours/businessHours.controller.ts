import { Response } from "express";
import { AuthRequest } from "../../middleware/rbac.middleware";
import * as bhService from "./businessHours.service";

export const upsertBusinessHours = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) return res.status(401).json({ message: "Unauthorized" });

        const organizationId =
            req.user?.organizationId || (req.body.organizationId as string);

        if (!organizationId) {
            return res
                .status(400)
                .json({ message: "organizationId is required" });
        }

        const { slotDuration, schedule } = req.body as {
            slotDuration: number;
            schedule: Parameters<typeof bhService.upsertBusinessHours>[0]["schedule"];
        };

        const result = await bhService.upsertBusinessHours({
            organizationId,
            slotDuration,
            schedule,
        });

        return res.status(200).json(result);
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to save business hours";
        return res.status(400).json({ message });
    }
};

export const getBusinessHours = async (req: AuthRequest, res: Response) => {
    try {
        const { organizationId } = req.params;
        const result = await bhService.getBusinessHours(organizationId as string);
        return res.json(result);
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to fetch business hours";
        return res.status(404).json({ message });
    }
};
