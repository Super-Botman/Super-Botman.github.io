function custom_command(command, args) {
  switch (command) {
    case "showintro":
      Cookies.set("intro", "true");
      window.location.href = "/";
      break;

    default:
  }
}
