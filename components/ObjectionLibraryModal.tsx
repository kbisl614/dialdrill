'use client';

import { useState } from 'react';

interface ObjectionLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ObjectionResponse {
  empathy: string;
  question: string;
  positioning: string;
  cta: string;
}

interface Objection {
  id: number;
  objection: string;
  response: ObjectionResponse;
}

const OBJECTIONS: Objection[] = [
  {
    id: 1,
    objection: "It's too expensive.",
    response: {
      empathy: "I completely understand that price is an important factor in your decision.",
      question: "Can I ask what you're comparing this to?",
      positioning: "Many of our customers initially felt the same way, but when they calculated the ROI, they realized the cost of not solving this problem was actually much higher. For example, if this saves your team 5 hours per week, that's 260 hours per year—what's that worth to your business? Our solution typically pays for itself within 3-4 months through increased efficiency and reduced errors.",
      cta: "Would it help if I showed you a quick ROI calculator based on your specific situation?"
    }
  },
  {
    id: 2,
    objection: "I need to think about it.",
    response: {
      empathy: "Absolutely, this is an important decision and I respect that you want to think it through.",
      question: "Is there a specific concern you'd like to discuss, or information I can provide to help with your decision?",
      positioning: "In my experience, when someone needs time to think, it usually means they have a question that hasn't been fully answered yet. I'd rather address those concerns now while we're together than have you wonder about them later. Most successful partnerships happen when we tackle questions head-on.",
      cta: "What's the main thing you need to feel confident about before moving forward?"
    }
  },
  {
    id: 3,
    objection: "We're already working with a competitor.",
    response: {
      empathy: "That's great—it shows you recognize the value in this type of solution.",
      question: "What's working well with your current provider, and what would you improve if you could?",
      positioning: "Many of our best clients came from competitors. They typically switch for one of three reasons: better customer support, more flexible features, or stronger ROI. We don't expect you to switch immediately, but we'd love to show you what makes us different. Even if you stay with your current provider, you'll have a better benchmark for what's possible.",
      cta: "Would you be open to a quick comparison demo so you know your options when your contract comes up for renewal?"
    }
  },
  {
    id: 4,
    objection: "We don't have the budget right now.",
    response: {
      empathy: "Budget constraints are real, and I appreciate you being upfront about that.",
      question: "When does your next budget cycle start, and what would need to happen for this to become a priority?",
      positioning: "Here's what I've learned: budget isn't about having money available—it's about priorities. Companies find budget for things that solve urgent problems or create significant value. The question is whether this problem is costing you more than our solution would. If we can show clear ROI and this solves a critical pain point, budget often becomes available.",
      cta: "Let's explore whether this is a budget issue or a priority issue—can I show you what it's costing you to wait?"
    }
  },
  {
    id: 5,
    objection: "I need to talk to my team first.",
    response: {
      empathy: "I think it's smart to involve your team in decisions that affect them.",
      question: "Who specifically needs to be part of this conversation, and what are their main concerns likely to be?",
      positioning: "Here's what works well: rather than you explaining everything secondhand, what if we set up a brief call with your key stakeholders? That way, they can ask questions directly, and we can address their specific concerns. This usually speeds up the decision process and ensures everyone feels heard.",
      cta: "Would next Tuesday or Wednesday work for a 20-minute call with your team?"
    }
  },
  {
    id: 6,
    objection: "We've tried something like this before and it didn't work.",
    response: {
      empathy: "I'm sorry to hear you had a bad experience—that's frustrating and I can see why you'd be hesitant.",
      question: "What specifically went wrong, and what would need to be different this time?",
      positioning: "Failed implementations usually come down to one of three things: poor onboarding, wrong product fit, or lack of ongoing support. We've specifically designed our process to avoid these pitfalls. We include hands-on training, a dedicated success manager for the first 90 days, and we don't consider the sale complete until you're seeing results. Our 94% customer retention rate suggests we've learned from the industry's mistakes.",
      cta: "Can I show you how we'd approach implementation differently to ensure success this time?"
    }
  },
  {
    id: 7,
    objection: "I'm not the decision maker.",
    response: {
      empathy: "I appreciate you letting me know—it helps me understand the process better.",
      question: "Who is the final decision maker, and what information would they need to move forward?",
      positioning: "Here's how we can work together: I'd love to equip you with everything you need to present this to your decision maker confidently. I can put together a custom proposal highlighting the specific benefits for your situation, ROI projections, and answers to common questions. You become the internal champion, and if needed, I'm happy to join a call to answer any technical questions.",
      cta: "Would it help if I created a one-page summary you could share with them, or would they prefer to meet directly?"
    }
  },
  {
    id: 8,
    objection: "We're too busy right now to implement anything new.",
    response: {
      empathy: "I hear you—adding something new when you're already stretched thin sounds overwhelming.",
      question: "Is being busy a temporary situation, or is it a chronic problem that might benefit from better tools?",
      positioning: "Here's the paradox: being too busy is often a symptom of inefficient processes—exactly what our solution addresses. Yes, there's an initial time investment, but our average customer saves 8 hours per week within the first month. We also offer white-glove implementation where we do the heavy lifting. Most clients tell us they wish they hadn't waited because the time savings compound over time.",
      cta: "What if we could get you up and running in under 2 hours of your time—would that change your perspective?"
    }
  },
  {
    id: 9,
    objection: "Can you send me some information?",
    response: {
      empathy: "Of course, I'm happy to send over materials that would be helpful.",
      question: "What specific information would be most valuable for you—case studies, pricing, technical specs, or something else?",
      positioning: "I want to make sure I send you exactly what you need, not just generic marketing materials. In my experience, sending information works best when we've already discussed your specific situation, so the materials I send are tailored to your needs. That way, you get relevant information instead of having to dig through pages of content that might not apply.",
      cta: "How about we spend just 10 minutes now so I understand your needs, then I'll send over a customized package that's actually useful?"
    }
  },
  {
    id: 10,
    objection: "I've never heard of your company.",
    response: {
      empathy: "That's fair—we may not have the brand recognition of some larger companies yet.",
      question: "What would you need to see to feel confident working with us?",
      positioning: "We're a growing company, which actually works in your favor. You get personalized attention, direct access to our leadership team, and we're highly motivated to ensure your success. We're not so big that you're just a number, but we're established enough to be stable—we've been in business for 5 years, serve over 200 clients, and have a 4.8/5 rating. I can connect you with similar companies who took a chance on us and can speak to their experience.",
      cta: "Would it help to speak with 2-3 current customers in your industry before you decide?"
    }
  }
];

export default function ObjectionLibraryModal({ isOpen, onClose }: ObjectionLibraryModalProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const toggleObjection = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const expandAll = () => {
    setExpandedIds(new Set(OBJECTIONS.map(obj => obj.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl h-[90vh] rounded-2xl border border-white/10 bg-[#030712] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-white/10 bg-gradient-to-r from-[#2dd4e6]/10 to-[#9333ea]/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Objection Library</h2>
              <p className="mt-1 text-sm text-[#9ca3af]">
                10 common objections with structured responses
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={expandAll}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-scroll p-6"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#00d9ff #1e293b'
          }}
        >
          <div className="space-y-4">
            {OBJECTIONS.map((objection) => {
              const isExpanded = expandedIds.has(objection.id);

              return (
                <div
                  key={objection.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] transition hover:bg-white/[0.06] hover:border-[#00d9ff]/30"
                >
                  <button
                    onClick={() => toggleObjection(objection.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3"
                    aria-expanded={isExpanded}
                  >
                    <h3 className="text-base font-semibold text-white flex-1">
                      {objection.objection}
                    </h3>
                    <svg
                      className={`h-5 w-5 shrink-0 text-[#00d9ff] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-white/10 bg-white/[0.02] p-4 space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-[#00d9ff] uppercase tracking-wide mb-2">
                          1. Empathy & Validation
                        </p>
                        <p className="text-sm text-white/80 leading-relaxed">
                          {objection.response.empathy}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-[#00d9ff] uppercase tracking-wide mb-2">
                          2. Clarifying Question
                        </p>
                        <p className="text-sm text-white/80 leading-relaxed">
                          {objection.response.question}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-[#00d9ff] uppercase tracking-wide mb-2">
                          3. Response & Positioning
                        </p>
                        <p className="text-sm text-white/80 leading-relaxed">
                          {objection.response.positioning}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-[#00d9ff] uppercase tracking-wide mb-2">
                          4. Call to Action
                        </p>
                        <p className="text-sm text-white/80 leading-relaxed">
                          {objection.response.cta}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-white/10 bg-white/[0.02] p-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-[#00d9ff] to-[#00ffea] px-6 py-3 text-sm font-semibold text-[#020817] transition hover:opacity-90"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
