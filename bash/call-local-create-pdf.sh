#!/bin/bash


TOKEN="ae3304164b9ce830e1fc7506895b56383a085e36241e9af39458777048052cd6"
TEMPLATE_ID="5OZe94b7NQsqFmkE8tkm"

curl -X POST http://localhost:3000/create-pdf?template-id=$TEMPLATE_ID \
  -H "authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hello": "ffffff",
    "Another": "ggggg",
    "img_qcq": "https://i.natgeofe.com/k/327b01e8-be2e-4694-9ae9-ae7837bd8aea/mallard-male-swimming_3x2.jpg"
  }'



