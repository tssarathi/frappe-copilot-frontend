frappe.ui.form.on("Copilot Settings", {
  refresh(frm) {
    frm.add_custom_button(__("Test Connection"), function () {
      frm.call("test_connection").then((r) => {
        if (r.message && r.message.success) {
          frappe.msgprint({
            title: __("Success"),
            indicator: "green",
            message: r.message.message,
          });
        } else {
          frappe.msgprint({
            title: __("Connection Failed"),
            indicator: "red",
            message: r.message ? r.message.message : "Unknown error",
          });
        }
      });
    });
  },
});
