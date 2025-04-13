import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from 'axios'
import { getAllFromStore } from '../indexedDb/getDataOffline';

export const fetchAuthorOnline = createAsyncThunk(
    "data/fetchAuthorOnline",
    async()=>{
        try {
            const auth = [];

            const response = await axios.get('http://localhost:3001/api/data/authors');

            response.data.forEach(item => {
                auth.push({
                    value: `${item.author_fname} ${item.author_lname}`,
                    label: `${item.author_fname} ${item.author_lname}`
                });
            });

            return auth
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }
)

export const fetchAuthorOffline = createAsyncThunk(
    "data/fetchAuthorOffline",
    async()=>{
        try {
            const auth = [];

            const response = await getAllFromStore('author');

            response.data.forEach(item => {
                auth.push({
                    value: `${item.author_fname} ${item.author_lname}`,
                    label: `${item.author_fname} ${item.author_lname}`
                });
            });

            return auth
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }
)

const authorSlice = createSlice({
    name: "author",
    initialState:{
        author:[],
        loading: false,
        error: null
    },
    reducers:{
        setAuthorArr: (state, action)=>{
            state.author = action.payload;
        },
    },
    extraReducers: (builder)=>{
        builder
            .addCase(fetchAuthorOnline.pending, (state)=>{
                state.loading = true;
            })
            .addCase(fetchAuthorOnline.fulfilled, (state, action) => {
                state.loading = false;
                state.author = action.payload;
            })
            .addCase(fetchAuthorOnline.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(fetchAuthorOffline.pending, (state)=>{
                state.loading = true;
            })
            .addCase(fetchAuthorOffline.fulfilled, (state, action) => {
                state.loading = false;
                state.author = action.payload;
            })
            .addCase(fetchAuthorOffline.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    }
})

export const {setAuthorArr} = authorSlice.actions;
export default authorSlice.reducer;