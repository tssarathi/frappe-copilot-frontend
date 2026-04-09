"""Copilot Settings — singleton DocType for sidebar configuration."""

from __future__ import annotations

import socket
from urllib.parse import urlparse

import frappe
from frappe.model.document import Document


class CopilotSettings(Document):
    enabled: int
    agent_url: str
    sidebar_width: int
    keyboard_shortcut: str

    def validate(self) -> None:
        if self.sidebar_width and not (300 <= self.sidebar_width <= 600):
            frappe.throw("Sidebar width must be between 300 and 600 pixels.")

    @frappe.whitelist()
    def test_connection(self) -> dict:
        """Test WebSocket connectivity to the agent service."""
        try:
            parsed = urlparse(self.agent_url)
            host = parsed.hostname or "localhost"
            port = parsed.port or (443 if parsed.scheme == "wss" else 8484)
            sock = socket.create_connection((host, port), timeout=5)
            sock.close()
            return {"success": True, "message": f"Connected to {host}:{port}"}
        except Exception as e:
            return {"success": False, "message": str(e)}
