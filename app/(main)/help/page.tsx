import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I add a new todo?",
      answer: "Click the 'Add Todo' button at the top of the todo list, enter your task in the input field, and press 'Add' or hit Enter."
    },
    {
      question: "How do I mark a todo as completed?",
      answer: "Click the checkbox icon to the left of each todo item to toggle its completed status."
    },
    {
      question: "Can I delete a todo?",
      answer: "Yes, click the trash can icon on the right side of any todo item to delete it permanently."
    },
    {
      question: "Is there a way to see my progress?",
      answer: "Yes, the 'Your Progress' section shows statistics about your todos including completion rate."
    },
    {
      question: "How do I enable dark mode?",
      answer: "Click the theme toggle button in the top right corner of the header to switch between light and dark modes."
    }
  ];

  return (
    <div className="space-y-6 pt-10">
      <h1 className="text-3xl font-bold">Help Center</h1>
      <p className="text-lg">
        Find answers to common questions about using our Todo App.
      </p>
      
      <h2 className="text-2xl font-bold mt-8">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      <h2 className="text-2xl font-bold mt-8">Contact Support</h2>
      <p>
        If you can not find the answer to your question here, please email us at{" "}
        <a href="mailto:support@todoapp.com" className="text-primary underline">
          support@todoapp.com
        </a>
        .
      </p>
    </div>
  );
}