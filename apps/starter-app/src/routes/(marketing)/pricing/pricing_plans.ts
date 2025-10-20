export const defaultPlanId = "trial"

export const pricingPlans = [
  {
    id: "trial",
    name: "Trial",
    description: "A free trial to get started",
    price: "$0",
    priceIntervalName: "per month",
    stripe_price_id: null,
    features: ["10 templates", "100 API calls", "Free for 30 days"],
  },
  {
    id: "startup",
    name: "Startup",
    description: "A plan for startups and small businesses",
    price: "$70",
    priceIntervalName: "per month",
    stripe_price_id: "price_1NkdZCHMjzZ8mGZnRSjUm4yA",
    stripe_product_id: "prod_OXj1CcemGMWOlU",
    features: [
      "100 templates",
      "10 team members",
      "100k API calls per month",
      "2GB of Storage",
    ],
  },
  {
    id: "pro",
    name: "Business",
    description: "A plan for businesses and enterprises",
    price: "$150",
    priceIntervalName: "per month",
    stripe_price_id: "price_1NkdZCHMjzZ8mGZnRSjUm4yA",
    stripe_product_id: "prod_OXj1CcemGMWOlU",
    features: [
      "Unlimited templates",
      "Unlimited team members",
      "Unlimited API calls per month (rate limited)",
      "Unlimited Storage",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "A plan for enterprises and businesses with specialized needs",
    stripe_price_id: "price_1Nkda2HMjzZ8mGZn4sKvbDAV",
    stripe_product_id: "prod_OXj20YNpHYOXi7",
    features: [
      "Everything in Pro",
      "Custom auth (eg SAML)",
      "Custom workflows",
      "Custom pricing",
    ],
  },
]
