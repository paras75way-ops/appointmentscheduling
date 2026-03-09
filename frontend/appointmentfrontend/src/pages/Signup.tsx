import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router";
import { signup } from "../services/auth.service";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

 
const signUpSchema = z
  .object({
    role: z.enum(["user", "admin"], { message: "Role is required" }),
    name: z.string().min(1, "Name is required"),
    email: z.string().email({ message: "Invalid email format" }),
    password: z
      .string()
      .min(6, "Minimum 6 characters")
      .regex(/[A-Z]/, "Must include at least one uppercase letter"),
    organizationName: z.string().optional(),
    organizationType: z
      .enum(["clinic", "salon", "service_provider", "coworking_space"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "admin") {
      if (!data.organizationName || data.organizationName.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "Organization name is required",
          path: ["organizationName"],
        });
      }

      if (!data.organizationType) {
        ctx.addIssue({
          code: "custom",
          message: "Organization type is required",
          path: ["organizationType"],
        });
      }
    }
  });

// Infer TypeScript type from schema
type ISignUpForm = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ISignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const selectedRole = watch("role");

  const onSubmit = async (data: ISignUpForm) => {
    try {
      setServerError(null);

      await signup({
        role: data.role,
        name: data.name,
        email: data.email,
        password: data.password,
        organizationName: data.organizationName,
        organizationType: data.organizationType,
      });

      navigate("/verify-otp", { state: { email: data.email } });
    } catch (error: unknown) {
      setServerError(error instanceof Error ? error.message : "Signup failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-gray-100">
          Create Account
        </h2>

        {serverError && (
          <div className="mb-4 text-sm text-red-600 text-center">{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Role */}
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              {...register("role")}
              defaultValue=""
              className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="admin">Organization Admin</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              {...register("name")}
              className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Organization Fields */}
          {selectedRole === "admin" && (
            <>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                  Organization Name
                </label>
                <input
                  type="text"
                  {...register("organizationName")}
                  placeholder="e.g. Sunrise Clinic"
                  className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
                {errors.organizationName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.organizationName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                  Organization Type
                </label>
                <select
                  {...register("organizationType")}
                  defaultValue=""
                  className="w-full p-2.5 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                >
                  <option value="">Select Type</option>
                  <option value="clinic">Clinic</option>
                  <option value="salon">Salon</option>
                  <option value="service_provider">Service Provider</option>
                  <option value="coworking_space">Coworking Space</option>
                </select>
                {errors.organizationType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.organizationType.message}
                  </p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-black dark:bg-gray-200 text-white dark:text-gray-900 font-medium hover:opacity-90 transition"
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/signin" className="font-medium underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}