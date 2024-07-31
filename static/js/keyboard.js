const keys = {
  13: "enter",
  17: "ctrl",
  27: "esc",
  72: "h",
  74: "j",
  75: "k",
  76: "l",
  87: "w",
};

function exec(event) {
  event = event || window.event;
  let element = document.activeElement;

  const keycode = event.keyCode || event.which;
  const key = keys[keycode];
  const is_page = element.classList.contains("page");
  const is_viewer = element.id == "viewer";

  if (window.event.shiftKey) {
    switch (key) {
      case "l":
        document.getElementById("viewer").focus();
        Cookies.set("focused", "viewer");
        break;

      case "h":
        document.getElementById("files").focus();
        Cookies.set("focused", "files");
        break;
    }
  } else {
    switch (key) {
      case "esc":
        document.getElementById("setter").focus();
        document.getElementById("setter").value = "";
        break;

      case "enter":
        const url =
          element.getElementsByClassName("selected")[0].attributes.href.value;
        window.location.href = url;
        break;

      case "j":
        if (is_viewer && is_page) {
          element.scrollBy(0, 30);
        } else {
          next_element(1, element);
        }
        break;

      case "k":
        if (is_viewer && is_page) {
          element.scrollBy(0, -30);
        } else {
          next_element(-1, element);
        }
        break;
    }
  }
}

function next_element(incrementer, element) {
  const a = element.getElementsByClassName("selected")[0];
  const index = parseInt(a.attributes.tabindex.value);
  const next_element = element.querySelector(
    `[tabindex='${index + incrementer}']`,
  );

  if (next_element) {
    next_element.classList.add("selected");
    a.classList.remove("selected");
  }
}
