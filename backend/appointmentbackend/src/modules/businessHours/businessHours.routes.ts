import express from "express";
import { upsertBusinessHours, getBusinessHours } from "./businessHours.controller";

const router = express.Router();

router.post("/", upsertBusinessHours);
router.put("/:organizationId", upsertBusinessHours);
router.get("/:organizationId", getBusinessHours);

export default router;
