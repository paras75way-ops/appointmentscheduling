import express from "express";
import { addStaff, getStaff, removeStaff } from "./staff.controller";

const router = express.Router();

router.post("/", addStaff);
router.get("/", getStaff);
router.delete("/:id", removeStaff);

export default router;
