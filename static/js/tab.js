function render_tabs() {
  const tabs = JSON.parse(Cookies.get("tabs"));
  const tabs_container = document.getElementById("tabs");
  console.log(tabs_container);
  tabs_container.replaceChildren();

  tabs.forEach((tab) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = tab.link;
    a.textContent = tab.name;

    if (window.location == tab.link) {
      li.classList.add("selected");
    }

    tabs_container.appendChild(li);
    li.appendChild(a);
  });
}
