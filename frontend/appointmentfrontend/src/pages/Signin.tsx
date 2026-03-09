import { useActionData, useNavigation, Link, useSubmit } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const signInSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type ISignInForm = z.infer<typeof signInSchema>;

export default function SignIn() {
  const actionData = useActionData() as { error?: string } | undefined;
  const navigation = useNavigation();
  const submit = useSubmit();
 
  const isSubmitting = navigation.state !== "idle" && navigation.formMethod === "POST";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ISignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = (data: ISignInForm) => {
    submit(data, { method: "post" });
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-sm"
      >
        <h2 className="text-2xl font-semibold text-center">Sign In</h2>

        {actionData?.error && (
          <div className="text-sm text-red-600 text-center">
            {actionData.error}
          </div>
        )}

     
        <div>
          <input
            {...register("email")}
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded-md"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded-md"
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white py-2 rounded-md disabled:opacity-50"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}