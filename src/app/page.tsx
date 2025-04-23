import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Page() {
  const { userId } = await auth();

  // If user is already logged in, redirect to dashboard
  if (userId) {
    redirect('/dashboard/overview');
  }

  // Otherwise show the QCU landing page
  return (
    <div className='flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white'>
      {/* Hero section */}
      <main className='flex flex-grow flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8'>
        <h1 className='mb-6 text-5xl font-bold text-blue-900'>
          Welcome to QCU
        </h1>
        <p className='mb-10 max-w-2xl text-xl text-gray-600'>
          Your comprehensive management solution for Quezon City University.
          Access administration tools, campus resources, and student services
          all in one place.
        </p>

        <div className='mt-6 flex flex-col gap-4 sm:flex-row'>
          <Link
            href='/auth/sign-in'
            className='rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700'
          >
            Sign In
          </Link>
          <Link
            href='/auth/sign-up'
            className='rounded-lg border border-blue-600 bg-white px-8 py-3 font-medium text-blue-600 transition-colors hover:bg-blue-50'
          >
            Register
          </Link>
        </div>
      </main>

      {/* Feature section */}
      <section className='bg-white py-16'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <h2 className='mb-12 text-center text-3xl font-bold text-gray-900'>
            Our Features
          </h2>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            <div className='rounded-lg border border-gray-200 p-6'>
              <h3 className='mb-3 text-xl font-semibold text-blue-800'>
                Student Portal
              </h3>
              <p className='text-gray-600'>
                Access grades, course materials, and class schedules from
                anywhere.
              </p>
            </div>

            <div className='rounded-lg border border-gray-200 p-6'>
              <h3 className='mb-3 text-xl font-semibold text-blue-800'>
                Administrative Tools
              </h3>
              <p className='text-gray-600'>
                Powerful tools for faculty and staff to manage university
                operations efficiently.
              </p>
            </div>

            <div className='rounded-lg border border-gray-200 p-6'>
              <h3 className='mb-3 text-xl font-semibold text-blue-800'>
                Resource Center
              </h3>
              <p className='text-gray-600'>
                Centralized repository for academic resources, forms, and
                university information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-blue-900 py-8 text-white'>
        <div className='mx-auto flex max-w-7xl flex-col items-center justify-between px-4 sm:px-6 md:flex-row lg:px-8'>
          <div className='mb-4 md:mb-0'>
            <p className='text-sm'>
              © 2024 Quezon City University. All rights reserved.
            </p>
          </div>

          <div className='flex space-x-6'>
            <Link href='#' className='text-sm text-gray-300 hover:text-white'>
              Privacy Policy
            </Link>
            <Link href='#' className='text-sm text-gray-300 hover:text-white'>
              Terms of Service
            </Link>
            <Link href='#' className='text-sm text-gray-300 hover:text-white'>
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
