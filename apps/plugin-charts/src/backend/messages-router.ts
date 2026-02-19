export function setMessageRouter(figma: PluginAPI) {
  figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
      case "create_chart":
        // receive html string and create figm svg
        const { chartHtmlSting } = msg.data;
        console.log("create_chart", chartHtmlSting);
        if (!chartHtmlSting) {
          console.error("cant_create_chart_no_svg_html_string");
          return;
        }
        figma.createNodeFromSvg(chartHtmlSting);
        break;
      default:
        console.log("got_unknown_message_in_main_thread", msg);
        break;
    }
  };
}
