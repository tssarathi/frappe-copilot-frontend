<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import ChatSidebar from "./components/ChatSidebar.vue";

const props = defineProps<{
  agentUrl: string;
  sidebarWidth: number;
  keyboardShortcut: string;
}>();

const visible = ref(false);

function toggle() {
  visible.value = !visible.value;
  document.dispatchEvent(
    new CustomEvent(visible.value ? "copilot-opened" : "copilot-closed"),
  );
}

function handleClose() {
  visible.value = false;
  document.dispatchEvent(new CustomEvent("copilot-closed"));
}

onMounted(() => {
  document.addEventListener("copilot-toggle", toggle);
});

onUnmounted(() => {
  document.removeEventListener("copilot-toggle", toggle);
});
</script>

<template>
  <Transition name="copilot-slide">
    <ChatSidebar
      v-if="visible"
      :agent-url="agentUrl"
      :sidebar-width="sidebarWidth"
      :keyboard-shortcut="keyboardShortcut"
      :visible="visible"
      @close="handleClose"
    />
  </Transition>
  <Transition name="copilot-fade">
    <div v-if="visible" class="copilot-overlay" @click="handleClose"></div>
  </Transition>
</template>
