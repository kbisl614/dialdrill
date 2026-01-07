// Sales Objections Dataset
const objections = [
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
  },
  {
    id: 11,
    objection: "We're planning to build this in-house.",
    response: {
      empathy: "Building in-house gives you complete control, and I can see the appeal of that approach.",
      question: "What's your timeline for development, and have you calculated the total cost including development time, maintenance, and opportunity cost?",
      positioning: "Most companies underestimate the true cost of building in-house by 3-5x. You're not just paying for initial development—you're paying for ongoing maintenance, updates, security patches, and the opportunity cost of your developers not working on your core product. It typically takes 12-18 months to build what we've spent 5 years perfecting. Even if you do build it, we could serve as a solution while yours is in development.",
      cta: "Can I show you a build vs. buy analysis that helped other CTOs make this decision?"
    }
  },
  {
    id: 12,
    objection: "The contract is too long.",
    response: {
      empathy: "I understand wanting flexibility, especially if you're trying something new.",
      question: "What length of commitment would feel more comfortable for you?",
      positioning: "The reason we typically recommend a 12-month agreement is that it takes 2-3 months to see the full value, and we want to ensure you stay long enough to get ROI. That said, we do offer a 6-month option for new clients, though at a slightly higher monthly rate. We're also confident enough in our value that we include a 60-day money-back guarantee—if you're not seeing value after 60 days, we'll refund everything.",
      cta: "Would a 6-month contract with the option to extend make you more comfortable getting started?"
    }
  },
  {
    id: 13,
    objection: "I need to see a demo first.",
    response: {
      empathy: "Absolutely, seeing the product in action is the best way to understand if it's right for you.",
      question: "What are the 2-3 most important things you'd want to see in a demo?",
      positioning: "I'd love to give you a personalized demo focused on your specific use case rather than a generic walkthrough. To make the best use of your time, it helps if I understand your workflow and pain points first. That way, I can show you exactly how we'd solve your challenges, not just features you may not need.",
      cta: "Can we spend 5 minutes now discussing your process, then I'll schedule a 30-minute custom demo for later this week?"
    }
  },
  {
    id: 14,
    objection: "We're not ready yet.",
    response: {
      empathy: "Timing is important, and I don't want to push you into something before you're ready.",
      question: "What would need to change for you to be ready, and when do you think that might happen?",
      positioning: "Here's what I've learned: 'not ready' usually means one of three things—wrong timing, missing information, or uncertainty about ROI. If it's truly a timing issue, I respect that. But if it's about information or confidence, those are things we can address today. Every month you wait is a month of continued pain and lost opportunity.",
      cta: "Help me understand what 'ready' looks like so I can either help you get there or follow up at the right time."
    }
  },
  {
    id: 15,
    objection: "I don't see how this is different from the free options.",
    response: {
      empathy: "It's smart to consider free alternatives—why pay for something if you don't have to?",
      question: "What free tools have you tried, and what limitations did you run into?",
      positioning: "Free tools are great for getting started, but they typically have hidden costs: limited features, poor support, security risks, and your time spent working around limitations. Our clients usually switch from free tools when they realize the 'free' option is costing them 10+ hours per month in workarounds and inefficiency. We offer enterprise-grade security, dedicated support, advanced features, and integrations that free tools can't match.",
      cta: "What if I showed you exactly what you're giving up with free tools versus what you'd gain with us?"
    }
  },
  {
    id: 16,
    objection: "Your competitor offers this for less.",
    response: {
      empathy: "Price is definitely important, and I appreciate you doing your research.",
      question: "Beyond price, how do we compare on features, support, and reliability?",
      positioning: "You're right that our competitor has a lower price point. Here's why: they offer basic features with limited support, while we provide a comprehensive solution with 24/7 support, advanced features, and ongoing training. It's like comparing a budget airline to a full-service carrier—both get you there, but the experience is very different. Our clients who switched from that competitor typically cite better support and fewer headaches as the reason.",
      cta: "Would it be valuable to see a side-by-side comparison of what you actually get for the price difference?"
    }
  },
  {
    id: 17,
    objection: "We need more features than what you're offering.",
    response: {
      empathy: "I appreciate you being clear about your requirements—that helps me serve you better.",
      question: "Which specific features are must-haves versus nice-to-haves?",
      positioning: "We intentionally focus on core features that 95% of customers use daily, rather than bloating our product with features that rarely get used. That said, we have a robust API and integration marketplace that might address your needs. Also, we release new features quarterly based on customer feedback—if enough customers need something, we build it.",
      cta: "Can you share your feature requirements so I can check our roadmap and see if we're planning to add them, or if our integrations can fill the gap?"
    }
  },
  {
    id: 18,
    objection: "I've heard negative reviews about your product.",
    response: {
      empathy: "I'm sorry to hear that, and I take customer feedback seriously—even the negative stuff.",
      question: "Can you share what specific concerns you heard so I can address them directly?",
      positioning: "Every company has unhappy customers, and we're no exception. What matters is how we respond. We've made significant improvements based on customer feedback—for example, the complaints about onboarding led us to create our new white-glove implementation program. Our overall satisfaction rating is 4.8/5, and 94% of customers renew. I'd rather address specific concerns than pretend we're perfect.",
      cta: "Would it help to speak with some recent customers who can share their honest experience, including how we handled any issues?"
    }
  },
  {
    id: 19,
    objection: "We need to finish our current project first.",
    response: {
      empathy: "I respect that you want to focus on completing what you've started.",
      question: "When do you expect to wrap up the current project, and could this solution actually help you finish it faster?",
      positioning: "Sometimes the best time to implement a new solution is during a project, not after—especially if it can accelerate completion or improve results. That said, if the timing truly doesn't work, I'd rather wait and do it right than rush you. We can also plan ahead now and schedule implementation for when you're ready, which ensures you don't lose momentum.",
      cta: "Can we at least explore whether this could help your current project, or pencil in a start date for when you're finished?"
    }
  },
  {
    id: 20,
    objection: "I don't have time for a call right now.",
    response: {
      empathy: "I completely understand—I know you're busy and I respect your time.",
      question: "Would a different time this week work better, or would you prefer to start with something shorter?",
      positioning: "I'm not looking to take up your whole day. Most initial conversations are 15-20 minutes and help both of us figure out if there's a fit. If there is, great. If not, we've saved each other time. I'd rather have a brief conversation now than send you generic information that might not address your specific needs.",
      cta: "What if we scheduled just 15 minutes later this week—does Tuesday at 2pm or Thursday at 10am work better?"
    }
  },
  {
    id: 21,
    objection: "We're happy with how things are now.",
    response: {
      empathy: "That's great to hear—maintaining satisfaction is challenging, so kudos to your team.",
      question: "If you could wave a magic wand and improve one thing about your current process, what would it be?",
      positioning: "Even when things are working well, there's usually room for improvement. The best companies don't wait until something breaks—they continuously optimize. Our most successful clients weren't in crisis when they came to us; they were good and wanted to become great. Small improvements compound over time into significant competitive advantages.",
      cta: "Would you be open to a brief conversation about what 'even better' might look like, with no pressure to change?"
    }
  },
  {
    id: 22,
    objection: "Your product seems too complicated.",
    response: {
      empathy: "That's a fair concern—the last thing you need is something that creates more work instead of less.",
      question: "What specifically seems complicated, and how tech-savvy is your team?",
      positioning: "We've invested heavily in making our product intuitive because we know adoption is critical. Most users are up and running in under 30 minutes, and we offer hands-on training for your team. Yes, we have advanced features for power users, but you don't need to use them to get value. We also have 24/7 support if you ever get stuck.",
      cta: "How about I show you how simple the core workflow is in a 10-minute demo—if it still seems too complicated, we can discuss alternatives?"
    }
  },
  {
    id: 23,
    objection: "We only work with vendors who have local support.",
    response: {
      empathy: "Local support can be really important, especially if you value face-to-face relationships.",
      question: "Is local support about having someone physically nearby, or is it about response time and quality of service?",
      positioning: "While we don't have a local office in every city, we provide support that's often better than local vendors: 24/7 availability, response times under 2 hours, video calls, and dedicated account managers. Many clients tell us our remote support is faster and more effective than their previous local vendor. We can also travel to you for implementation and quarterly business reviews if needed.",
      cta: "Would you be willing to test our support during a trial period to see if it meets your needs, even without a local office?"
    }
  },
  {
    id: 24,
    objection: "I need approval from legal first.",
    response: {
      empathy: "Legal review is standard procedure for many companies, and I completely respect that process.",
      question: "What are the typical concerns your legal team raises, and what's the usual timeline for review?",
      positioning: "We work with legal teams regularly and have streamlined this process. We can provide our standard contract, MSA, DPA, and security documentation upfront to speed things along. We're also flexible on contract terms within reason. Most legal reviews take 1-2 weeks, and we're happy to jump on a call with your legal team to answer questions directly.",
      cta: "Can I send over our legal package now so they can start reviewing while we finalize the business terms?"
    }
  },
  {
    id: 25,
    objection: "We're going through a reorganization right now.",
    response: {
      empathy: "Reorganizations are challenging, and I can see why adding something new might feel like bad timing.",
      question: "Is the reorganization affecting the area where our solution would be used, or is it in a different department?",
      positioning: "Here's an interesting perspective: reorganizations often create the perfect opportunity to implement new systems because processes are already in flux. Rather than reorganizing around old tools, you could reorganize around better ones. That said, if the timing truly doesn't work, I respect that. We can revisit once things settle.",
      cta: "Would it make sense to at least explore this now so it's ready to implement once the dust settles from the reorganization?"
    }
  },
  {
    id: 26,
    objection: "I need a discount to move forward.",
    response: {
      empathy: "I understand wanting to get the best value, and I appreciate you being direct about it.",
      question: "If price is the only thing standing between us, what discount would make this an easy yes?",
      positioning: "Our pricing is based on the value we deliver, and we're typically within 5-10% of competitors for similar capabilities. That said, I do have some flexibility depending on contract length, payment terms, and number of users. I'd rather find creative ways to make this work than simply discount the price—like extended payment terms, waiving setup fees, or including additional training.",
      cta: "If you commit to a 12-month contract and pay upfront, I can offer 15% off—would that work within your budget?"
    }
  },
  {
    id: 27,
    objection: "We need this to integrate with our existing systems.",
    response: {
      empathy: "Integration is critical—you don't want data silos or double entry.",
      question: "Which systems do you need us to integrate with, and what data needs to flow between them?",
      positioning: "We have native integrations with 50+ popular platforms, plus a robust API and Zapier connection for anything else. Most integrations take less than a day to set up, and we provide support during implementation. If you have a unique system, our team can build custom integrations—we've done it many times.",
      cta: "Can you share your tech stack so I can confirm we integrate with everything you need, or identify any gaps we need to address?"
    }
  },
  {
    id: 28,
    objection: "Your company is too small—what if you go out of business?",
    response: {
      empathy: "Business continuity is a legitimate concern, especially if you're relying on us for critical operations.",
      question: "What would make you feel confident about our stability and longevity?",
      positioning: "We've been in business for 5 years, are profitable, and growing 40% year-over-year. We have 200+ customers, many of whom are enterprise clients who did thorough due diligence. We also have data portability guarantees and source code escrow agreements available for enterprise customers. Being smaller means we're more agile and customer-focused, not that we're unstable.",
      cta: "Would it help if I shared our company financials, customer retention metrics, and growth trajectory to demonstrate our stability?"
    }
  },
  {
    id: 29,
    objection: "I don't trust software companies with our data.",
    response: {
      empathy: "Data security and privacy are absolutely critical, and I'm glad you're asking about this.",
      question: "What specific security requirements or compliance standards do you need us to meet?",
      positioning: "We take security seriously: SOC 2 Type II certified, GDPR compliant, encrypted data at rest and in transit, annual penetration testing, and regular security audits. We never sell your data, and you own all your data with the ability to export it anytime. We can also sign BAAs for HIPAA compliance if needed. Many of our customers are in highly regulated industries like healthcare and finance.",
      cta: "Can I send you our complete security documentation and schedule a call with our security team to address your concerns?"
    }
  },
  {
    id: 30,
    objection: "We need a customized solution, not off-the-shelf.",
    response: {
      empathy: "Every business is unique, and I appreciate that you want something tailored to your needs.",
      question: "What specific customizations are must-haves versus nice-to-haves?",
      positioning: "Our platform is highly configurable out of the box—most clients can customize it to their needs without custom development. For true custom requirements, we offer professional services for branding, workflows, and integrations. The advantage of starting with our platform is that you get 90% of what you need immediately, then customize the last 10%, rather than building from scratch.",
      cta: "Can you share your requirements so we can map out which are standard configurations versus true customizations, and quote accordingly?"
    }
  },
  {
    id: 31,
    objection: "I've been burned by vendors before.",
    response: {
      empathy: "I'm really sorry you had a bad experience—vendor relationships should be partnerships, not headaches.",
      question: "What specifically went wrong, and what would a vendor need to do differently to earn your trust?",
      positioning: "Bad vendor experiences usually come from overpromising and underdelivering, poor communication, or abandoning customers after the sale. We combat this with realistic expectations upfront, dedicated account managers, regular check-ins, and a customer success team focused on your results, not just renewals. Our 94% retention rate and 4.8/5 satisfaction score suggest we're doing something right.",
      cta: "Would it help if I connected you with customers who had similar concerns and can speak to how we handled the relationship?"
    }
  },
  {
    id: 32,
    objection: "This isn't a priority right now.",
    response: {
      empathy: "I respect that you have limited time and resources, and you need to focus on what matters most.",
      question: "What would need to happen for this to become a priority?",
      positioning: "Priorities are often driven by urgency, not importance. The question is: what's this costing you while it's not a priority? If the problem is big enough, waiting just makes it more expensive to fix. That said, I'd rather you implement this when you can give it proper attention than rush it and fail. Let's figure out if this should be a higher priority, or if we should revisit later.",
      cta: "Can we spend 10 minutes quantifying the cost of waiting so you can make an informed decision about priority?"
    }
  },
  {
    id: 33,
    objection: "We don't have anyone to manage this internally.",
    response: {
      empathy: "Resource constraints are real, and I don't want to give you something that becomes shelf-ware.",
      question: "How much ongoing management are you expecting this to require?",
      positioning: "Our solution is designed to be low-maintenance—most customers spend less than 2 hours per month on administration. We also offer managed services where we handle updates, optimization, and reporting for you. You don't need a dedicated person; it's typically managed by someone spending 5-10% of their time. We provide training and ongoing support to make sure you're never stuck.",
      cta: "Would it help if I walked you through exactly what ongoing management looks like, and our managed service options?"
    }
  },
  {
    id: 34,
    objection: "The timing isn't right with our fiscal year ending.",
    response: {
      empathy: "Fiscal year-end is always hectic, and I appreciate you being mindful of timing.",
      question: "Would it make more sense to start in the new fiscal year, or is this more about current bandwidth?",
      positioning: "Many clients actually prefer to implement before fiscal year-end to claim the expense in the current year and start the new year with better processes. However, if it's truly about bandwidth, we can plan ahead now and schedule implementation for early next fiscal year. That ensures you don't lose momentum and can hit the ground running.",
      cta: "Would you like to finalize the agreement now but schedule implementation for Q1 of your next fiscal year?"
    }
  },
  {
    id: 35,
    objection: "I need to see case studies from companies like ours.",
    response: {
      empathy: "Social proof is valuable, and I understand wanting to see evidence that this works for companies in your situation.",
      question: "What industry or company size would be most relevant for you to see?",
      positioning: "We have detailed case studies from companies across various industries and sizes. I can share 2-3 that match your profile, including specific metrics like ROI, time savings, and challenges they overcame. I can also introduce you to similar customers for reference calls if you'd like to hear directly from them.",
      cta: "Let me pull together the most relevant case studies for your industry and size—can you tell me a bit more about your company so I send the right ones?"
    }
  }
];

// State management
let expandedIds = new Set();

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  renderObjections();
  setupEventListeners();
});

function renderObjections() {
  const container = document.getElementById('objections-container');
  container.innerHTML = '';

  objections.forEach(item => {
    const objectionCard = createObjectionCard(item);
    container.appendChild(objectionCard);
  });
}

function createObjectionCard(item) {
  const card = document.createElement('div');
  card.className = 'objection-card';
  card.setAttribute('data-id', item.id);

  const isExpanded = expandedIds.has(item.id);

  card.innerHTML = `
    <div class="objection-header">
      <h3 class="objection-title">${item.objection}</h3>
      <button
        class="toggle-btn"
        aria-expanded="${isExpanded}"
        aria-controls="response-${item.id}"
        data-id="${item.id}"
      >
        <svg class="chevron ${isExpanded ? 'expanded' : ''}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
    <div
      class="objection-response ${isExpanded ? 'expanded' : ''}"
      id="response-${item.id}"
      role="region"
      aria-labelledby="objection-${item.id}"
    >
      <div class="response-section">
        <strong>1. Empathy & Validation:</strong>
        <p>${item.response.empathy}</p>
      </div>
      <div class="response-section">
        <strong>2. Clarifying Question:</strong>
        <p>${item.response.question}</p>
      </div>
      <div class="response-section">
        <strong>3. Response & Positioning:</strong>
        <p>${item.response.positioning}</p>
      </div>
      <div class="response-section">
        <strong>4. Call to Action:</strong>
        <p>${item.response.cta}</p>
      </div>
    </div>
  `;

  return card;
}

function setupEventListeners() {
  document.getElementById('objections-container').addEventListener('click', (e) => {
    const button = e.target.closest('.toggle-btn');
    if (!button) return;

    const id = parseInt(button.dataset.id);
    toggleObjection(id);
  });

  // Keyboard navigation
  document.getElementById('objections-container').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const button = e.target.closest('.toggle-btn');
      if (!button) return;

      e.preventDefault();
      const id = parseInt(button.dataset.id);
      toggleObjection(id);
    }
  });

  // Expand/Collapse all buttons
  document.getElementById('expand-all').addEventListener('click', () => {
    objections.forEach(obj => expandedIds.add(obj.id));
    renderObjections();
  });

  document.getElementById('collapse-all').addEventListener('click', () => {
    expandedIds.clear();
    renderObjections();
  });
}

function toggleObjection(id) {
  if (expandedIds.has(id)) {
    expandedIds.delete(id);
  } else {
    expandedIds.add(id);
  }
  renderObjections();
}
