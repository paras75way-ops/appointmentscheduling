import { Router } from "express"
import {
  createService,
  getServices,
  getServiceById,
  getServicesByOrganization,
  updateService,
  deleteService,
  searchServices,
  getStaffForService
} from "./services.controller"

const router = Router()

router.get("/search", searchServices)
router.get("/:serviceId/staff", getStaffForService)

router.post("/createservice", createService)

router.get("/getservice", getServices)

router.get("/getservicebyid/:id", getServiceById)

router.get("/getservices/organization/:organizationId", getServicesByOrganization)


router.put("/updateservice/:id", updateService)

router.delete("/deleteservice/:id", deleteService)

export default router