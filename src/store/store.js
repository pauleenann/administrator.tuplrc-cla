import { configureStore } from "@reduxjs/toolkit";
import chartReducer from '../features/chartSlice.js'
import isOnlineReducer from '../features/isOnlineSlice.js'
import advancedSearchReducer from '../features/advancedSearchSlice.js'
import userReducer from '../features/userSlice.js'
import departmentReducer from '../features/departmentSlice.js'
import topicReducer from '../features/topicSlice.js'
import typeReducer from '../features/typeSlice.js'
import publisherReducer from '../features/publisherSlice.js'
import statusReducer from '../features/statusSlice.js'
import adviserReducer from '../features/adviserSlice.js'
import authorReducer from '../features/authorSlice.js'
import publisherInfoReducer from '../features/publisherInfoSlice.js'

const store = configureStore({
    reducer:{
        chart: chartReducer,
        isOnline:  isOnlineReducer,
        advancedSearch: advancedSearchReducer,
        username: userReducer,
        department: departmentReducer,
        topic: topicReducer,
        type: typeReducer,
        publisher: publisherReducer,
        status: statusReducer,
        adviser: adviserReducer,
        author: authorReducer,
        publisherInfo: publisherInfoReducer

    }
})

export default store;