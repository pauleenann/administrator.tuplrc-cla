import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from 'axios'
import { getAllFromStore } from '../indexedDb/getDataOffline';

export const fetchStatusOnline = createAsyncThunk(
    "data/fetchStatusOnline",
    async()=>{
        try {
            const response = await axios.get(`http://localhost:3001/api/data/status`);
            return response.data
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }
)

export const fetchStatusOffline = createAsyncThunk(
    "data/fetchStatusOffline",
    async()=>{
        try {
            const status = await getAllFromStore('availability');
            return status
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }
)

const statusSlice = createSlice({
    name: "status",
    initialState:{
        status:[],
        loading: false,
        error: null
    },
    reducers:{
        setStatusArr: (state, action)=>{
            state.status = action.payload;
        },
    },
    extraReducers: (builder)=>{
        builder
            .addCase(fetchStatusOnline.pending, (state)=>{
                state.loading = true;
            })
            .addCase(fetchStatusOnline.fulfilled, (state, action) => {
                state.loading = false;
                state.status = action.payload;
            })
            .addCase(fetchStatusOnline.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(fetchStatusOffline.pending, (state)=>{
                state.loading = true;
            })
            .addCase(fetchStatusOffline.fulfilled, (state, action) => {
                state.loading = false;
                state.status = action.payload;
            })
            .addCase(fetchStatusOffline.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
})

export const {setStatusArr} = statusSlice.actions;
export default statusSlice.reducer;