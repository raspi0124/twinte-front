<template>
  <PageHeader>
    <template #left-button-icon>
      <IconButton
        size="large"
        color="normal"
        icon-name="arrow_back"
        @click="$router.back()"
      ></IconButton>
    </template>
    <template #title>CSVファイルから追加</template>
  </PageHeader>
  <div class="main">
    <div class="main__csv csv">
      <p class="csv__header">CSVファイル</p>
      <InputButtonFile
        name="csv-file"
        accept="text/csv"
        @change-file="loadCourses"
      >
        アップロードする
      </InputButtonFile>
    </div>
    <div class="main__courses courses">
      <div class="courses__contents">
        <CardCourse
          v-for="course in loadedCourses"
          :key="courseToCard(course.course).id"
          :isChecked="course.isSelected"
          :course="courseToCard(course.course)"
          @click-checkbox="course.isSelected = !course.isSelected"
        >
        </CardCourse>
      </div>
    </div>
    <div class="main__button">
      <Button
        size="large"
        layout="fill"
        color="primary"
        :pauseActiveStyle="false"
        :state="btnState"
        @click="addCourse()"
        >選択した授業を追加</Button
      >
    </div>
  </div>
  <Modal
    v-if="duplicationModal"
    class="duplication-modal"
    @click="closeDuplicationModal"
  >
    <template #title>開講時限が重複しています</template>
    <template #contents>
      <p class="modal__text">
        以下の授業のコマには既に授業が登録されています。そのまま追加してよろしいですか？（当該のコマには複数の授業が登録されます。）
      </p>
      <div class="modal__courses">
        <div
          v-for="duplicatedCourse in duplicatedCourses"
          :key="duplicatedCourse.name"
          class="duplicated-course"
        >
          <p class="duplicated-course__name">{{ duplicatedCourse.name }}</p>
          <CourseDetailMini
            class="duplicated-course__detail"
            iconName="schedule"
            :text="periodToString(duplicatedCourse.schedules)"
          ></CourseDetailMini>
        </div>
      </div>
    </template>
    <template #button>
      <Button
        size="medium"
        layout="fill"
        color="base"
        @click="closeDuplicationModal"
        >キャンセル</Button
      >
      <Button
        size="medium"
        layout="fill"
        color="primary"
        @click="addCourse(false)"
        >そのまま追加</Button
      >
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Course } from "~/api/@types";
import Button from "~/components/Button.vue";
import CardCourse from "~/components/CardCourse.vue";
import CourseDetailMini from "~/components/CourseDetailMini.vue";
import IconButton from "~/components/IconButton.vue";
import InputButtonFile from "~/components/InputButtonFile.vue";
import Modal from "~/components/Modal.vue";
import PageHeader from "~/components/PageHeader.vue";
import { courseToCard } from "~/entities/courseCard";
import { displayToast } from "~/entities/toast";
import { useSwitch } from "~/hooks/useSwitch";
import { usePorts } from "~/usecases";
import { bulkAddCourseById } from "~/usecases/bulkAddCourseById";
import { extractMessageOrDefault } from "~/usecases/error";
import { getCoursesByCode } from "~/usecases/getCourseByCode";
import { getDuplicatedCourses } from "~/usecases/getDuplicatedCourses";
import { getYear } from "~/usecases/getYear";
import { periodToString } from "~/usecases/periodToString";
import { getCoursesIdByFile } from "~/usecases/readCSV";

export default defineComponent({
  name: "CSV",
  components: {
    Button,
    CardCourse,
    CourseDetailMini,
    IconButton,
    InputButtonFile,
    Modal,
    PageHeader,
  },
  setup() {
    const router = useRouter();
    const ports = usePorts();

    const loadedCourses = ref<{ course: Course; isSelected: boolean }[]>([]);

    /** button */
    const btnState = computed(() => {
      if (loadedCourses.value.some((v) => v.isSelected)) return "default";
      else return "disabled";
    });

    /** deulpication modal */
    const [
      duplicationModal,
      openDuplicationModal,
      closeDuplicationModal,
    ] = useSwitch();
    const duplicatedCourses = ref<Required<Course>[]>([]);

    const addCourse = async (showWarning = true) => {
      if (btnState.value === "disabled") return;
      const year = await getYear(ports);
      duplicatedCourses.value = getDuplicatedCourses(ports)(
        loadedCourses.value.filter((v) => v.isSelected).map((v) => v.course),
        year
      );
      if (showWarning && duplicatedCourses.value.length > 0) {
        openDuplicationModal();
        return;
      }
      try {
        await bulkAddCourseById(ports)(
          loadedCourses.value
            .filter((v) => v.isSelected)
            .map((v) => v.course.code)
        );
        router.push("/");
      } catch (error) {
        console.error(error);
        displayToast(ports)(extractMessageOrDefault(error));
      }
    };

    const loadCourses = async (file: File) => {
      loadedCourses.value = [];
      let courseCodes: string[] = [];
      try {
        const csv = await getCoursesIdByFile(file);
        switch (csv.type) {
          case "risyu":
            courseCodes = csv.data;
            break;
          case "seiseki": {
            const year = await getYear(ports);
            displayToast(ports)(`${year}年度の授業を読み込んでいます。`, {
              type: "primary",
            });
            courseCodes = csv.data
              .filter((v) => v.year === year)
              .map((v) => v.code);
            break;
          }
        }
      } catch (error) {
        console.error(error);
        displayToast(ports)("ファイルの読み込みに失敗しました。");
        return;
      }

      let fetchedCourses: Course[] = [];
      let missingCourseCodes: string[] = [];

      if (courseCodes.length === 0) {
        displayToast(ports)(`読み込むコースがありません。`);
        return;
      }

      try {
        const res = await getCoursesByCode(ports)(courseCodes);
        fetchedCourses = res.courses;
        missingCourseCodes = res.missingCourseCodes;
      } catch (error) {
        console.error(error);
        displayToast(ports)(extractMessageOrDefault(error));
        return;
      }
      loadedCourses.value = fetchedCourses.map((course) => ({
        course,
        isSelected: true,
      }));

      if (missingCourseCodes.length > 0) {
        displayToast(
          ports
        )(
          `以下の講義番号はシラバスに存在しませんでした。存在する講義のみを表示しています。\n${missingCourseCodes.join(
            "  "
          )}`,
          { displayPeriod: 0 }
        );
      }
    };

    return {
      addCourse,
      btnState,
      closeDuplicationModal,
      courseToCard,
      duplicatedCourses,
      duplicationModal,
      loadCourses,
      loadedCourses,
      openDuplicationModal,
      periodToString,
    };
  },
});
</script>

<style scoped lang="scss">
@import "~/styles";

.header {
  max-width: 900px;
}
.main {
  max-width: 900px;
  &__csv {
    margin-top: $spacing-8;
  }
  &__courses {
    margin-top: $spacing-5;
  }
  &__error {
    margin-top: $spacing-6;
    height: calc(#{$vh} - 26.1rem);
    @include landscape {
      height: calc(#{$vh} - 26.5rem);
    }
    color: getColor(--danger);
    line-height: 2rem;
  }
  &__button {
    margin: $spacing-3 $spacing-0 $spacing-6;
    @include center-flex;
    @include landscape {
      margin-bottom: $spacing-7;
    }
  }
}
.csv {
  &__header {
    font-weight: 500;
    line-height: $single-line;
    margin-bottom: $spacing-4;
  }
}
.courses {
  height: calc(#{$vh} - 25.7rem);
  @include landscape {
    height: calc(#{$vh} - 26.1rem);
  }
  overflow-y: auto;
  margin-right: -($spacing-4);
  padding-right: $spacing-4;
  @include scroll-mask;
  &__contents {
    display: grid;
    gap: $spacing-3;
    margin: $spacing-3 $spacing-0 $spacing-14;
  }
}
.duplication-modal .modal {
  &__text {
    line-height: $multi-line;
    margin-bottom: 3rem;
  }
  &__courses {
    display: grid;
    gap: $spacing-4;
  }
  .button {
    width: calc(50% - $spacing-3);
    &:first-child {
      margin-right: $spacing-3;
    }
    &:last-child {
      margin-left: $spacing-3;
    }
  }
}
.duplicated-course {
  @include center-flex(column);
  align-items: flex-start;
  &__name {
    font-weight: 500;
    line-height: $single-line;
    margin-bottom: $spacing-1;
  }
}
</style>
