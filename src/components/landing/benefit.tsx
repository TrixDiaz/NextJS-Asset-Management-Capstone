import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Blocks, LineChart, Wallet, Sparkle } from 'lucide-react';

interface BenefitsProps {
  icon: string;
  title: string;
  description: string;
}

const benefitList: BenefitsProps[] = [
  {
    icon: 'Blocks',
    title: 'Build Brand Trust',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. A odio velit cum aliquam. Natus consectetur dolores.'
  },
  {
    icon: 'LineChart',
    title: 'More Leads',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. A odio velit cum aliquam, natus consectetur.'
  },
  {
    icon: 'Wallet',
    title: 'Higher Conversions',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus consectetur. A odio velit cum aliquam'
  },
  {
    icon: 'Sparkle',
    title: 'Test Marketing Ideas',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. A odio velit cum aliquam. Natus consectetur dolores.'
  }
];

// Function to render the appropriate Lucide icon based on the icon name
const renderIcon = (iconName: string) => {
  switch (iconName) {
    case 'Blocks':
      return <Blocks size={32} className='text-primary mb-6' />;
    case 'LineChart':
      return <LineChart size={32} className='text-primary mb-6' />;
    case 'Wallet':
      return <Wallet size={32} className='text-primary mb-6' />;
    case 'Sparkle':
      return <Sparkle size={32} className='text-primary mb-6' />;
    default:
      return <Blocks size={32} className='text-primary mb-6' />;
  }
};

export default function BenefitsSection() {
  return (
    <section
      id='benefits'
      className='container mx-auto gap-8 py-20 md:py-32 lg:max-w-screen-xl'
    >
      <div className='grid place-items-center lg:grid-cols-2 lg:gap-24'>
        <div>
          <h2 className='text-primary mb-2 text-lg tracking-wider'>Benefits</h2>

          <h2 className='mb-4 text-3xl font-bold md:text-4xl'>
            Your Shortcut to Success
          </h2>
          <p className='text-muted-foreground mb-8 text-xl'>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Non
            ducimus reprehenderit architecto rerum similique facere odit
            deleniti necessitatibus quo quae.
          </p>
        </div>

        <div className='grid w-full gap-4 lg:grid-cols-2'>
          {benefitList.map(({ icon, title, description }, index) => (
            <Card
              key={title}
              className='bg-muted/50 dark:bg-card hover:bg-background group/number transition-all delay-75'
            >
              <CardHeader>
                <div className='flex justify-between'>
                  {renderIcon(icon)}
                  <span className='text-muted-foreground/15 group-hover/number:text-muted-foreground/30 text-5xl font-medium transition-all delay-75'>
                    0{index + 1}
                  </span>
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className='text-muted-foreground'>
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
