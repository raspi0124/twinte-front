import { GetterTree } from "vuex";
import { GlobalState } from ".";

export const getters: GetterTree<GlobalState, GlobalState> = {
  user: (state) => {
    return state.user;
  },
  sidebar: (state) => {
    return state.sidebar;
  },
  courses: (state) => {
    return state.courses;
  },
  label: (state) => {
    return state.label;
  },
  bachelorMode: (state) => {
    return state.bachelorMode;
  },
  tableTimeMode: (state) => {
    return state.tableTimeMode;
  },
  saturdayCourseMode: (state) => {
    return state.saturdayCourseMode;
  },
  toasts: (state) => {
    return state.toasts;
  },
  displayedYear: (state) => {
    return state.displayedYear;
  },
  module: (state) => {
    return state.module;
  },
};
