function custom_command(command, args) {
  switch (command) {
    case "showintro":
      Cookies.set("intro", "true");
      window.location.href = "/";
      break;

    default:
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function custom_init() {
  if (window.location.pathname == "/") {
    if (Cookies.get("intro") == "false") {
      window.location.href = "/readme";
    }

    const text = [
      "Welcome",
      "My pseudo is Botman",
      "I'm a big fan of neovim",
      "So I developed this website to hold my WU",
      "Enjoy!",
    ];

    const element = document.getElementsByTagName("body")[0];

    element.innerHTML = "";
    element.classList.add("intro");
    element.style = `background: radial-gradient(circle, rgba(26, 82, 205, 1) 0%, rgba(2, 0, 36, 1) 100%);`;

    for (let i = 0; i < text.length; i++) {
      const h1 = document.createElement("h1");
      element.appendChild(h1);

      let word = text[i];
      const max_percentage = 300;

      let span_array = [];
      for (let j = 0; j < word.length; j++) {
        await sleep(100);
        const span = document.createElement("span");
        span.innerHTML = word[j].replace(" ", "&nbsp;");
        span_array.push(span);
        h1.appendChild(span);
        h1.style = `background-image: -webkit-linear-gradient(0deg, #fff, transparent 
                    ${(max_percentage / word.length) * (j + 1)}%);`;
      }

      await sleep(100 * word.length);

      for (let j = word.length - 1; j >= 0; j--) {
        await sleep(60);
        h1.removeChild(span_array[j]);
        h1.style = `background-image: -webkit-linear-gradient(0deg, #fff, transparent 
                    ${max_percentage * 1.2 - (max_percentage / word.length) * (j + 1)}%);`;
      }

      element.removeChild(h1);
    }

    for (let i = 100; i >= 0; i--) {
      element.style = `background: radial-gradient(circle, rgba(26, 82, 205, ${i / 100}) 0%, rgba(2, 0, 36, ${i / 100}) 100%);`;
      await sleep(5);
    }

    element.remove();
    Cookies.set("intro", "false");
    window.location.href = "/readme";
  }
}
