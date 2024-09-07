import { configureStore } from "@reduxjs/toolkit";
import checkOutReducer from "../redux/checkoutSlice";
import sessionReducer, { sessionTableReducer } from "../redux/sessionSlice";
import { useDispatch, useSelector } from "react-redux";
import { gateInReducer, gateOutReducer } from "../redux/gateSlice";

export const store = configureStore({
  reducer: {
    checkOutCard: checkOutReducer,
    session: sessionReducer,
    sessionTable: sessionTableReducer,
    gateIn: gateInReducer,
    gateOut: gateOutReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export type AppDispatch = typeof store.dispatch;
