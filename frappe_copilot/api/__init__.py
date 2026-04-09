"""Public API for the Copilot frontend."""

from __future__ import annotations

import os
from datetime import UTC, datetime, timedelta

import frappe
import jwt


@frappe.whitelist()
def get_settings() -> dict:
    """Return Copilot Settings for the frontend."""
    settings = frappe.get_single("Copilot Settings")
    return {
        "enabled": bool(settings.enabled),
        "agent_url": settings.agent_url,
        "sidebar_width": settings.sidebar_width or 380,
        "keyboard_shortcut": settings.keyboard_shortcut or "Ctrl+/",
    }


@frappe.whitelist()
def get_auth_token() -> dict:
    """Generate a JWT for the current user to authenticate with the Agent."""
    secret = os.environ.get("COPILOT_JWT_SECRET", "")
    if not secret:
        frappe.throw("COPILOT_JWT_SECRET environment variable is not set.")

    user = frappe.session.user
    now = datetime.now(UTC)
    payload = {
        "sub": user,
        "sid": frappe.session.sid,
        "site": frappe.local.site,
        "iat": now,
        "exp": now + timedelta(hours=24),
    }
    token = jwt.encode(payload, secret, algorithm="HS256")
    return {"token": token}
