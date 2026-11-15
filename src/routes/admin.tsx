import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
    Download,
  FileText,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  Loader2,
  LogOut,
  ShieldCheck,
  Trash2,
  Users,
  HeartPulse,
  Brain,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  adminCheck,
  deleteResource,
  exportSurveyCsv,
  listAllProjects,
  listAllResources,
  listSurveyResponses,
  upsertProject,
  upsertResource,
  type ResearchProject,
  type ResearchResource,
  type SurveyRecord,
} from "@/lib/admin.functions";
import {
  AgeDistributionChart,
  ImpactScoresChart,
  CategoryBarsChart,
  ResponsesOverTimeChart,
} from "@/components/charts/survey-charts";
import { BrandMark } from "@/components/site/brand-mark";
import { supabase } from "@/integrations/supabase/client";
import { VALUE_LABELS } from "@/lib/survey-schema";
import { getSurveyAggregates } from "@/lib/survey.functions";
import { SampleBadge } from "@/components/site/sample-badge";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const result = await adminCheck();
    if (!result.isStaff) {
      throw redirect({ to: "/login" });
    }
    return { role: result.role };
  },
  head: () => ({
    meta: [
      { title: "Research Dashboard | Youth Health Matters" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const EFFECT_LABELS: Record<string, string> = {
  school_dropout: "Education disrupted",
  job_loss: "Job loss",
  family_conflict: "Family conflict",
  debt: "Household debt",
  crime_safety: "Safety concerns",
  stigma: "Stigma",
  mental_health: "Mental health",
  physical_health: "Physical health",
};

const CATEGORY_LABELS: Record<string, string> = {
  prevention: "Prevention",
  treatment: "Treatment",
  education: "Education",
  helpline: "Helpline",
  policy: "Policy",
  other: "Other",
};

const RESOURCE_CATEGORIES = ["prevention", "treatment", "education", "helpline", "policy", "other"] as const;

function sliceData(map: Record<string, number>, labels?: Record<string, string>) {
  return Object.entries(map)
    .map(([key, value]) => ({ label: labels?.[key] ?? key, value }))
    .sort((a, b) => b.value - a.value);
}

const IMPACT_KEYS = [
  { key: "health_impact_physical", label: "Physical health" },
  { key: "health_impact_mental", label: "Mental health" },
  { key: "socioeconomic_education", label: "Education" },
  { key: "socioeconomic_employment", label: "Employment" },
  { key: "socioeconomic_family", label: "Family" },
  { key: "socioeconomic_finance", label: "Finances" },
] as const;

type View = "overview" | "responses" | "projects" | "resources";

const ADMIN_NAV: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "responses", label: "Survey responses", icon: Users },
  { id: "projects", label: "Projects", icon: FileText },
  { id: "resources", label: "Resources", icon: LifeBuoy },
];

function AdminPage() {
  const { role } = Route.useRouteContext();
  const isAdmin = role === "admin";
  // Researchers can view the dashboard and survey responses; only admins manage content.
  const nav = isAdmin
    ? ADMIN_NAV
    : ADMIN_NAV.filter((n) => n.id === "overview" || n.id === "responses");
  const [view, setView] = useState<View>("overview");
  const navigate = useNavigate();
  const current = nav.find((n) => n.id === view) ?? nav[0]!;

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    await navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[17rem_1fr]">
      {/* Sidebar (tablet and up) */}
      <aside className="sticky top-0 hidden h-screen flex-col bg-navy-deep p-4 text-white md:flex">
        <BrandMark className="px-1 pb-6 pt-2" />
        <nav aria-label="Dashboard sections" className="flex flex-1 flex-col gap-1">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              aria-current={view === id ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-sky ${
                view === id
                  ? "bg-brand text-brand-foreground shadow-md shadow-brand/30"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="size-4.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 pt-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Globe className="size-4.5" aria-hidden="true" />
            View public site
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="md:hidden">
                <BrandMark tone="light" compact />
              </span>
              <h1 className="hidden text-xl font-extrabold text-navy md:block">{current.label}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:block">
                <SampleBadge label="Live research data" />
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={signOut}
                aria-label="Sign out"
              >
                <LogOut className="size-4.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
          {/* Section switcher (phones) */}
          <nav
            aria-label="Dashboard sections"
            className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden"
          >
            {nav.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                aria-current={view === id ? "page" : undefined}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ${
                  view === id ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </header>

        <main className="space-y-6 px-4 py-6 sm:px-8">
          {view === "overview" && <OverviewTab onSeeAll={() => setView("responses")} />}
          {view === "responses" && <ResponsesTab />}
          {isAdmin && view === "projects" && <ProjectsTab />}
          {isAdmin && view === "resources" && <ResourcesTab />}
        </main>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Users;
  tone: "brand" | "success" | "warn";
}) {
  const toneClass = {
    brand: "bg-brand text-brand-foreground",
    success: "bg-success text-white",
    warn: "bg-warn text-navy-deep",
  }[tone];
  return (
    <div className={`flex items-center gap-4 rounded-2xl p-5 shadow-lg ${toneClass}`}>
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold opacity-90">{label}</p>
        <p className="text-3xl font-extrabold leading-tight">{value}</p>
        <p className="text-xs opacity-80">{hint}</p>
      </div>
    </div>
  );
}

function OverviewTab({ onSeeAll }: { onSeeAll: () => void }) {
  const [aggregates, setAggregates] = useState<Awaited<ReturnType<typeof getSurveyAggregates>>["data"]>(null);
  const [recent, setRecent] = useState<SurveyRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getSurveyAggregates().then((result) => {
      if (result.error || !result.data) setError(result.error ?? "Could not load statistics.");
      else setAggregates(result.data);
    });
    listSurveyResponses().then((result) => {
      if (result.data) setRecent(result.data.slice(0, 5));
    });
  }, []);

  async function downloadCsv() {
    setExporting(true);
    const result = await exportSurveyCsv();
    setExporting(false);
    if (result.error || result.csv === null) {
      toast.error(result.error ?? "Export failed.");
      return;
    }
    if (result.csv === "") {
      toast.info("There are no responses to export yet.");
      return;
    }
    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `survey-responses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  }

  if (error) {
    return <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>;
  }
  if (!aggregates) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading statistics…
      </div>
    );
  }

  const fmt = (v: number | undefined) => (v == null ? "—" : `${Number(v).toFixed(1)} / 5`);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total responses"
          value={String(aggregates.total_responses)}
          hint="Anonymous submissions"
          icon={Users}
          tone="brand"
        />
        <StatCard
          label="Physical health impact"
          value={fmt(aggregates.mean_scores["health_impact_physical"])}
          hint="Mean perceived score"
          icon={HeartPulse}
          tone="success"
        />
        <StatCard
          label="Mental health impact"
          value={fmt(aggregates.mean_scores["health_impact_mental"])}
          hint="Mean perceived score"
          icon={Brain}
          tone="warn"
        />
      </div>

      <Card className="panel gap-0 py-0">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-navy">Responses over time</h3>
            <Button variant="outline" onClick={downloadCsv} disabled={exporting} className="rounded-full">
              {exporting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="size-4" aria-hidden="true" />
              )}
              Export CSV
            </Button>
          </div>
          {aggregates.responses_by_month?.length ? (
            <ResponsesOverTimeChart
              data={aggregates.responses_by_month.map((m) => ({ month: m.month, responses: m.n }))}
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No responses yet — the trend appears once the survey is submitted.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="panel gap-0 py-0">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-6 pt-6">
            <h3 className="text-lg font-bold text-navy">Recent responses</h3>
            <button
              type="button"
              onClick={onSeeAll}
              className="text-sm font-bold text-brand hover:text-brand-deep"
            >
              View all
            </button>
          </div>
          {recent.length === 0 ? (
            <p className="px-6 py-8 text-sm text-muted-foreground">No survey responses yet.</p>
          ) : (
            <div className="overflow-x-auto px-2 pb-3 pt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Awareness</TableHead>
                    <TableHead>Physical</TableHead>
                    <TableHead>Mental</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {new Date(row.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{row.age_range}</TableCell>
                      <TableCell className="text-xs">{VALUE_LABELS[row.awareness_level ?? ""] ?? "—"}</TableCell>
                      <TableCell>{row.health_impact_physical ?? "—"}</TableCell>
                      <TableCell>{row.health_impact_mental ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="panel gap-0 py-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-navy">Respondents by age group</h3>
            <AgeDistributionChart data={sliceData(aggregates.by_age_range)} />
          </CardContent>
        </Card>
        <Card className="panel gap-0 py-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-navy">Mean perceived impact</h3>
            <ImpactScoresChart
              data={IMPACT_KEYS.filter(({ key }) => aggregates.mean_scores[key] != null).map(
                ({ key, label }) => ({ label, value: Number(aggregates.mean_scores[key]) }),
              )}
            />
          </CardContent>
        </Card>
        <Card className="panel gap-0 py-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-navy">Observed effects</h3>
            <CategoryBarsChart data={sliceData(aggregates.observed_effects, EFFECT_LABELS)} />
          </CardContent>
        </Card>
        <Card className="panel gap-0 py-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-navy">Awareness levels</h3>
            <CategoryBarsChart
              data={sliceData(aggregates.awareness_distribution, VALUE_LABELS)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResponsesTab() {
  const [data, setData] = useState<SurveyRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSurveyResponses().then((result) => {
      if (result.error || !result.data) setError(result.error ?? "Could not load records.");
      else setData(result.data);
    });
  }, []);

  if (error) {
    return <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>;
  }
  if (!data) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading responses…
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <p className="rounded-xl border border-border/60 bg-secondary/50 px-4 py-6 text-center text-sm text-muted-foreground">
        No survey responses yet. Share the{" "}
        <Link to="/survey" className="font-semibold text-brand-deep underline underline-offset-4">
          survey link
        </Link>{" "}
        to start collecting.
      </p>
    );
  }

  return (
    <Card className="panel gap-0 py-0">
      <CardContent className="p-0">
        <div className="max-h-[70vh] overflow-auto rounded-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Employment</TableHead>
                <TableHead>Awareness</TableHead>
                <TableHead>Physical</TableHead>
                <TableHead>Mental</TableHead>
                <TableHead>Observed effects</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {new Date(row.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{row.age_range}</TableCell>
                  <TableCell className="text-xs">{VALUE_LABELS[row.gender ?? ""] ?? "—"}</TableCell>
                  <TableCell className="text-xs">{VALUE_LABELS[row.employment_status ?? ""] ?? "—"}</TableCell>
                  <TableCell className="text-xs">{VALUE_LABELS[row.awareness_level ?? ""] ?? "—"}</TableCell>
                  <TableCell>{row.health_impact_physical ?? "—"}</TableCell>
                  <TableCell>{row.health_impact_mental ?? "—"}</TableCell>
                  <TableCell className="max-w-48 text-xs text-muted-foreground">
                    {(row.observed_effects ?? []).map((e) => EFFECT_LABELS[e] ?? e).join(", ") || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
          Showing the {Math.min(data.length, 2000)} most recent responses. Identifying fields are
          never collected; the anonymous token is excluded from exports.
        </p>
      </CardContent>
    </Card>
  );
}

function ProjectsTab() {
  const [projects, setProjects] = useState<ResearchProject[] | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);

  async function reload() {
    const result = await listAllProjects();
    if (result.data) setProjects(result.data);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await upsertProject({ data: { title, description, objectives, publication_status: status } });
    setSaving(false);
    if (result.ok) {
      toast.success("Project saved");
      setTitle("");
      setDescription("");
      setObjectives("");
      setStatus("draft");
      await reload();
    } else {
      toast.error(result.error ?? "Save failed");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Card className="panel gap-0 py-0">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-navy">Add a research project</h3>
          <form className="mt-4 space-y-4" onSubmit={handleSave}>
            <div className="space-y-1.5">
              <Label htmlFor="project-title">Title</Label>
              <Input id="project-title" required maxLength={300} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-description">Description</Label>
              <Textarea id="project-description" maxLength={5000} className="min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-objectives">Objectives</Label>
              <Textarea id="project-objectives" maxLength={5000} className="min-h-24" value={objectives} onChange={(e) => setObjectives(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Publication status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft — hidden from the public</SelectItem>
                  <SelectItem value="published">Published — visible on the site</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={saving} className="bg-brand text-brand-foreground hover:bg-brand-deep">
              {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Save project
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="panel gap-0 py-0">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-navy">Existing projects</h3>
          {!projects ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading…
            </div>
          ) : projects.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No projects yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {projects.map((project) => (
                <li key={project.id} className="rounded-xl border border-border/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{project.title}</p>
                    <Badge variant={project.publication_status === "published" ? "default" : "outline"}>
                      {project.publication_status}
                    </Badge>
                  </div>
                  {project.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResourcesTab() {
  const [resources, setResources] = useState<ResearchResource[] | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("prevention");
  const [sourceUrl, setSourceUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);

  async function reload() {
    const result = await listAllResources();
    if (result.data) setResources(result.data);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await upsertResource({
      data: { title, description, category, source_url: sourceUrl, publication_status: status },
    });
    setSaving(false);
    if (result.ok) {
      toast.success("Resource saved");
      setTitle("");
      setDescription("");
      setSourceUrl("");
      setStatus("draft");
      await reload();
    } else {
      toast.error(result.error ?? "Save failed");
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteResource({ data: { id } });
    if (result.ok) {
      toast.success("Resource deleted");
      await reload();
    } else {
      toast.error(result.error ?? "Delete failed");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Card className="panel gap-0 py-0">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-navy">Add a support resource</h3>
          <form className="mt-4 space-y-4" onSubmit={handleSave}>
            <div className="space-y-1.5">
              <Label htmlFor="resource-title">Title</Label>
              <Input id="resource-title" required maxLength={300} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resource-description">Description</Label>
              <Textarea id="resource-description" maxLength={2000} className="min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Publication status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resource-url">Source URL</Label>
              <Input
                id="resource-url"
                type="url"
                required
                placeholder="https://example.org/help"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={saving} className="bg-brand text-brand-foreground hover:bg-brand-deep">
              {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Save resource
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="panel gap-0 py-0">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-navy">All resources</h3>
          {!resources ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading…
            </div>
          ) : resources.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No resources yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {resources.map((resource) => (
                <li key={resource.id} className="rounded-xl border border-border/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{resource.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {CATEGORY_LABELS[resource.category] ?? resource.category} ·{" "}
                        <a
                          href={resource.source_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="underline underline-offset-2"
                        >
                          {resource.source_url}
                        </a>
                      </p>
                      {resource.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Badge variant={resource.publication_status === "published" ? "default" : "outline"}>
                        {resource.publication_status}
                      </Badge>
                      <Button variant="ghost" size="icon" aria-label={`Delete ${resource.title}`} onClick={() => handleDelete(resource.id)}>
                        <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-brand-deep" aria-hidden="true" />
            Published resources appear on the public Prevention &amp; Resources page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
