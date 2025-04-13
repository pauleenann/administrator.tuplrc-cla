import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from 'axios'
import { getAllFromStore } from '../indexedDb/getDataOffline';

export const fetchPublisherOnline = createAsyncThunk(
    "data/fetchPublisherOnline",
    async()=>{
        try {
            const pubs = [];

            const response = await axios.get(`http://localhost:3001/api/data/publishers`);

            response.data.forEach(item => {
                pubs.push({
                    value: item.pub_id,
                    label: item.pub_name
                });
            });

            return pubs
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }
)

export const fetchPublisherOffline = createAsyncThunk(
    "data/fetchPublisherOffline",
    async()=>{
        try {
            const pubs = [];

            const response = await getAllFromStore('publisher');
            response.data.forEach(item => {
                pubs.push({
                    value: item.pub_id,
                    label: item.pub_name
                });
            });

            return pubs
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }
)

const publisherSlice = createSlice({
    name: "publisher",
    initialState:{
        publisher:[],
        loading: false,
        error: null
    },
    reducers:{
        setPublisherArr: (state, action)=>{
            state.publisher = action.payload;
        },
    },
    extraReducers: (builder)=>{
        builder
            .addCase(fetchPublisherOnline.pending, (state)=>{
                state.loading = true;
            })
            .addCase(fetchPublisherOnline.fulfilled, (state, action) => {
                state.loading = false;
                state.publisher = action.payload;
            })
            .addCase(fetchPublisherOnline.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(fetchPublisherOffline.pending, (state)=>{
                state.loading = true;
            })
            .addCase(fetchPublisherOffline.fulfilled, (state, action) => {
                state.loading = false;
                state.publisher = action.payload;
            })
            .addCase(fetchPublisherOffline.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
})

export const {setPublisherArr} = publisherSlice.actions;
export default publisherSlice.reducer;