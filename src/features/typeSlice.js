import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from 'axios'
import { getAllFromStore } from '../indexedDb/getDataOffline';

export const fetchTypeOnline = createAsyncThunk(
    "data/fetchTypeOnline",
    async()=>{
        try {
            const response = await axios.get(`http://localhost:3001/api/data/type`);
            return response.data
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }
)

export const fetchTypeOffline = createAsyncThunk(
    "data/fetchTypeOffline",
    async()=>{
        try {
            // get type offline
            const types = await getAllFromStore('resourcetype');
            return types
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }
)

const typeSlice = createSlice({
    name: "type",
    initialState:{
        type:[],
        loading: false,
        error: null
    },
    reducers:{
        setTypeArr: (state, action)=>{
            state.type = action.payload;
        },
    },
    extraReducers: (builder)=>{
        builder
            .addCase(fetchTypeOnline.pending, (state)=>{
                state.loading = true;
            })
            .addCase(fetchTypeOnline.fulfilled, (state, action) => {
                state.loading = false;
                state.type = action.payload;
            })
            .addCase(fetchTypeOnline.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(fetchTypeOffline.pending, (state)=>{
                state.loading = true;
            })
            .addCase(fetchTypeOffline.fulfilled, (state, action) => {
                state.loading = false;
                state.type = action.payload;
            })
            .addCase(fetchTypeOffline.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
})

export const {setTypeArr} = typeSlice.actions;
export default typeSlice.reducer;