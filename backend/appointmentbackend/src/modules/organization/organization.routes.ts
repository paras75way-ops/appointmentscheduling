import express from "express";
import {
    listOrganizations,
    getMyOrganization,
    getOrganization,
    updateOrganization,
} from "./organization.controller";

const router = express.Router();

router.get("/", listOrganizations);
router.get("/mine", getMyOrganization);
router.get("/:id", getOrganization);
router.put("/:id", updateOrganization);

export default router;
