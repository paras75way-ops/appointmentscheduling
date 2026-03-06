import { redirect } from "react-router";
import { logouts } from "../../services/auth.service";
import { store } from "../../store";
import { logout } from "../../store/slices/auth.slice";
import { authApi } from "../../store/api/authApi";

export async function logoutAction() {
  logouts();
  store.dispatch(logout());
  store.dispatch(authApi.util.resetApiState());
  return redirect("/signin");
}