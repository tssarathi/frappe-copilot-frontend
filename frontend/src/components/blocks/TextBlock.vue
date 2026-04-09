<script setup lang="ts">
import { computed } from "vue";
import MarkdownIt from "markdown-it";
import type { TextBlock } from "@/types/blocks";

const props = defineProps<{ block: TextBlock }>();

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

// Open links in new tab
const defaultRender =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  tokens[idx].attrSet("target", "_blank");
  tokens[idx].attrSet("rel", "noopener");
  return defaultRender(tokens, idx, options, env, self);
};

const rendered = computed(() => md.render(props.block.content || ""));
</script>

<template>
  <div class="copilot-markdown" v-html="rendered"></div>
</template>
