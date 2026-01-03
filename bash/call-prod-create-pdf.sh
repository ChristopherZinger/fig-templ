


TOKEN="ae3304164b9ce830e1fc7506895b56383a085e36241e9af39458777048052cd6"
TEMPLATE_ID="5OZe94b7NQsqFmkE8tkm"

curl -X POST https://api.templetto.com/create-pdf?template-id=$TEMPLATE_ID \
  -H "authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hello": "ffffff",
    "Another": "ggggg",
    "img_qcq": "https://i.natgeofe.com/k/327b01e8-be2e-4694-9ae9-ae7837bd8aea/mallard-male-swimming_3x2.jpg"
  }'


# TOKEN="5c6af54d1760eb9181ae4ac6d81edb908b2393e82e397f910e403bafbdbd7edb"
# TEMPLATE_ID="eiD0m3J5ZiQvLspPWVJ9"

# curl -X POST https://api.templetto.com/create-pdf?template-id=$TEMPLATE_ID \
#   -H "authorization: Bearer $TOKEN" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "name": "This Plugin Is Making Money",
#     "button_name": "Doge To The Moon",
#     "product_1_name": "Templetto - Figma Plugin",
#     "product_1_description": "Turn your Figma designs into PDF documents with our powerful API. Template your designs and generate professional PDFs at scale.",
#     "product_2_name": "Templetto - Web App",
#     "product_2_description": "Create and manage your templates and generate PDFs at scale.",
#     "product_3_name": "Templetto - API",
#     "product_3_description": "Generate PDFs from your Figma designs with our powerful API."
#   }'