import {createSlice,PayloadAction} from "@reduxjs/toolkit"

interface UserState {
    user: any | null,
    accessToken: string | null
}

const initialState: UserState = {
    user: null,
    accessToken: null
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ user: any; accessToken: string }>) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
          },
          logout: (state) => {
              state.user = null;
              state.accessToken = null;
            },
          
    },
})
export const {setUser, logout} = userSlice.actions;
export default userSlice.reducer