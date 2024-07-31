function writeit(from, event) {
  let w = document.getElementById("writer");
  w.innerHTML = from.value.replaceAll(" ", "&nbsp");
}

function moveIt(count, event) {
  event = event || window.event;
  let keycode = event.keyCode || event.which;

  cursor.style.display = count == 0 ? "none" : "block";

  left = parseInt(cursor.style.left);
  cursor_width = "3px";

  if (keycode == 37 && left >= 0 - (count - 1) * 13) {
    cursor.style.left = left - 13 + "px";
  } else if (keycode == 39 && left + 13 <= 0) {
    cursor.style.left = left + 13 + "px";
  } else {
    cursor_width = "13px";
  }

  cursor.style.width = cursor_width;
}
