import { Types } from "mongoose"
import { ServiceModel } from "./services.model"
import {
  ICreateServiceDTO,
  IUpdateServiceDTO
} from "./services.types"

export const createService = async (data: ICreateServiceDTO) => {
  const service = await ServiceModel.create({
    ...data,
    organizationId: new Types.ObjectId(data.organizationId)
  })

  return service
}

export const getServices = async () => {
  const services = await ServiceModel.find()
  return services
}

export const getServiceById = async (serviceId: string) => {
  const service = await ServiceModel.findById(serviceId)

  if (!service) {
    throw new Error("Service not found")
  }

  return service
}

export const getServicesByOrganization = async (organizationId: string) => {
  const services = await ServiceModel.find({
    organizationId: new Types.ObjectId(organizationId)
  })

  return services
}

export const updateService = async (
  serviceId: string,
  data: IUpdateServiceDTO
) => {
  const updatedService = await ServiceModel.findByIdAndUpdate(
    serviceId,
    data,
    { new: true }
  )

  if (!updatedService) {
    throw new Error("Service not found")
  }

  return updatedService
}

export const deleteService = async (serviceId: string) => {
  const deletedService = await ServiceModel.findByIdAndDelete(serviceId)

  if (!deletedService) {
    throw new Error("Service not found")
  }

  return deletedService
}

export const searchServices = async (query: string) => {
  const services = await ServiceModel.find({
    name: { $regex: query, $options: "i" },
    isActive: true,
  }).populate("organizationId", "name type")

  return services
}

export const getStaffForService = async (serviceId: string) => {
  const User = (await import("../auth/auth.models")).default
  const staff = await User.find({
    services: serviceId,
    role: "staff",
  }).select("name email role organizationId")

  return staff
}