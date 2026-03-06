import mongoose, { Document, Schema } from "mongoose";
import { IOrganization } from "./organization.types";

export interface IOrganizationDocument extends IOrganization, Document { }

const organizationSchema = new Schema<IOrganizationDocument>(
    {
        name: { type: String, required: true },

        type: {
            type: String,
            enum: ["clinic", "salon", "service_provider", "coworking_space"],
            required: true,
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        staff: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model<IOrganizationDocument>(
    "Organization",
    organizationSchema
);
