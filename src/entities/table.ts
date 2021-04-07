import { CourseSchedule, RegisteredCourse } from "~/api/@types";
import { FullDay, fullDays, SpecialDay } from "./day";
import { fullModulesNum, ModuleFlg, moduleFlgToDisplay } from "./module";

export type CourseState = {
  name: string;
  room: string;
  courseId: string;
};

// Specialはホーム画面の特殊を指す
export type SpecialCourseState = {
  id: string;
  name: string;
  module: string[];
  room: string;
};

/**
 * ```
 * table
 *   [曜日 月~金]
 *   [時限 0~7]
 *   [該当する科目は一つとは限らないので配列（重複しなければ0番目に目的の CourseState が入っている）]
 * ```
 */
export type Table = CourseState[][][];

export type SpecialTable = {
  [key in SpecialDay | "Weekend"]: SpecialCourseState[];
};

export const createSpecialCourseStateList = (
  courses: RegisteredCourse[],
  targetDays = fullDays
): SpecialCourseState[] => {
  const unsortedCourses = courses.reduce<
    {
      moduleFlg: ModuleFlg;
      name: string;
      room: string;
      id: string;
    }[]
  >((acc, course) => {
    const schedules: CourseSchedule[] =
      course.schedules ?? course.course?.schedules ?? [];
    const moduleFlg = schedules.reduce<ModuleFlg>(
      (moduleFlg, schedule) => {
        if (
          schedule.module === "Unknown" ||
          !targetDays.includes(schedule.day as FullDay)
        )
          return moduleFlg;
        moduleFlg[fullModulesNum(schedule.module)] = true;
        return moduleFlg;
      },
      [false, false, false, false, false, false, false, false]
    );
    if (moduleFlg.every((flg) => !flg)) return acc;
    const name = course.name ?? course.course?.name ?? "";
    const room = [...new Set(schedules.map((s) => s.room))].join(",");
    acc.push({ moduleFlg, name, room, id: course.id });
    return acc;
  }, []);

  // 比較する インデックス より前に同じ要素が存在するのか (hasSame) で大小関係が異なる
  // [T, F ...] < [F, T ...] 春A < 春B
  // [T, F ...] > [T, T ...] 春A < 春AB
  return unsortedCourses
    .sort((prev, next) => {
      let hasSame = false;
      for (let i = 0; i < 8; i++) {
        if (prev.moduleFlg[i] && next.moduleFlg[i]) hasSame = true;
        if (prev.moduleFlg[i] === next.moduleFlg[i]) continue;
        const ans = Number(prev.moduleFlg[i]) - Number(next.moduleFlg[i]);
        return hasSame ? ans : -ans;
      }
      return prev.name.localeCompare(next.name);
    })
    .map<SpecialCourseState>((c) => ({
      module: moduleFlgToDisplay(c.moduleFlg),
      name: c.name,
      room: c.room,
      id: c.id,
    }));
};
