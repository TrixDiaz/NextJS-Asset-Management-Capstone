import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: 'What is AssetMaster?',
    answer: 'AssetMaster is a comprehensive asset management platform designed to help organizations track, maintain, and optimize their physical and digital resources throughout their lifecycle.',
    value: 'item-1'
  },
  {
    question: 'How does AssetMaster help reduce operational costs?',
    answer:
      'AssetMaster helps reduce costs by providing visibility into asset utilization, preventing unnecessary purchases, optimizing maintenance schedules, and extending asset lifecycles through predictive analytics and proactive management.',
    value: 'item-2'
  },
  {
    question:
      'Can AssetMaster integrate with our existing enterprise systems?',
    answer:
      'Yes, AssetMaster offers robust API integrations with popular ERP, CMMS, and accounting systems to ensure seamless data flow across your organization.',
    value: 'item-3'
  },
  {
    question: 'Is AssetMaster suitable for small businesses?',
    answer: 'Absolutely! AssetMaster offers scalable pricing plans suitable for organizations of all sizes, from small businesses to large enterprises.',
    value: 'item-4'
  },
  {
    question:
      'Does AssetMaster offer mobile access for field workers?',
    answer: 'Yes, AssetMaster includes native mobile applications for iOS and Android, allowing field workers to access and update asset information on the go.',
    value: 'item-5'
  }
];

export default function FAQSection() {
  return (
    <section
      id='faq'
      className='container mx-auto gap-8 py-20 md:py-32 lg:max-w-screen-xl'
    >
      <div className='mb-8 text-center'>
        <h2 className='text-primary mb-2 text-center text-lg tracking-wider'>
          FAQS
        </h2>

        <h2 className='text-center text-3xl font-bold md:text-4xl'>
          Frequently Asked Questions
        </h2>
      </div>

      <Accordion type='single' collapsible className='AccordionRoot'>
        {FAQList.map(({ question, answer, value }) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className='text-left'>
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
