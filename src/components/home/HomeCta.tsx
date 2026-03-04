import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

type HomeCtaProps = {
  onGetStarted: () => void;
  onBrowseJobs: () => void;
};

export default function HomeCta({ onGetStarted, onBrowseJobs }: HomeCtaProps) {
  return (
    <section className="px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl border border-[#0841a8] bg-[#0a4abf] text-white p-8 sm:p-10">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
            <div>
              <span className="inline-flex px-3 py-1 rounded-full bg-[#abff31] text-[#0a4abf] text-xs font-semibold mb-4">
                For Clients & Freelancers
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                Hire great talent or get hired faster on Lenno
              </h2>
              <p className="text-primary-200 text-base sm:text-lg mt-4 max-w-2xl">
                Clients can post jobs, evaluate proposals, and release milestone
                payments in Pi. Freelancers can discover quality opportunities,
                apply with confidence, and get paid for approved work.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button
                  onClick={onGetStarted}
                  className="rounded-full bg-white text-primary-900 hover:bg-primary-100 px-8 py-4 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Join as Client
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={onBrowseJobs}
                  className="rounded-full border-white/40 text-white hover:bg-white/10"
                >
                  Join as Freelancer
                </Button>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/20 p-5 sm:p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold">
                Why both sides choose Lenno
              </h3>
              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xl font-bold">99.9%</p>
                  <p className="text-xs text-primary-200 mt-1">
                    Service assurance
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xl font-bold">24h</p>
                  <p className="text-xs text-primary-200 mt-1">
                    Proposal response
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xl font-bold">Pi</p>
                  <p className="text-xs text-primary-200 mt-1">
                    Native payouts
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-primary-200">
                <p>• Verified identities for both clients and freelancers</p>
                <p>• Milestone-based approval flow for transparent delivery</p>
                <p>• Real-time updates from proposal to final handoff</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 grid sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl bg-white/10 px-4 py-3">
              1) Clients post jobs, freelancers apply
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3">
              2) Agree milestones and start delivery
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3">
              3) Approve work, release Pi, build reputation
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
