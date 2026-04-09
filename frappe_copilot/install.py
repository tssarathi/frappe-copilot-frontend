"""Post-install: create module and default settings."""

import frappe


def after_install() -> None:
    """Create the Frappe Copilot module and Copilot Settings singleton."""
    if not frappe.db.exists("Module Def", "Frappe Copilot"):
        doc = frappe.new_doc("Module Def")
        doc.module_name = "Frappe Copilot"
        doc.app_name = "frappe_copilot"
        doc.insert(ignore_permissions=True)

    if not frappe.db.exists("Copilot Settings"):
        doc = frappe.new_doc("Copilot Settings")
        doc.insert(ignore_permissions=True)

    frappe.db.commit()
