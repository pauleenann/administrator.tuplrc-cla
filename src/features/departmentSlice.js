import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from 'axios'
import { getAllFromStore } from '../indexedDb/getDataOffline';

export const fetchDepartmentOnline = createAsyncThunk(
    "data/fetchDepartmentOnline",
    async()=>{
        try {
            const response = await axios.get(`http://localhost:3001/api/data/departments`);
            return response.data
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }
)

export const fetchDepartmentOffline = createAsyncThunk(
    "data/fetchDepartmentOffline",
    async()=>{
        try {
            const depts = await getAllFromStore('department')
            return depts
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }
)


const departmentSlice = createSlice({
    name: "department",
    initialState:{
        department:[],
        loading: false,
        error: null
    },
    reducers:{
        setDepartmentArr: (state, action)=>{
            state.department = action.payload;
        },
    },
    extraReducers: (builder)=>{
        builder
        .addCase(fetchDepartmentOnline.pending, (state)=>{
            state.loading = true;
        })
        .addCase(fetchDepartmentOnline.fulfilled, (state, action) => {
            state.loading = false;
            state.department = action.payload;
        })
        .addCase(fetchDepartmentOnline.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        .addCase(fetchDepartmentOffline.pending, (state)=>{
            state.loading = true;
        })
        .addCase(fetchDepartmentOffline.fulfilled, (state, action) => {
            state.loading = false;
            state.department = action.payload;
        })
        .addCase(fetchDepartmentOffline.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
    }
})

export const {setDepartmentArr} = departmentSlice.actions;
export default departmentSlice.reducer;