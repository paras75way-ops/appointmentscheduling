import express from "express";
import { addStaff, getStaff, removeStaff, assignService, removeService } from "./staff.controller";

const router = express.Router();

router.post("/", addStaff);
router.get("/", getStaff);
router.delete("/:id", removeStaff);
router.post("/:staffId/services/:serviceId", assignService);
router.delete("/:staffId/services/:serviceId", removeService);

export default router;
