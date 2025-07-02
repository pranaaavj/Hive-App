import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { RootState } from "@/redux/store/store";
import { setUser, logout } from "@/redux/slices/userSlice";


interface RefreshResponse {
  data: {
    accessToken: string;
  };
}
const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BASE_URL}/api`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

export const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.log("Access token expired. Trying to refresh...");

    const refreshResult = await baseQuery("/auth/refresh-token", api, extraOptions);
    console.log("Refresh result:", refreshResult);

    if (refreshResult.data) {
      const accessToken = (refreshResult.data as RefreshResponse).data.accessToken; 
      localStorage.setItem('accessToken', accessToken);
      api.dispatch(setUser({ user: (api.getState() as RootState).user.user }));
      result = await baseQuery(args, api, extraOptions); 
    } else {
      api.dispatch(logout());
      localStorage.removeItem('accessToken');
    }
  }

  return result;
};
