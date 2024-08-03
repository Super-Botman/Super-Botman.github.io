function command() {
  const setter = document.getElementById("setter");
  const writer = document.getElementById("writer");
  const input = setter.value.substring(1).split(" ");
  const command = input[0];
  const args = input.shift();

  console.log(args);
  console.log(command);

  switch (command) {
    case "help":
      window.location.href = "/test";
      break;

    default:
      setter.value = JSON.stringify({
        type: "error",
        message: "command not found",
      });
  }
}
