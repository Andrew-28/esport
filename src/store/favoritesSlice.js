import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../config/apiConfig";

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];

      const res = await fetch(`${API_BASE_URL}/api/favorites/my`, {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (!res.ok) {
        return thunkAPI.rejectWithValue("Не вдалося завантажити обрані місця");
      }

      const data = await res.json();
      // data: [{ id, placeName, sportName, createdAt }]
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        "Помилка мережі при завантаженні обраних"
      );
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  "favorites/toggleFavorite",
  async (placeId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return thunkAPI.rejectWithValue("Потрібно увійти в систему");
      }

      const res = await fetch(
        `${API_BASE_URL}/api/favorites/${placeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(data.msg || "Не вдалося оновити обрані");
      }

      return data.favorites; // масив placeId, що в обраних
    } catch (err) {
      return thunkAPI.rejectWithValue("Помилка мережі при оновленні обраних");
    }
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    items: [], // [{ id, placeName, sportName, createdAt }]
    ids: [], // [placeLegacyId]
    loading: false,
    error: null,
  },
  reducers: {
    resetFavorites: (state) => {
      state.items = [];
      state.ids = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.ids = action.payload.map((it) => it.id);
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Помилка при завантаженні обраних";
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        // action.payload — масив id, що в обраних
        state.ids = action.payload;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.error = action.payload || "Помилка при оновленні обраних";
      });
  },
});

export const { resetFavorites } = favoritesSlice.actions;

export default favoritesSlice.reducer;
