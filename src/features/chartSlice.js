import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    borrowedStats:[],
    visitorStats:[]
}

const chartSlice = createSlice({
    name: "chart",
    initialState,
    reducers:{
        setBorrowedStats: (state, action)=>{
            state.borrowedStats = action.payload;
            console.log(state.borrowedStats)
        },
        setVisitorStats:(state,action)=>{
            state.visitorStats = action.payload;
        }
    }
})

export const {setBorrowedStats, setVisitorStats} = chartSlice.actions;
export default chartSlice.reducer;