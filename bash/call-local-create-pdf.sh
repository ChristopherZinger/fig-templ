#!/bin/bash


TOKEN="5c6af54d1760eb9181ae4ac6d81edb908b2393e82e397f910e403bafbdbd7edb"
TEMPLATE_ID="t3AYthZPy0pUb327mqA7"

curl -X POST http://localhost:3000/create-pdf?template-id=$TEMPLATE_ID \
  -H "authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key_name_placeholder": [
      { "company_name": "ABC Inc.", "used": 13, "thing_name": "Cameras", "foo": 42, "bar": 35 },
      { "company_name": "DEF Inc.", "used": 114, "thing_name": "Bananas", "foo": 41, "bar": 34 },
      { "company_name": "XYZ Inc.", "used": 453, "thing_name": "Togas", "foo": 22, "bar": 11 }
    ]
  }'



