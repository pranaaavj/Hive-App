import {createSlice,PayloadAction} from "@reduxjs/toolkit"

interface UserState {
    user: any | null,
  
}

const initialState: UserState = {
    user: null,
   
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ user: any; }>) => {
            state.user = action.payload.user;
            
          },
          logout: (state) => {
              state.user = null;
                localStorage.removeItem('accessToken')
            },
          
    },
})
export const {setUser, logout} = userSlice.actions;
export default userSlice.reducer