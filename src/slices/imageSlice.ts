import { createAction, createSlice } from "@reduxjs/toolkit";
import { Image } from "../types";
import { RootState } from "../store";
import { imagesEditorKey } from "./imageEditorSlice";

export const imagesKey = "images"

type ImagesState = {
  entities: { [id: Image['id']]: Image },
};

export const initialState: ImagesState = {
  entities: {},
};

export const imagesEntitiesAddUpdateAction = createAction<Image[]>(`${imagesEditorKey}/entities/addUpdate`)

export const imageSlice = createSlice({
  name: imagesKey,
  initialState,
  reducers: {
    // reducer
    // prepare
  },
  extraReducers: (builder) => {
    builder
      .addCase(imagesEntitiesAddUpdateAction, (state, action) => {
        action.payload.forEach(element => {
          state.entities[element.id] = element
        });
      })
  },
});

export default imageSlice.reducer;


// selector image
export const getItemById = (id: number) => (state: RootState): Image|undefined => {
  return state[imagesKey].entities[id] || undefined
}

// selector for image canvas page
export const getImageUrlForCanvas = (id: number, showEdited: boolean) => (state: RootState) => {
  const editorItem = state[imagesEditorKey].entities[id]
  const image = getItemById(id)(state)
  return ((showEdited ? editorItem?.url : image?.downloadUrl)) || ''
}
