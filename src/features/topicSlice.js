import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from 'axios'
import { getAllFromStore } from '../indexedDb/getDataOffline';

export const fetchTopicOnline = createAsyncThunk(
    "data/fetchTopicOnline",
    async()=>{
        try {
            const response = await axios.get(`http://localhost:3001/api/data/topic`);
            return response.data
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }
)

export const fetchTopicOffline = createAsyncThunk(
    "data/fetchTopicOffline",
    async()=>{
        try {
            const tps = await getAllFromStore('topic');
            return tps
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }
)

const topicSlice = createSlice({
    name: "topic",
    initialState:{
        topic:[],
        loading: false,
        error: null
    },
    reducers:{
        setTopicArr: (state, action)=>{
            state.topic = action.payload;
        },
    },
    extraReducers: (builder)=>{
        builder
            .addCase(fetchTopicOnline.pending, (state)=>{
                state.loading = true;
            })
            .addCase(fetchTopicOnline.fulfilled, (state, action) => {
                state.loading = false;
                state.topic = action.payload;
            })
            .addCase(fetchTopicOnline.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(fetchTopicOffline.pending, (state)=>{
                state.loading = true;
            })
            .addCase(fetchTopicOffline.fulfilled, (state, action) => {
                state.loading = false;
                state.topic = action.payload;
            })
            .addCase(fetchTopicOffline.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
})

export const {setTopicArr} = topicSlice.actions;
export default topicSlice.reducer;