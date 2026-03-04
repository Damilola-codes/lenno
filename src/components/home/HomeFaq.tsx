"use client";

export default function HomeFaq() {
  return (
    <section className="px-4 py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl border border-primary-200 bg-primary-50 p-7 sm:p-10">
          <div className="text-center mb-8">
            <span className="inline-flex px-3 py-1 rounded-full bg-[#0a4abf] text-white text-xs font-semibold mb-3">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-primary-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-primary-600 max-w-2xl mx-auto">
              Quick answers about hiring, payments, and how Lenno works as an
              AI-powered job platform.
            </p>
          </div>

          <div className="space-y-3">
            <details
              className="group rounded-2xl border border-primary-200 bg-white p-5"
              open
            >
              <summary className="cursor-pointer list-none font-semibold text-primary-900 flex items-center justify-between gap-3">
                <span>How does Lenno help clients hire faster?</span>
                <span className="text-xl leading-none text-primary-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-primary-600">
                Lenno highlights top-fit proposals, summarizes candidate
                strengths, and helps teams structure milestones so hiring and
                project kickoff happen faster.
              </p>
            </details>

            <details className="group rounded-2xl border border-primary-200 bg-white p-5">
              <summary className="cursor-pointer list-none font-semibold text-primary-900 flex items-center justify-between gap-3">
                <span>How are freelancers paid on Lenno?</span>
                <span className="text-xl leading-none text-primary-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-primary-600">
                Payments are handled through milestone approvals and settled in
                Pi, so both sides can track what was delivered and what was
                released.
              </p>
            </details>

            <details className="group rounded-2xl border border-primary-200 bg-white p-5">
              <summary className="cursor-pointer list-none font-semibold text-primary-900 flex items-center justify-between gap-3">
                <span>Is there any service quality assurance?</span>
                <span className="text-xl leading-none text-primary-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-primary-600">
                Yes. Lenno combines verified profiles, milestone checkpoints,
                and transparent review history to maintain high delivery
                standards.
              </p>
            </details>

            <details className="group rounded-2xl border border-primary-200 bg-white p-5">
              <summary className="cursor-pointer list-none font-semibold text-primary-900 flex items-center justify-between gap-3">
                <span>Can teams manage multiple projects at once?</span>
                <span className="text-xl leading-none text-primary-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-primary-600">
                Yes. Lenno supports parallel job flows with clear status
                tracking so teams can monitor scope, deadlines, and payouts in
                one workspace.
              </p>
            </details>

            <details className="group rounded-2xl border border-primary-200 bg-white p-5">
              <summary className="cursor-pointer list-none font-semibold text-primary-900 flex items-center justify-between gap-3">
                <span>What should clients prepare before posting a job?</span>
                <span className="text-xl leading-none text-primary-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-primary-600">
                Clients get better results when they share clear scope, desired
                outcomes, timeline expectations, and budget range. A structured
                brief helps Lenno match stronger proposals faster.
              </p>
            </details>

            <details className="group rounded-2xl border border-primary-200 bg-white p-5">
              <summary className="cursor-pointer list-none font-semibold text-primary-900 flex items-center justify-between gap-3">
                <span>What is expected from freelancers after applying?</span>
                <span className="text-xl leading-none text-primary-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-primary-600">
                Freelancers are expected to keep communication active, confirm
                milestone deliverables, and submit work updates on time. This
                keeps approvals and payouts predictable for both sides.
              </p>
            </details>

            <details className="group rounded-2xl border border-primary-200 bg-white p-5">
              <summary className="cursor-pointer list-none font-semibold text-primary-900 flex items-center justify-between gap-3">
                <span>
                  How does Lenno handle disputes or unmet deliverables?
                </span>
                <span className="text-xl leading-none text-primary-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-primary-600">
                If milestones are disputed, payment release is paused while job
                history, submitted files, and delivery notes are reviewed. This
                process helps protect both clients and freelancers.
              </p>
            </details>

            <details className="group rounded-2xl border border-primary-200 bg-white p-5">
              <summary className="cursor-pointer list-none font-semibold text-primary-900 flex items-center justify-between gap-3">
                <span>How can users build trust quickly on the platform?</span>
                <span className="text-xl leading-none text-primary-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-primary-600">
                Clients build trust with clear briefs and timely feedback.
                Freelancers build trust through complete profiles, realistic
                timelines, and consistent milestone delivery quality.
              </p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
