import { Types } from "mongoose"

export interface IService {
  name: string
  description: string
  price: number
  duration: number
  organizationId: Types.ObjectId
  category?: string
  isActive?: boolean
}

export interface ICreateServiceDTO {
  name: string
  description: string
  price: number
  duration: number
  organizationId: string
  category?: string
}

export interface IUpdateServiceDTO {
  name?: string
  description?: string
  price?: number
  duration?: number
  category?: string
  isActive?: boolean
}

export interface IServiceResponse {
  id: string
  name: string
  description: string
  price: number
  duration: number
  organizationId: string
  category?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}