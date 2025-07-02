import { User } from "@/types/auth";
import {createSlice,PayloadAction} from "@reduxjs/toolkit"

interface UserState {
    user: User | null,
}

const initialState: UserState = {
    user: null,
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ user: User | null; }>) => {
            state.user = action.payload.user;
            
          },
          logout: (state) => {
              state.user = null;
                localStorage.removeItem('accessToken')
            },
        setProfilePicture: (state, action: PayloadAction<string>) => {
            if (state.user) {
            state.user.profilePicture = action.payload;
            }
        }
    },
})
export const {setUser, logout,setProfilePicture} = userSlice.actions;
export default userSlice.reducer