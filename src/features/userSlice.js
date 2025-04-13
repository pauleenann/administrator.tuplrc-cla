import {createSlice} from '@reduxjs/toolkit'

const userSlice = createSlice({
    name: "user",
    initialState:{
        username:'',
        userId:''
    },
    reducers:{
        setUsername: (state, action)=>{
            state.username = action.payload;
        },
        setUserId:(state, action)=>{
            state.userId = action.payload;
        },
    }
})

export const {setUsername, setUserId} = userSlice.actions;
export default userSlice.reducer;