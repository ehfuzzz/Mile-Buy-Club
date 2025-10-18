import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { ArrowRight, Zap, TrendingUp, Bell } from 'lucide-react';

export default function Home() {
  return (
    <div>
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Find Award Flight Deals
              <span className="block bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                Automatically
              </span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
              Stop manually checking miles programs. Let us monitor your favorite airlines and alert you instantly when award seat deals appear at the best redemption rates.
            </p>
            
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-900 px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-3xl font-bold text-white sm:text-4xl">
            How Mile Buy Club Works
          </h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-8">
              <div className="mb-4 inline-flex rounded-lg bg-amber-500 p-3">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Automatic Monitoring</h3>
              <p className="mt-3 text-slate-400">
                We continuously monitor award seat availability across all major airlines and programs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-8">
              <div className="mb-4 inline-flex rounded-lg bg-amber-500 p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Smart Deal Ranking</h3>
              <p className="mt-3 text-slate-400">
                Our algorithm ranks deals by value, showing you the best redemptions first.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-8">
              <div className="mb-4 inline-flex rounded-lg bg-amber-500 p-3">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Instant Alerts</h3>
              <p className="mt-3 text-slate-400">
                Get notified immediately when we find deals matching your exact preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to find better deals?
          </h2>
          <p className="mt-4 text-lg text-amber-50">
            Join thousands of frequent flyers finding award seats at the best rates.
          </p>
          <Button size="lg" className="mt-8 bg-white text-amber-600 hover:bg-amber-50">
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
}
