import { redirect } from "react-router";
import { signup } from "../../services/auth.service";

export async function signUpAction({ request }: { request: Request }) {
  const formData = await request.formData();

  const role = formData.get("role") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const data = await signup({
      role: role as "user" | "admin",
      name,
      email,
      password,
    });


    localStorage.setItem("accessToken", data.accessToken);


    return redirect("/dashboard");
  } catch (error: unknown) {
    return { error: (error as Error).message };
  }
}