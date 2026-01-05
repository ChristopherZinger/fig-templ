import * as cheerio from "cheerio";
import Handlebars from "handlebars";

const $ = cheerio.load(`<html><body>
    <div data-loop-data-key="my_loop_data_key">
        <div>
            <div>child {{ @index }}</div>
            <div>{{ foo }}</div>
            <div>{{ bar }}</div>
        </div

        <div>
            <div>child 2</div>
            <div>{{ foo }}</div>
            <div>{{ bar }}</div>
        </div
    </div>

    <div data-loop-data-key="users">
        <div>
            <div>child {{ @index }}</div>
            <div>{{ foo }}</div>
            <div>{{ bar }}</div>
        </div

        <div>
            <div>child 2</div>
            <div>{{ foo }}</div>
            <div>{{ bar }}</div>
        </div
    </div>

  </body></html>`);

$("div[data-loop-data-key]").each((_, element) => {
  const loopDataKey = $(element).attr("data-loop-data-key");
  const firstChild = $(element).children().first();
  $(element).html(
    `{{#each ${loopDataKey} }}
       ${firstChild}
    {{/each}}`
  );
});

const templateHtml = $.html();

const htmlToRender = Handlebars.compile(templateHtml)({
  my_loop_data_key: [
    { foo: "foo 1", bar: "bar 1" },
    { foo: "foo 2", bar: "bar 2" },
  ],
  users: [
    { foo: "adam", bar: "smith" },
    { foo: "chris", bar: "doe" },
  ],
});

console.log(htmlToRender);
