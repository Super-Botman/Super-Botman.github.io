const keys = {
  9: "tab",
  13: "enter",
  17: "ctrl",
  27: "esc",
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

      case "enter":
        new_tab(element, true);
        break;

      case "tab":
        if (is_viewer) {
          next_tab();
        }
        break;

      case "j":
        if (is_viewer && is_page) {
          console.log("a");
          console.log(element);
          element.scrollBy(0, 30);
        } else {
          next_element(-1, element);
        }
        break;

      case "k":
        if (is_viewer && is_page) {
          element.scrollBy(0, -30);
        } else {
          next_element(1, element);
        }
        break;
    }
  }
}

function next_element(incrementer, element) {
  const a = element.getElementsByClassName("selected")[0];
  console.log(a);
  const index = parseInt(a.attributes.tabindex.value);
  const next_element = element.querySelector(
    `[tabindex='${index + incrementer}']`,
  );

  if (next_element) {
    next_element.classList.add("selected");
    a.classList.remove("selected");
  }
}

function new_tab(element, is_enter) {
  const a = element.getElementsByClassName("selected")[0];
  let name = a.textContent.split(" ");
  name.shift();
  name = name.join(" ");

  const page = {
    link: a.href,
    name: name,
  };

  tabs = JSON.parse(Cookies.get("tabs"));

  check = tabs.find((t) => t.link == page.link);

  if (check) {
    window.location.href = page.link;
    return;
  }

  tabs = is_enter ? tabs.filter((p) => p.link !== window.location.href) : tabs;
  tabs.push(page);
  Cookies.set("tabs", JSON.stringify(tabs));

  window.location.href = page.link;
}

function del_tab() {
  const element = document.getElementById("tabs");
  const a = element.getElementsByClassName("selected")[0];
  console.log(a);
  let name = a.textContent;

  const page = {
    link: a.href,
    name: name,
  };

  tabs = JSON.parse(Cookies.get("tabs"));
  tabs = tabs.filter((p) => p.name !== page.name);
  Cookies.set("tabs", JSON.stringify(tabs));
  window.location.href = "/";
}

function next_tab() {
  const element = document.getElementById("tabs");
  const a = element.getElementsByClassName("selected")[0];

  const previous_element = a.previousElementSibling;
  const next_element = a.nextElementSibling;
  let url = "";

  if (!previous_element) {
    url = next_element.firstElementChild.href;
  } else if (!next_element) {
    url = previous_element.firstElementChild.href;
  } else {
    url =
      next_element.firstElementChild.href == document.referrer
        ? previous_element.firstElementChild.href
        : next_element.firstElementChild.href;
  }

  window.location.href = url;
}
