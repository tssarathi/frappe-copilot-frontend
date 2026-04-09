/** JWT token management for Agent authentication. */

import { ref, readonly } from "vue";

declare const frappe: any;

const token = ref<string>("");
const tokenExpiry = ref<number>(0);

export function useAuth() {
  async function fetchToken(): Promise<string> {
    const now = Date.now() / 1000;
    if (token.value && tokenExpiry.value > now + 300) {
      return token.value;
    }

    try {
      const result = await frappe.call({
        method: "frappe_copilot.api.get_auth_token",
        async: true,
      });
      if (result?.message?.token) {
        token.value = result.message.token;
        const b64 = result.message.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(b64));
        tokenExpiry.value = payload.exp || 0;
        return token.value;
      }
    } catch {
      token.value = "";
      tokenExpiry.value = 0;
    }
    return "";
  }

  function clearToken(): void {
    token.value = "";
    tokenExpiry.value = 0;
  }

  return {
    token: readonly(token),
    fetchToken,
    clearToken,
  };
}
