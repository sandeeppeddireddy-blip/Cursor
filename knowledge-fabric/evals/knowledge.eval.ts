import { defineEval, includes } from "@cursor/bdk/evals";

export default defineEval({
  tags: ["smoke", "knowledge"],
  cases: [
    {
      id: "professional-price",
      description: "List price for Northstar Professional comes from the catalog.",
      async test(t) {
        await t.send("What is the list price for Northstar Cloud Professional?");
        t.succeeded();
        t.calledTool("search_knowledge");
        t.check(t.reply, includes(/80/));
        t.check(t.reply, includes(/NST-PRO|product-catalog/i));
      },
    },
    {
      id: "discount-cap",
      description: "Discount policy requires Deal Desk above 15%.",
      async test(t) {
        await t.send("Can I give a customer 25% off list?");
        t.succeeded();
        t.calledTool("search_knowledge");
        t.check(t.reply, includes(/deal desk/i));
      },
    },
    {
      id: "p1-sla",
      description: "P1 response time is taken from the support SLA article.",
      async test(t) {
        await t.send("What is the P1 response target for Premium Support?");
        t.succeeded();
        t.calledTool("search_knowledge");
        t.check(t.reply, includes(/1 hour/i));
      },
    },
  ],
});
