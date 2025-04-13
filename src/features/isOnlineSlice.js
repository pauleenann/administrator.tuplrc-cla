import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    isOnline: null
}

const isOnlineSlice = createSlice({
    name: "isOnline",
    initialState,
    reducers:{
        checkIfOnline: (state, action)=>{
            state.isOnline = action.payload;
        },
    }
})

export const {checkIfOnline} = isOnlineSlice.actions;
export default isOnlineSlice.reducer;