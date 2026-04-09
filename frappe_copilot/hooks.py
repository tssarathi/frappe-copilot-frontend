app_name = "frappe_copilot"
app_title = "Frappe Copilot"
app_publisher = "Vyogo Technologies"
app_description = "AI sidebar for ERPNext"
app_email = "hello@vyogo.com"
app_license = "MIT"
app_version = "0.1.0"
app_color = "#4F46E5"

app_include_js = ["/assets/frappe_copilot/frontend/dist/js/frappe_copilot.js"]
app_include_css = ["/assets/frappe_copilot/css/copilot.css"]

after_install = "frappe_copilot.install.after_install"
