'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';

export const HeroSection = () => {
  const { theme } = useTheme();
  return (
    <section className='container w-full'>
      <div className='mx-auto grid place-items-center gap-8 py-20 md:py-32 lg:max-w-screen-xl'>
        <div className='space-y-8 text-center'>
          <Badge variant='outline' className='py-2 text-sm'>
            <span className='text-primary mr-2'>
              <Badge>New</Badge>
            </span>
            <span> Asset Management Platform released! </span>
          </Badge>

          <div className='mx-auto max-w-screen-md text-center text-4xl font-bold md:text-6xl'>
            <h1>
              Streamline Your
              <span className='to-primary bg-gradient-to-r from-[#D247BF] bg-clip-text px-2 text-transparent'>
                Asset
              </span>
              Management
            </h1>
          </div>

          <p className='text-muted-foreground mx-auto max-w-screen-sm text-xl'>
            {`Our comprehensive asset management solution helps you track, maintain, and optimize your organization's resources with powerful analytics and intuitive workflows.`}
          </p>

          <div className='space-y-4 md:space-y-0 md:space-x-4'>
            <Button className='group/arrow w-5/6 font-bold md:w-1/4' asChild>
              <Link href='/auth/sign-in'>
                Get Started
                <ArrowRight className='ml-2 size-5 transition-transform group-hover/arrow:translate-x-1' />
              </Link>
            </Button>

            <Button
              asChild
              variant='secondary'
              className='w-5/6 font-bold md:w-1/4'
            >
              <Link
                href='#benefits'
              >
                Learn More
              </Link>
            </Button>
          </div>
        </div>

        <div className='group relative mt-14'>
          <div className='bg-primary/50 absolute top-2 left-1/2 mx-auto h-24 w-[90%] -translate-x-1/2 transform rounded-full blur-3xl lg:-top-8 lg:h-80'></div>
          <Image
            width={1200}
            height={1200}
            className='rouded-lg border-secondary border-t-primary/30 relative mx-auto flex w-full items-center rounded-lg border border-t-2 leading-none md:w-[1200px]'
            src={
              theme === 'light'
                ? '/qcu.jpg'
                : '/qcu.jpg'
            }
            alt='asset management dashboard'
          />

          <div className='from-background/0 via-background/50 to-background absolute bottom-0 left-0 h-20 w-full rounded-lg bg-gradient-to-b md:h-28'></div>
        </div>
      </div>
    </section>
  );
};
