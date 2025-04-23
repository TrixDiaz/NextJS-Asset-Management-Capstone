import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/landing/navbar';
import { HeroSection } from '@/components/landing/hero';
import BenefitsSection from '@/components/landing/benefit';
import FAQSection from '@/components/landing/faq';
import { FooterSection } from '@/components/landing/footer';
export default async function Page() {
  const { userId } = await auth();

  // If user is already logged in, redirect to dashboard
  if (userId) {
    redirect('/dashboard/overview');
  }

  // Otherwise show the QCU landing page
  return (
    <div className='h-screen overflow-y-auto'>
      <Navbar />
      <main>
        <HeroSection />
        <BenefitsSection />
        <FAQSection />
        <FooterSection />
      </main>
    </div>
  );
}
