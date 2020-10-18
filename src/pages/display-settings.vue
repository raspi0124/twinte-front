<template>
  <main class="display-settings">
    <h1>表示設定</h1>
    <article class="card">
      <h2>時間割表の設定</h2>
      <div class="card__item card__item--preview">
        <section>
          <h3>表示する項目</h3>
          <ul class="card__list">
            <li>
              <input
                @change="setSbj()"
                v-model="sbj.lecture_code"
                type="checkbox"
                name="lecture_number"
                id="lecture_number"
                class="card__checkbox"
              />
              <label class="card__check" for="lecture_number">
                <span class="material-icons checkmark">check</span> </label
              >科目番号
            </li>
            <li>
              <input
                @change="setSbj()"
                v-model="sbj.instructor"
                type="checkbox"
                name="instructor"
                id="instructor"
                class="card__checkbox"
              />
              <label class="card__check" for="instructor">
                <span class="material-icons checkmark">check</span> </label
              >担当教員
            </li>
            <li>
              <input
                @change="setSbj()"
                v-model="sbj.room"
                type="checkbox"
                name="room"
                id="room"
                class="card__checkbox"
              />
              <label class="card__check" for="room">
                <span class="material-icons checkmark">check</span> </label
              >教室名
            </li>
          </ul>
        </section>

        <!-- 時間割表のプレビュー -->
        <Subject class="card__subject" :data="sampleData" click="disable" />
      </div>

      <section class="card__item">
        <h3>文字の大きさ</h3>
        <div class="card__fontsizebtn-flex">
          <label>
            <input
              @change="setSbj()"
              v-model="sbj.font_size"
              type="radio"
              value="small"
              class="card__selectbutton"
            />
            <span class="card__fontsize-btn card__fontsize-btn--small">小</span>
          </label>
          <label>
            <input
              @change="setSbj()"
              v-model="sbj.font_size"
              type="radio"
              value="medium"
              class="card__selectbutton"
            />
            <span class="card__fontsize-btn card__fontsize-btn--middle"
              >中</span
            >
          </label>
          <label>
            <input
              @change="setSbj()"
              v-model="sbj.font_size"
              type="radio"
              value="large"
              class="card__selectbutton"
            />
            <span class="card__fontsize-btn card__fontsize-btn--big">大</span>
          </label>
        </div>
        <!-- <button @click="setSbj()">保存</button> -->
      </section>
    </article>
    <article class="card">
      <h2>カラーテーマの設定</h2>
      <div class="card__item">
        <ul class="card__list">
          <li>
            <input
              type="radio"
              name="color-theme"
              id="light-theme"
              class="card__radiobutton"
            />
            <label class="card__radio" for="light-theme">
              <span class="radiomark"></span></label
            >ライトテーマ
          </li>
          <li>
            <input
              type="radio"
              name="color-theme"
              id="dark-theme"
              class="card__radiobutton"
            />
            <label class="card__radio" for="dark-theme">
              <span class="radiomark"></span></label
            >ダークテーマ
          </li>
        </ul>
      </div>
    </article>
  </main>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import * as Vuex from 'vuex'
import { Period, SubjectSettings } from '../types'
import cloneDeep from 'lodash/cloneDeep'
import { Day, Module } from 'twinte-parser'

@Component({
  components: {
    Subject: () => import('~/components/ui-subject.vue'),
    TButton: () => import('~/components/global/button.vue'),
  },
})
export default class DisplaySettings extends Vue {
  $store!: Vuex.ExStore

  sbj: SubjectSettings = {
    lecture_name: false,
    lecture_code: false,
    instructor: false,
    room: false,
    font_size: 'medium',
  }

  sampleData: Period = {
    lecture_code: '0A00000',
    lecture_name: '科目名',
    instructor: '担当教員',
    year: 2019,
    module: '秋C' as Module,
    day: '木' as Day,
    period: 4,
    room: '0A000',
    user_lecture_id: 'sampledata',
    formats: [],
  }

  setSbj() {
    this.$store.commit('visible/setDisplaySubject', this.sbj)
    this.sbj = cloneDeep(this.$store.getters['visible/subject'])
    localStorage.setItem('subject', JSON.stringify(this.sbj))
  }

  mounted() {
    this.sbj = cloneDeep(this.$store.getters['visible/subject'])
  }
}
</script>

<style scoped lang="scss">
@import '~/assets/css/variable.scss';

.display-settings {
  padding: 1vh 6vw;
  max-width: 70vh;
  margin: 0 auto;

  h1 {
    font-size: 1.6rem;
    font-weight: 400;
    margin-bottom: 2vh;
  }

  .card {
    background-color: white;
    border-radius: 1rem;
    box-shadow: $middle-shadow;
    margin: 1vh auto 2vh auto;
    padding: 3vh 5vmin;

    h2 {
      font-size: 1.5rem;
      color: $primary-color;
      font-weight: 400;
      margin: 0 0 3vh;
    }

    &__item {
      padding-left: 1rem;
      &--preview {
        display: flex;
        justify-content: flex-start;
      }
    }

    h3 {
      font-size: 1.4rem;
      font-weight: 400;
      margin: 0 0 1vh;
    }

    &__list {
      margin: 0 0 3vh 0;
      font-size: 1.4rem;
      line-height: 2.5 * 1.4rem;
      list-style: none;
      padding-left: 0;
      flex-shrink: 0;
    }

    &__subject {
      position: relative;
      margin-left: 20%;
      transform: translateY(50%);
      -ms-wrap-margin: 0;
      width: 12vw;
      height: calc(14vh - 3vmin);
    }

    &__check {
      position: relative;
      display: inline-block;
      width: 1.9rem;
      height: 1.9rem;
      vertical-align: middle;
      border: 0.14rem solid $element-gray;
      border-radius: 20% 20%;
      margin-right: 0.9rem;
      cursor: pointer;
      user-select: none;
      .checkmark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateY(-50%) translateX(-50%);
        font-size: 100%;
        color: $element-gray;
        cursor: pointer;
        user-select: none;
      }
    }

    &__checkbox:checked ~ .card__check {
      border: 0.14rem solid $primary-color;
      background-color: $primary-color;
      .checkmark {
        color: $white;
        font-weight: bold;
      }
    }

    input {
      display: none;
    }

    &__fontsizebtn-flex {
      display: flex;
      vertical-align: middle;
      justify-content: flex-start;
      flex-wrap: wrap;
      width: 100%;
    }
    &__fontsize-btn {
      display: block;
      width: 6rem;
      height: 3rem;
      margin-top: 1vh;
      margin-right: 3vh;
      background-color: white;
      color: $element-gray;
      text-align: center;
      line-height: 3rem;
      border: $element-gray 0.14rem solid;
      border-radius: 3rem;
      user-select: none;
      &--small {
        font-size: 1.5rem;
      }
      &--middle {
        font-size: 1.8rem;
      }
      &--big {
        font-size: 2rem;
      }
    }
    &__selectbutton:checked ~ .card__fontsize-btn {
      border: $primary-color 0.14rem solid;
      background-color: $primary-color;
      color: white;
      opacity: 1;
    }

    &__radio {
      position: relative;
      display: inline-block;
      width: 1.9rem;
      height: 1.9rem;
      vertical-align: middle;
      border: 0.16rem solid $element-gray;
      border-radius: 50% 50%;
      margin-right: 0.9rem;
      cursor: pointer;
      user-select: none;
      .radiomark {
        display: none;
        cursor: pointer;
        user-select: none;
      }
    }

    &__radiobutton:checked ~ .card__radio {
      border: 0.16rem solid $primary-color;
      .radiomark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateY(-50%) translateX(-50%);
        display: inline-block;
        width: 1.3rem;
        height: 1.3rem;
        background-color: $primary-color;
        border-radius: 50% 50%;
      }
    }
  }
}
</style>
