export function onClickDownloadTemplate({
  htmlString,
}: {
  htmlString: string;
}) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(htmlString)
  );
  element.setAttribute("download", "index.html");
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
