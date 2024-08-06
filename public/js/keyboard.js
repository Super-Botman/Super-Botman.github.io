const keys = {
  9: "tab",
  13: "enter",
  17: "ctrl",
  27: "esc",
  32: "space",
  72: "h",
  74: "j",
  75: "k",
  76: "l",
  81: "q",
  84: "t",
  87: "w",
};

function exec(event) {
  event = event || window.event;
  let element = document.activeElement;

  const keycode = event.keyCode || event.which;
  const key = keys[keycode];
  const is_page = element.classList.contains("page");
  const is_viewer = element.id == "viewer";
  const is_files = element.id == "files";
  const is_prompt = element.id == "setter";

  if (key && (is_viewer || is_files)) event.preventDefault();

  element = is_viewer ? document.getElementById("content") : element;

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

      case "t":
        new_tab(element);
        break;

      case "q":
        del_tab();
        break;
    }
  } else {
    switch (key) {
      case "esc":
        document.getElementById("setter").focus();
        document.getElementById("setter").value = "";
        break;

      case "space":
        element = document.getElementById("intro");
        if (element) {
          window.location.href = "/readme";
          Cookies.set("intro", "");
        }
        break;

      case "enter":
        if (is_prompt) {
          command();
        } else {
          new_tab(element, true);
        }
        break;

      case "tab":
        if (is_viewer) {
          next_tab();
        }
        break;

      case "j":
        if (is_viewer && is_page) {
          element.scrollBy(0, 30);
        } else if (!is_prompt) {
          next_file(-1, element);
        }
        break;

      case "k":
        if (is_viewer && is_page) {
          element.scrollBy(0, -30);
        } else if (!is_prompt) {
          next_file(1, element);
        }
        break;

      case "l":
        if (!is_prompt) {
          element.scrollBy(30, 0);
        }
        break;

      case "h":
        if (!is_prompt) {
          element.scrollBy(-30, 0);
        }
        break;
    }
  }
}

function next_file(incrementer, element) {
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
