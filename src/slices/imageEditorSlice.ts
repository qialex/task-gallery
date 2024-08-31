import { createAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { EditorChangeType } from "../constants";
import { BlurProps, EditorAction, GreyscaleProps, ImageEditorStoreItem, Image, ResizeProps, Size } from "../types";
import { getURL, resizeImage } from "../utils";
import { RootState } from "../store";

export const imagesEditorKey = "imagesEditor"

type ImagesEditorState = {
  entities: { [id: Image['id']]: ImageEditorStoreItem }
};

export const initialState: ImagesEditorState = {
  entities: {},
};

export const addEditorChange =  createAsyncThunk<{editorAction: EditorAction, editorItem: ImageEditorStoreItem }, any, { rejectValue: {id: number|undefined, error: string} }>(
  `${imagesEditorKey}/addEditoAction`,
  async (payload: {editorAction: EditorAction, editorItem: ImageEditorStoreItem}, { rejectWithValue }) => {

    const editorActions = payload.editorItem.editorActions.filter(a => a.active)

    const blur = payload.editorAction.type === EditorChangeType.blur ? 
    (payload.editorAction.props as BlurProps).blur :
    ((editorActions || []).filter(h => h.type === EditorChangeType.blur).reverse()[0]?.props as BlurProps)?.blur || 0

    const greyscale = payload.editorAction.type === EditorChangeType.greyscale ? 
      (payload.editorAction.props as GreyscaleProps).isGreyscale :
      ((editorActions || []).filter(h => h.type === EditorChangeType.greyscale).reverse()[0]?.props as GreyscaleProps)?.isGreyscale || false
    
    if ([EditorChangeType.blur, EditorChangeType.greyscale].includes(payload.editorAction.type)) {
      payload.editorAction.url = getURL(payload.editorItem?.image?.downloadUrl || '', blur, greyscale)

      const resizeActions: EditorAction[] = (editorActions || []).filter(h => h.type === EditorChangeType.resize) || []
      if (resizeActions.length) {
        try {
          let url = payload.editorAction.url
          for (let i=0; i < resizeActions.length; i++) {
            url = await resizeImage(url, resizeActions[i].props as ResizeProps)
          }
          payload.editorAction.url = url
        } catch (e) {
          return rejectWithValue({id: payload?.editorItem?.image?.id, error: 'Some error during resize restore from ground'});
        }
      }
    }

    if (EditorChangeType.resize === payload.editorAction.type) {
      try {
        payload.editorAction.url = await resizeImage(payload.editorItem?.url, payload.editorAction.props as ResizeProps)
      } catch (e) {
        return rejectWithValue({id: payload?.editorItem?.image?.id, error: 'Some error during resize'});
      }
    }
    return payload
  },
);

export const DeleteLastEditorHistoryItem =  createAsyncThunk(
  `${imagesEditorKey}/DeleteLastEditorHistoryItem`,
  (id: number) => {
    return id
  },
);

export const ShangeEditorHistoryActive = createAsyncThunk(
  `${imagesEditorKey}/ShangeEditorHistoryActive`,
  (payload: {id: number, index: number}) => {
    return payload
  },
);



export const imagesEditorEntitiesAddUpdateAction = createAction<Image[]>(`${imagesEditorKey}/entities/addUpdate`)

export const imageEditorSlice = createSlice({
  name: imagesEditorKey,
  initialState,
  reducers: {
    // reducer
    // prepare
  },
  extraReducers: (builder) => {
    builder
      .addCase(imagesEditorEntitiesAddUpdateAction, (state, action) => {
        action.payload.forEach(element => {
          state.entities[element.id] = { 
            image: element,
            editorActions: [] as EditorAction[], 
            url: element.downloadUrl, 
            size: element.size,
          } as ImageEditorStoreItem
        });
      })


      .addCase(addEditorChange.fulfilled, (state, action) => {
        if (typeof action.payload.editorItem?.image?.id === 'number') {
          const item = state.entities[action.payload.editorItem?.image?.id] || undefined
          if (item) {
            item.editorActions = [...item.editorActions.filter(a => a.active), action.payload.editorAction]
            item.url =  action.payload.editorAction.url
            if (item.image && ( action.payload.editorAction.props as ResizeProps ).wAbs) {
              item.size.width = ( action.payload.editorAction.props as ResizeProps ).wAbs
              item.size.height = ( action.payload.editorAction.props as ResizeProps ).hAbs
            }
          }
        }
      })
      .addCase(addEditorChange.rejected, (state, action) => {
        if (typeof action?.payload?.id === 'number') {
          const item = state.entities[action.payload.id] || undefined
          if (item) {
            item.editorActions = item.editorActions.filter(a => !!a.url)
            if (item.image) {
              item.size = getCurrentImageSize(item, action.payload?.id || 0)
            }
          }
        }      
      })

      // Remove last history item
      .addCase(DeleteLastEditorHistoryItem.fulfilled, (state, action) => {
        const item = state.entities[action.payload] || undefined
        if (item) {
          item.editorActions.length = item.editorActions.length - 1
          item.url = item.editorActions[item.editorActions.length - 1]?.url || item.image?.downloadUrl || ''

          if (item.image) {
            item.size = getCurrentImageSize(item, action.payload)
          }
        }
      })

      // make some changes inactive
      .addCase(ShangeEditorHistoryActive.fulfilled, (state, action) => {
        const item = state.entities[action.payload.id] || undefined
        if (item) {
          item.editorActions = item.editorActions.map((a, i)=> { 
            a.active = i <= action.payload.index;
            return a
          })
          item.url = item.editorActions.filter(a => a.active).reverse()[0]?.url || item.image?.downloadUrl || ''
          if (item.image) {
            item.size = getCurrentImageSize(item, action.payload.id)
          }
        }
      })
  },
});

export default imageEditorSlice.reducer;

// get image size
export const getCurrentImageSize = (editorImage: ImageEditorStoreItem, id: number): Size => {
  const resizeActions = (editorImage.editorActions || [])
    .filter(action => action.type === EditorChangeType.resize)
    .reverse()[0]?.props as ResizeProps || null

  return { width: resizeActions?.wAbs || editorImage?.size?.width || 0, height: resizeActions?.hAbs || editorImage?.size?.height || 0 }
}

// selector image
export const getImageEditorById = (id: number) => (state: RootState): ImageEditorStoreItem|undefined => {
  return state[imagesEditorKey].entities[id] || undefined
}