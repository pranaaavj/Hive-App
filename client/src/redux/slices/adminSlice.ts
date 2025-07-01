import { Admin } from "@/types/auth";
import {createSlice,PayloadAction} from "@reduxjs/toolkit"

interface AdminState {
    admin:Admin|null
}

const initialState :AdminState={
    admin:null
}


const adminSlice = createSlice({
    name:'admin',
    initialState,
    reducers:{
        setAdmin:(state,action:PayloadAction<{admin:Admin|null}>)=>{
            state.admin = action.payload.admin
        },
        logout:(state)=>{
            state.admin = null
            localStorage.removeItem('adminAccessToken')
        }
    }
})

export const {logout,setAdmin}= adminSlice.actions
export default adminSlice.reducer