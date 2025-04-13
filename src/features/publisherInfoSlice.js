import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchPublisherInfo = createAsyncThunk(
    "data/fetchPublisherInfo",
    async()=>{
        try {

            const response = await axios.get(`http://localhost:3001/api/data/publishers`);

            return response.data
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }
)

const publisherInfoSlice = createSlice({
    name: "publisherInfo",
    initialState:{
        publisherInfo:[],
        loading: false,
        error: null
    },
    reducers:{
        setPublisherInfoArr: (state, action)=>{
            state.publisherInfo = action.payload;
        },
    },
    extraReducers: (builder)=>{
        builder
            .addCase(fetchPublisherInfo.pending, (state)=>{
                state.loading = true;
            })
            .addCase(fetchPublisherInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.publisherInfo = action.payload;
            })
            .addCase(fetchPublisherInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    }
})

export const {setPublisherInfoArr} = publisherInfoSlice.actions;
export default publisherInfoSlice.reducer;