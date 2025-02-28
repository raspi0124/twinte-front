<template>
  <div v-if="hasError" class="error">
    <Error :errorMessage="errorMessage"></Error>
  </div>
  <Suspense v-else>
    <template #default>
      <Layout>
        <router-view v-if="!hasError" />
      </Layout>
    </template>
    <template #fallback>
      <div class="loading">now loading...</div>
    </template>
  </Suspense>
</template>

<script lang="ts">
import { useDark } from "@vueuse/core";
import { defineComponent, onErrorCaptured, onMounted, ref } from "vue";
import Error from "~/components/errro.vue";
import Layout from "~/templates/Layout.vue";
import { isErrorObj } from "~/usecases/error";

export default defineComponent({
  name: "App",
  components: { Error, Layout },
  setup: () => {
    useDark({
      selector: "body",
    });

    // unregister service worker (v2)
    onMounted(() => {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    });

    const hasError = ref(false);
    const errorMessage = ref("");
    onErrorCaptured((error) => {
      hasError.value = true;
      if (isErrorObj(error)) {
        errorMessage.value = error.message ?? "";
      }
    });
    return { hasError, errorMessage };
  },
});
</script>

<style scoped lang="scss">
@import "~/styles";

.loading {
  @include center-asolute;
  opacity: 0.5;
}
</style>
