"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How quickly can I start getting results?",
    answer:
      "Most businesses see their first campaign live within 30 minutes of signing up. You can start getting customers from your very first post.",
  },
  {
    question: "Do I need any technical skills or training?",
    answer:
      "Absolutely not! If you can send a WhatsApp message, you can use OneClick Promo. No apps to download, no complicated dashboards to learn.",
  },
  {
    question: "What types of businesses work best with OneClick Promo?",
    answer:
      "We work great with local service businesses like barbers, restaurants, boutiques, fitness studios, beauty salons, and any business that wants to attract local customers.",
  },
  {
    question: "How do you track my campaign performance?",
    answer:
      "We provide unique tracking links for every campaign and send you simple daily reports via WhatsApp showing clicks, coupon redemptions, and customer engagement.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes! There are no contracts or cancellation fees. You can pause or cancel your subscription anytime, and we'll even help you export your campaign data.",
  },
  {
    question: "What if I'm not satisfied with the results?",
    answer:
      "We offer a 30-day money-back guarantee. If you don't see increased customer engagement within your first month, we'll refund your entire payment.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg">Everything you need to know about OneClick Promo</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
