let cursor;
window.onload = init;

function init() {
  cursor = document.getElementById("cursor");
  cursor.style.left = "0px";
  document.getElementById("setter").value = "";

  if (!Cookies.get("focused")) Cookies.set("focused", "viewer");
  if (!Cookies.get("tabs")) Cookies.set("tabs", JSON.stringify([]));

  render_tabs();
  document.getElementById(Cookies.get("focused")).focus();
}
