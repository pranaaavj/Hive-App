import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { RootState } from "@/redux/store/store";
import { logout,setAdmin} from "@/redux/slices/adminSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BASE_URL}/api`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('adminAccessToken');
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

export const adminBaseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.log("Access token expired. Trying to refresh...");

    const refreshResult = await baseQuery("/admin/refresh-token", api, extraOptions);
    console.log("Refresh result:", refreshResult);

    if (refreshResult.data) {
      const accessToken = (refreshResult.data as any).data.accessToken; 
      localStorage.setItem('adminAccessToken', accessToken);
      api.dispatch(setAdmin({admin:(api.getState() as RootState).admin.admin }));
      result = await baseQuery(args, api, extraOptions); 
    } else {
      api.dispatch(logout());
      localStorage.removeItem('adminAccessToken');
    }
  }

  return result;
};
