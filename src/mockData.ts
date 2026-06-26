import { Decision } from './types';

export const mockDecisions: Decision[] = [
  {
    id: 'mock-1',
    title: 'Should I learn Rust or Go for backend development?',
    context: 'I am a junior frontend developer with 2 years of React experience. I want to expand to the backend to become a full-stack developer, aiming for high performance and system design jobs in tech companies.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 3).toISOString(), // 3 days ago
    analysisType: 'comparison',
    options: ['Rust', 'Go'],
    result: {
      criteria: [
        { name: 'Learning Curve', description: 'Ease of picking up the language and starting to build applications', weight: 4 },
        { name: 'Job Market Demand', description: 'Availability of open roles specifically looking for this language expertise', weight: 5 },
        { name: 'Developer Velocity', description: 'Speed of writing code, debugging, and shipping features', weight: 3 },
        { name: 'Performance & Concurrency', description: 'Execution speed, memory safety, and native concurrency efficiency', weight: 4 },
        { name: 'Ecosystem Maturity', description: 'Quality and variety of libraries, frameworks, and tools', weight: 3 }
      ],
      options: ['Rust', 'Go'],
      matrix: [
        {
          criterionName: 'Learning Curve',
          ratings: [
            { optionName: 'Rust', rating: 2, explanation: 'Very steep learning curve due to borrow checker, lifetime annotations, and complex type systems.' },
            { optionName: 'Go', rating: 5, explanation: 'Extremely fast to learn. Minimalist design with only 25 keywords makes it accessible within days.' }
          ]
        },
        {
          criterionName: 'Job Market Demand',
          ratings: [
            { optionName: 'Rust', rating: 3, explanation: 'Growing quickly in infrastructure, blockchain, and tooling, but fewer junior-level listings.' },
            { optionName: 'Go', rating: 5, explanation: 'Massive demand across startups and big tech for enterprise cloud services, microservices, and Kubernetes systems.' }
          ]
        },
        {
          criterionName: 'Developer Velocity',
          ratings: [
            { optionName: 'Rust', rating: 3, explanation: 'Slower initial development because you must satisfy the compiler first, though it avoids runtime bugs.' },
            { optionName: 'Go', rating: 5, explanation: 'Fast compilations and straightforward syntax mean you can write and ship endpoints rapidly.' }
          ]
        },
        {
          criterionName: 'Performance & Concurrency',
          ratings: [
            { optionName: 'Rust', rating: 5, explanation: 'Unrivaled bare-metal performance, zero-cost abstractions, and guaranteed thread safety with no garbage collector.' },
            { optionName: 'Go', rating: 4, explanation: 'Highly optimized execution, extremely fast compile times, and cheap goroutines, though it uses a garbage collector.' }
          ]
        },
        {
          criterionName: 'Ecosystem Maturity',
          ratings: [
            { optionName: 'Rust', rating: 4, explanation: 'Excellent package manager (Cargo) and great libraries, but standard libraries are small; web ecosystem is still maturing.' },
            { optionName: 'Go', rating: 5, explanation: 'Industry-standard, battle-tested standard libraries with native HTTP, testing, and JSON parsing built-in.' }
          ]
        }
      ],
      verdict: {
        recommendation: 'Go (Golang)',
        summary: 'While Rust offers unparalleled bare-metal performance and memory safety, your immediate objective is to become a full-stack developer and land high-paying roles quickly. Go offers an exceptionally gentle learning curve, superb developer velocity, and massive industry demand for backend services. Rust is an excellent secondary language for deeper low-level system design down the road.',
        directComparisonSummary: 'Go is practically designed for rapid team delivery and enterprise cloud services, whereas Rust shines in system tooling where failure is not an option.'
      }
    }
  },
  {
    id: 'mock-2',
    title: 'Should I buy an electric vehicle (EV) or a hybrid car?',
    context: 'Commuting 40 miles round trip daily. Living in a suburban home with a garage. Electricity rate is average. We do road trips about twice a year.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 7).toISOString(), // 7 days ago
    analysisType: 'pros_cons',
    options: ['Electric Vehicle (EV)', 'Hybrid Vehicle'],
    result: {
      optionsAnalysis: [
        {
          optionName: 'Electric Vehicle (EV)',
          pros: [
            { id: 'ev_p1', text: 'Zero Tailpipe Emissions', category: 'Environmental', weight: 5, explanation: 'Aligns perfectly with sustainability goals and reduces carbon footprint.' },
            { id: 'ev_p2', text: 'Low Fuel/Electricity Costs', category: 'Financial', weight: 4, explanation: 'Charging at home overnight is significantly cheaper than gasoline per mile.' },
            { id: 'ev_p3', text: 'Minimal Maintenance', category: 'Effort', weight: 4, explanation: 'No oil changes, spark plugs, or catalytic converters to worry about; brakes last longer due to regenerative braking.' }
          ],
          cons: [
            { id: 'ev_c1', text: 'Higher Initial Purchase Price', category: 'Financial', weight: 4, explanation: 'EVs still carry a premium upfront cost, though federal/state tax credits may offset some of it.' },
            { id: 'ev_c2', text: 'Range Anxiety on Road Trips', category: 'Convenience', weight: 3, explanation: 'Requires careful charging stop planning during twice-yearly road trips, potentially adding hours of travel.' }
          ]
        },
        {
          optionName: 'Hybrid Vehicle',
          pros: [
            { id: 'hb_p1', text: 'Excellent Fuel Efficiency', category: 'Financial', weight: 4, explanation: 'Achieves 50+ MPG, reducing fuel costs substantially compared to pure internal combustion vehicles.' },
            { id: 'hb_p2', text: 'Zero Charging Infrastructure Dependency', category: 'Convenience', weight: 5, explanation: 'Gas stations are everywhere. Quick refuels and absolutely no range limitations on road trips.' }
          ],
          cons: [
            { id: 'hb_c1', text: 'Dual System Complexity', category: 'Maintenance', weight: 3, explanation: 'Has both a petrol engine and electric motors with battery, leading to complex long-term maintenance items.' },
            { id: 'hb_c2', text: 'Still Reliant on Fossil Fuels', category: 'Environmental', weight: 4, explanation: 'You are still burning gasoline daily, continuing direct environmental impact.' }
          ]
        }
      ],
      verdict: {
        recommendation: 'Electric Vehicle (EV)',
        summary: 'Since you commute 40 miles daily and have a garage for convenient overnight charging, an EV is highly advantageous. Your daily fuel and maintenance costs will plummet. The twice-a-year road trips are minor exceptions that can be easily managed with modern fast-charging networks or by renting a hybrid/ICE car for those specific trips.',
        confidenceScore: 82
      }
    }
  }
];
