import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchAdvancedSearchResources = createAsyncThunk(
    "resource/fetchAdvancedSearchResources",
    async({initialFilter, addedFilters, selectedType})=>{
        try {
            // Create a URLSearchParams instance
            const queryParams = new URLSearchParams();

            // Convert `initialFilter` object to query params
            Object.entries(initialFilter).forEach(([key, value]) => {
                queryParams.append(`initialFilter[${key}]`, value);
            });

            // Convert `addedFilters` array to query params
            addedFilters.forEach((filter, index) => {
                Object.entries(filter).forEach(([key, value]) => {
                    queryParams.append(`addedFilters[${index}][${key}]`, value);
                });
            });

            queryParams.append('selectedType', selectedType);


            const response = await axios.get(`http://localhost:3001/api/advanced-search?${queryParams.toString()}`);

            return response.data
        } catch (error) {
            console.error("Error fetching resources:", error);
            throw error;
        }
    }
)

const advancedSearchSlice = createSlice({
    name: "advancedSearch",
    initialState:{
        advancedSearch:[],
        isSearch: false,
        loading: false,
        error: null
    },
    reducers:{
        setAdvancedSearch: (state, action)=>{
            state.advancedSearch = action.payload
        },
        setIsSearch:(state, action)=>{
            state.isSearch = action.payload;
        }
    },
    extraReducers: (builder)=>{
        builder
            .addCase(fetchAdvancedSearchResources.pending, (state)=>{
                state.loading = true;
            })
            .addCase(fetchAdvancedSearchResources.fulfilled, (state, action) => {
                state.loading = false;
                state.advancedSearch = action.payload;
            })
            .addCase(fetchAdvancedSearchResources.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
})

export const {setAdvancedSearch, setIsSearch} = advancedSearchSlice.actions;
export default advancedSearchSlice.reducer;