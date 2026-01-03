const token =
  "5c6af54d1760eb9181ae4ac6d81edb908b2393e82e397f910e403bafbdbd7edb";
const templateId = "eiD0m3J5ZiQvLspPWVJ9";

async function foo(idx) {
  console.log(`${idx} - Hello`);
  const res = await fetch(
    `https://api.templetto.com/create-pdf?template-id=${templateId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: `${idx} - Hello`,
        button_name: "Doge To The Moon",
        product_1_name: "Templetto - Figma Plugin",
        product_1_description:
          "Turn your Figma designs into PDF documents with our powerful API. Template your designs and generate professional PDFs at scale.",
        product_2_name: "Templetto - Web App",
        product_2_description:
          "Create and manage your templates and generate PDFs at scale.",
        product_3_name: "Templetto - API",
        product_3_description:
          "Generate PDFs from your Figma designs with our powerful API.",
      }),
    }
  );

  console.log(await res.text());
}

await Promise.allSettled(Array.from({ length: 5 }, foo));
