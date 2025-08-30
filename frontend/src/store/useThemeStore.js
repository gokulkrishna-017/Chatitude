import {create} from "zustand";

export const useThemeStore = create((set) => ({
    theme: "dark",

    changeLightTheme: () => {
        set({theme: "light"});
    },

    changeDarkTheme: () => {
        set({theme: "dark"});
    }
}))
