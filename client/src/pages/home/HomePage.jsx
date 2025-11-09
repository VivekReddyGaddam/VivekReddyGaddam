import { Link } from "react-router-dom";
import { Rocket, Users, ShieldCheck } from "lucide-react";

import Button from "../../components/common/Button";

const pillars = [
  {
    title: "Post in 30 Seconds",
    description: "Share your idea instantly with a guided form designed to remove friction and fear.",
    icon: Rocket,
  },
  {
    title: "Connect with Collaborators",
    description: "Filter the community by skills, commitment, and stage to find your perfect co-builders.",
    icon: Users,
  },
  {
    title: "Build with Confidence",
    description: "Stay anonymous until you're ready, learn why idea theft is a myth, and stay in control.",
    icon: ShieldCheck,
  },
];

function HomePage() {
  return (
    <section className="space-y-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 text-center">
        <span className="mx-auto w-fit rounded-full border border-primary-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
          IdeaConnect Beta
        </span>
        <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
          Share ideas freely, find collaborators instantly, and validate faster than ever.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          IdeaConnect is the frictionless idea-sharing platform built for dreamers, doers, and investors. Post your idea,
          connect with talent, and take your concept from spark to team in record time.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button as={Link} to="/post" variant="primary" className="w-full sm:w-auto">
            Post Your Idea
          </Button>
          <Button as={Link} to="/ideas" variant="secondary" className="w-full sm:w-auto">
            Browse the Idea Feed
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {pillars.map((pillar) => (
          <div
            key={pillar.title}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <pillar.icon className="h-8 w-8 text-primary-600" />
            <h3 className="text-lg font-semibold text-slate-900">{pillar.title}</h3>
            <p className="text-sm text-slate-600">{pillar.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HomePage;
