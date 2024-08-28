import { configureStore } from "@reduxjs/toolkit";
import checkOutReducer from "../redux/checkoutSlice";
import sessionReducer, { sessionTableReducer } from "../redux/sessionSlice";

export const store = configureStore({
  reducer: {
    checkOutCard: checkOutReducer,
    session: sessionReducer,
    sessionTable: sessionTableReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
