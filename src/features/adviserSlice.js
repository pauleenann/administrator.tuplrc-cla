import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from 'axios'
import { getAllFromStore } from '../indexedDb/getDataOffline';

export const fetchAdviserOnline = createAsyncThunk(
    "data/fetchAdviserOnline",
    async()=>{
        try {
            const adv = [];

            const response = await axios.get('http://localhost:3001/api/data/advisers');

            response.data.forEach(item => {
                adv.push({
                    value: `${item.adviser_fname} ${item.adviser_lname}`,
                    label: `${item.adviser_fname} ${item.adviser_lname}`
                });
            });

            return adv
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }
)

export const fetchAdviserOffline = createAsyncThunk(
    "data/fetchAdviserOffline",
    async()=>{
        try {
            const adv = [];

            const response = await getAllFromStore('adviser');

            response.data.forEach(item => {
                adv.push({
                    value: `${item.adviser_fname} ${item.adviser_lname}`,
                    label: `${item.adviser_fname} ${item.adviser_lname}`
                });
            });

            return adv
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }
)

const adviserSlice = createSlice({
    name: "adviser",
    initialState:{
        adviser:[],
        loading: false,
        error: null
    },
    reducers:{
        setAdviserArr: (state, action)=>{
            state.adviser = action.payload;
        },
    },
    extraReducers: (builder)=>{
        builder
            .addCase(fetchAdviserOnline.pending, (state)=>{
                state.loading = true;
            })
            .addCase(fetchAdviserOnline.fulfilled, (state, action) => {
                state.loading = false;
                state.adviser = action.payload;
            })
            .addCase(fetchAdviserOnline.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
})

export const {setAdviserArr} = adviserSlice.actions;
export default adviserSlice.reducer;