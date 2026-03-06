import { Response } from "express";
import { AuthRequest } from "../../middleware/rbac.middleware";
import * as orgService from "./organization.service";
import { OrganizationType } from "./organization.types";

export const listOrganizations = async (req: AuthRequest, res: Response) => {
    try {
        const type = req.query.type as OrganizationType | undefined;
        const orgs = await orgService.getAllOrganizations(type);
        return res.json(orgs);
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to fetch organizations";
        return res.status(400).json({ message });
    }
};

export const getMyOrganization = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const org = await orgService.getOrganizationByOwner(userId);
        return res.json(org);
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to fetch organization";
        return res.status(400).json({ message });
    }
};

export const getOrganization = async (req: AuthRequest, res: Response) => {
    try {
        const org = await orgService.getOrganizationById(req.params.id as string);
        return res.json(org);
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to fetch organization";
        return res.status(404).json({ message });
    }
};

export const updateOrganization = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const org = await orgService.updateOrganization(
            req.params.id as string,
            userId,
            req.body
        );
        return res.json(org);
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to update organization";
        return res.status(400).json({ message });
    }
};
