import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Check,
  CheckCircle2,
  ClipboardList,
  Coins,
  HeartPulse,
  Lock,
  ShieldPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/site/brand-mark";
import { SampleBadge } from "@/components/site/sample-badge";
import {
  AgeDistributionChart,
  ImpactScoresChart,
} from "@/components/charts/survey-charts";
import {
  mainObjective,
  problemStatement,
  researchBackground,
  researchQuestions,
  significance,
  specificObjectives,
} from "@/lib/research-content";
import heroImage from "@/assets/hero.jpg";
import supportImage from "@/assets/support.jpg";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Youth Health Matters | Socio-Economic & Health Effects of Substance Abuse Among Youths",
      },
      {
        name: "description",
        content:
          "Explore how substance abuse affects the health, education, families, and economic opportunities of young people. Take the anonymous research survey and read the findings.",
      },
      { property: "og:title", content: "Youth Health Matters | Substance Abuse Effects on Youths" },
      {
        property: "og:description",
        content:
          "Understanding the real impact. Building a healthier future. Anonymous research survey, findings, and prevention resources.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const QUICK_CARDS = [
  {
    icon: Users,
    title: "Anonymous survey",
    description: "Takes 5–7 minutes. No names, emails or addresses are collected.",
    to: "/survey",
  },
  {
    icon: HeartPulse,
    title: "Mental health",
    description: "Substance abuse is linked to depression, anxiety and emotional distress.",
    to: "/health-effects",
  },
  {
    icon: Coins,
    title: "Economic impact",
    description: "Lost jobs, debt and strained household budgets follow close behind.",
    to: "/socio-economic-effects",
  },
  {
    icon: ShieldPlus,
    title: "Health risks",
    description: "Addiction, organ damage and risk of overdose — even from first use.",
    to: "/health-effects",
  },
] as const;

const SOCIO_EFFECTS = [
  "Declining academic performance and dropout",
  "Lost jobs and reduced productivity",
  "Family conflict and broken trust",
  "Debt and household financial strain",
  "Community safety concerns",
  "Stigma, shame and exclusion",
] as const;

const HEALTH_EFFECTS = [
  "Anxiety, depression and emotional distress",
  "Addiction and dependence",
  "Damage to the liver, heart and lungs",
  "Higher risk of injury and violence",
  "Overdose and premature death",
  "Disrupted sleep and development",
] as const;

const SAMPLE_STATS = [
  { label: "Survey responses collected", value: "1,248", note: "Sample figure" },
  { label: "Mean perceived health impact", value: "4.1 / 5", note: "Sample figure" },
  { label: "Mean perceived socio-economic impact", value: "3.8 / 5", note: "Sample figure" },
  { label: "Youth reached by outreach", value: "3,200+", note: "Sample figure" },
];

const SAMPLE_AGE_DATA = [
  { label: "18–24", value: 46 },
  { label: "25–34", value: 32 },
  { label: "35–44", value: 14 },
  { label: "45+", value: 8 },
];

const SAMPLE_IMPACT_DATA = [
  { label: "Mental health", value: 4.3 },
  { label: "Physical health", value: 4.1 },
  { label: "Education", value: 3.9 },
  { label: "Finances", value: 3.7 },
  { label: "Employment", value: 3.6 },
  { label: "Family", value: 3.4 },
];

function Index() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative isolate overflow-hidden bg-navy-deep">
        <img
          src={heroImage}
          alt="A diverse group of young adults in a supportive group discussion"
          className="absolute inset-0 -z-10 size-full object-cover object-[70%_center]"
          width={1920}
          height={1088}
        />
        <div className="absolute inset-0 -z-10 hero-shade" />
        <div className="mx-auto max-w-6xl px-4 pb-32 pt-16 text-navy-foreground sm:px-6 md:pb-40 md:pt-24">
          <Badge className="border-none bg-white/10 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur">
            <ClipboardList className="mr-1.5 size-3.5 text-sky" aria-hidden="true" />
            Anonymous survey now open
          </Badge>
          <h1 className="reveal mt-5 max-w-2xl text-4xl font-extrabold leading-[1.1] sm:text-5xl md:text-[3.35rem]">
            Socio-Economic and Health-Related Effects of{" "}
            <span className="text-sky">Substance Abuse Among Youths</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-foreground/85 sm:text-lg">
            Substance abuse doesn’t just affect the individual — it harms families,
            communities and the future. Let’s create awareness, support and healthier
            choices for our youth.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-brand px-7 font-semibold text-brand-foreground shadow-lg shadow-brand/40 hover:bg-brand-deep"
            >
              <Link to="/about">
                Learn More
                <ArrowRight className="ml-1 size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/50 bg-white/5 px-7 font-semibold text-white backdrop-blur hover:bg-white/15 hover:text-white"
            >
              <Link to="/resources">Get Help</Link>
            </Button>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-navy-foreground/70">
            <Lock className="size-4" aria-hidden="true" />
            Anonymous, voluntary and confidential.
          </p>
        </div>
      </section>

      {/* ============ QUICK CARDS (overlap the hero) ============ */}
      <section
        className="relative z-10 mx-auto -mt-20 max-w-6xl px-4 sm:px-6 md:-mt-24"
        aria-labelledby="features-heading"
      >
        <h2 id="features-heading" className="sr-only">
          What this platform covers
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {QUICK_CARDS.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="group rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Card className="panel h-full gap-0 border-border/70 py-0 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-brand/15">
                <CardContent className="p-4 sm:p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                    <card.icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-navy sm:text-lg">{card.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ ABOUT THE ISSUE ============ */}
      <section
        className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.1fr]"
        aria-labelledby="issue-heading"
      >
        <div>
          <h2 id="issue-heading" className="text-3xl font-extrabold text-navy sm:text-4xl">
            About the Issue
          </h2>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground">
            Substance abuse among youths is a growing concern in our society. It affects
            physical health, mental wellbeing, education, employment and overall quality of
            life. Understanding its socio-economic and health-related effects helps us build
            better prevention and support systems.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-7 rounded-full bg-brand px-7 font-semibold text-brand-foreground hover:bg-brand-deep"
          >
            <Link to="/about">
              Read More
              <ArrowRight className="ml-1 size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="relative">
          <div
            className="absolute -inset-3 -z-10 rounded-[2rem] bg-brand-soft"
            aria-hidden="true"
          />
          <img
            src={supportImage}
            alt="Two young people sitting together outdoors, one offering the other a reassuring hand on the shoulder"
            className="aspect-[16/10] w-full rounded-3xl object-cover shadow-xl shadow-navy/20"
            width={1291}
            height={924}
            loading="lazy"
          />
        </div>
      </section>

      {/* ============ KEY EFFECTS ============ */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6" aria-labelledby="effects-heading">
        <h2 id="effects-heading" className="text-3xl font-extrabold text-navy">
          Key Effects
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {[
            {
              icon: Briefcase,
              title: "Socio-Economic Effects",
              items: SOCIO_EFFECTS,
              to: "/socio-economic-effects",
            },
            {
              icon: HeartPulse,
              title: "Health-Related Effects",
              items: HEALTH_EFFECTS,
              to: "/health-effects",
            },
          ].map((group) => (
            <div key={group.title} className="panel p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-navy text-white">
                  <group.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold text-navy">{group.title}</h3>
              </div>
              <ul className="mt-5 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/85">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to={group.to}
                className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-deep"
              >
                See the full picture
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ============ RESEARCH OVERVIEW ============ */}
      <section className="bg-secondary py-20" aria-labelledby="overview-heading">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="text-sm font-semibold text-brand-deep">
              Research overview
            </p>
            <h2
              id="overview-heading"
              className="mt-3 text-3xl font-extrabold leading-tight text-navy"
            >
              Why this study matters
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {mainObjective}
            </p>
            <Button asChild className="mt-6 rounded-full bg-navy font-semibold hover:bg-navy-soft">
              <Link to="/about">
                Read the full study design
                <ArrowRight className="ml-1 size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="space-y-5">
            {[
              { title: "Background", body: researchBackground },
              { title: "Problem statement", body: problemStatement },
              { title: "Significance of the study", body: significance },
            ].map((block) => (
              <Card key={block.title} className="panel gap-0 py-0">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-navy">
                    {block.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {block.body}
                  </p>
                </CardContent>
              </Card>
            ))}
            <Card className="panel gap-0 border-brand/30 bg-brand-soft/60 py-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-navy">
                  Research questions
                </h3>
                <ul className="mt-3 space-y-2">
                  {researchQuestions.map((q) => (
                    <li key={q} className="flex gap-2 text-sm leading-relaxed text-foreground/85">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-deep" aria-hidden="true" />
                      {q}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="panel gap-0 py-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-navy">
                  Specific objectives
                </h3>
                <ul className="mt-3 space-y-2">
                  {specificObjectives.map((o) => (
                    <li key={o} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-deep" aria-hidden="true" />
                      {o}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ============ STATISTICS (SAMPLE) ============ */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6" aria-labelledby="stats-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-deep">
              Research dashboard
            </p>
            <h2
              id="stats-heading"
              className="mt-3 text-3xl font-extrabold text-navy"
            >
              The data behind the study
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              The figures below are demonstration data so you can see how live findings
              will appear. Verified survey results will replace them as responses come
              in.
            </p>
          </div>
          <SampleBadge label="Sample data — not real findings" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SAMPLE_STATS.map((stat) => (
            <Card key={stat.label} className="panel gap-0 py-0">
              <CardContent className="p-5">
                <p className="text-3xl font-extrabold text-brand">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{stat.label}</p>
                <p className="mt-2 text-xs text-muted-foreground">{stat.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <Card className="panel gap-0 py-0">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-navy">
                Respondents by age group
              </h3>
              <p className="mb-4 mt-1 text-xs text-muted-foreground">Sample distribution</p>
              <AgeDistributionChart data={SAMPLE_AGE_DATA} />
            </CardContent>
          </Card>
          <Card className="panel gap-0 py-0">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-navy">
                Mean perceived impact by life domain
              </h3>
              <p className="mb-4 mt-1 text-xs text-muted-foreground">
                1 = no impact · 5 = severe impact · sample scores
              </p>
              <ImpactScoresChart data={SAMPLE_IMPACT_DATA} />
            </CardContent>
          </Card>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Want the real picture?{" "}
          <Link to="/survey" className="font-semibold text-brand-deep underline underline-offset-4">
            Take the anonymous survey
          </Link>{" "}
          or view the live{" "}
          <Link to="/findings" className="font-semibold text-brand-deep underline underline-offset-4">
            research findings
          </Link>
          .
        </p>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6" aria-labelledby="cta-heading">
        <div className="band-navy relative overflow-hidden rounded-3xl px-6 py-10 text-navy-foreground sm:px-12 md:py-12">
          <BrandLogo
            className="pointer-events-none absolute -right-6 -top-6 size-52 text-white/[0.06]"
          />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 id="cta-heading" className="text-2xl font-extrabold sm:text-3xl">
                A Brighter Future is Possible
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-navy-foreground/80 sm:text-base">
                Awareness, education, counselling and support can help youths make healthier
                choices and build better lives. The survey is anonymous — we never ask for your
                name, email, phone number or address.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-brand px-7 font-semibold text-brand-foreground shadow-lg shadow-brand/40 hover:bg-brand-deep"
              >
                <Link to="/resources">Get Support</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-transparent px-7 font-semibold text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/survey">Take the Survey</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
