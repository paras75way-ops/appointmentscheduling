import { Request, Response } from "express"
import * as ServiceService from "./services.service"

export const createService = async (req: Request, res: Response) => {
  try {
    const service = await ServiceService.createService(req.body)

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create service",
      error
    })
  }
}

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await ServiceService.getServices()

    return res.status(200).json({
      success: true,
      data: services
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error
    })
  }
}

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    const service = await ServiceService.getServiceById(id)

    return res.status(200).json({
      success: true,
      data: service
    })
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
      error
    })
  }
}

export const getServicesByOrganization = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = req.params.organizationId as string

    const services =
      await ServiceService.getServicesByOrganization(organizationId)

    return res.status(200).json({
      success: true,
      data: services
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error
    })
  }
}

export const updateService = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    const service = await ServiceService.updateService(id, req.body)

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update service",
      error
    })
  }
}

export const deleteService = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    await ServiceService.deleteService(id)

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete service",
      error
    })
  }
}

export const searchServices = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'q' is required"
      })
    }

    const services = await ServiceService.searchServices(q)
    return res.status(200).json({
      success: true,
      data: services
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to search services",
      error
    })
  }
}

export const getStaffForService = async (req: Request, res: Response) => {
  try {
    const serviceId = req.params.serviceId as string
    const staff = await ServiceService.getStaffForService(serviceId)
    return res.status(200).json({
      success: true,
      data: staff
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get staff for service",
      error
    })
  }
}