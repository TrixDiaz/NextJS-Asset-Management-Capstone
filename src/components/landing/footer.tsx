import { Separator } from '@/components/ui/separator';
import { ChevronsDownIcon } from 'lucide-react';
import Link from 'next/link';

export const FooterSection = () => {
  return (
    <footer
      id='footer'
      className='container mx-auto gap-8 py-20 md:py-32 lg:max-w-screen-xl'
    >
      <div className='bg-card border-secondary rounded-2xl border p-10'>
        <div className='grid grid-cols-2 gap-x-12 gap-y-8 md:grid-cols-4 xl:grid-cols-6'>
          <div className='col-span-full xl:col-span-2'>
            <Link href='#' className='flex items-center font-bold'>
              <ChevronsDownIcon className='from-primary via-primary/70 to-primary border-secondary mr-2 h-9 w-9 rounded-lg border bg-gradient-to-tr' />

              <h3 className='text-2xl'>AssetMaster</h3>
            </Link>
          </div>

          <div className='flex flex-col gap-2'>
            <h3 className='text-lg font-bold'>Resources</h3>
            <div>
              <Link href='#' className='opacity-60 hover:opacity-100'>
                Documentation
              </Link>
            </div>

            <div>
              <Link href='#' className='opacity-60 hover:opacity-100'>
                Knowledge Base
              </Link>
            </div>

            <div>
              <Link href='#' className='opacity-60 hover:opacity-100'>
                Tutorials
              </Link>
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <h3 className='text-lg font-bold'>Product</h3>
            <div>
              <Link href='#' className='opacity-60 hover:opacity-100'>
                Features
              </Link>
            </div>

            <div>
              <Link href='#' className='opacity-60 hover:opacity-100'>
                Pricing
              </Link>
            </div>

            <div>
              <Link href='#' className='opacity-60 hover:opacity-100'>
                Roadmap
              </Link>
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <h3 className='text-lg font-bold'>Support</h3>
            <div>
              <Link href='#' className='opacity-60 hover:opacity-100'>
                Help Center
              </Link>
            </div>

            <div>
              <Link href='#' className='opacity-60 hover:opacity-100'>
                Contact Us
              </Link>
            </div>

            <div>
              <Link href='#' className='opacity-60 hover:opacity-100'>
                Service Status
              </Link>
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <h3 className='text-lg font-bold'>Company</h3>
            <div>
              <Link href='#' className='opacity-60 hover:opacity-100'>
                About Us
              </Link>
            </div>

            <div>
              <Link href='#' className='opacity-60 hover:opacity-100'>
                Careers
              </Link>
            </div>

            <div>
              <Link href='#' className='opacity-60 hover:opacity-100'>
                Legal
              </Link>
            </div>
          </div>
        </div>

        <Separator className='my-6' />
        <section className=''>
          <h3 className=''>
            &copy; 2024 AssetMaster. All rights reserved.
          </h3>
        </section>
      </div>
    </footer>
  );
};
