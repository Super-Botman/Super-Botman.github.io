let cursor;
window.onload = init;

function init() {
  cursor = document.getElementById("cursor");
  cursor.style.left = "0px";
  document.getElementById("setter").value = "";

  const default_config = {
    mouse: true,
  };
  if (!Cookies.get("config"))
    Cookies.set("config", JSON.stringify(default_config));
  if (!Cookies.get("focused")) Cookies.set("focused", "viewer");
  if (!Cookies.get("tabs")) Cookies.set("tabs", JSON.stringify([]));

  render_tabs();
  exec_config();
  document.getElementById(Cookies.get("focused")).focus();
}
