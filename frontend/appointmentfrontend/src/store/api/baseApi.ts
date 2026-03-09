import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { setAccessToken, logout } from "../slices/auth.slice";
import type { RootState } from "../index";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000/api",
  credentials: "include",

  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

let consecutive401Count = 0;

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {

  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    consecutive401Count += 1;

    if (consecutive401Count >= 5) {
      localStorage.removeItem("accessToken");
      api.dispatch(logout());
      return result;
    }

    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const { accessToken } = refreshResult.data as { accessToken: string };

      api.dispatch(setAccessToken(accessToken));

      result = await baseQuery(args, api, extraOptions);

      // If retry succeeds, reset the counter
      if (result.error?.status !== 401) {
        consecutive401Count = 0;
      }
    } else {
      localStorage.removeItem("accessToken");
      api.dispatch(logout());
    }
  } else {
    // Reset counter when we get a successful response or non-401 error
    consecutive401Count = 0;
  }

  return result;
};