import mongoose, { Schema, Document, Types } from "mongoose"
import { IService } from "./services.types"

export interface IServiceDocument extends IService, Document {}

const serviceSchema = new Schema<IServiceDocument>(
  {
    name: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    duration: {
      type: Number,
      required: true
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },

    category: String,

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

export const ServiceModel = mongoose.model<IServiceDocument>(
  "Service",
  serviceSchema
)