import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  AGE_RANGES,
  AWARENESS_LEVELS,
  EDUCATION_LEVELS,
  EMPLOYMENT_STATUSES,
  GENDERS,
  SERVICES_AWARENESS,
} from "@/lib/survey-schema";

/**
 * Admin server functions. Every handler verifies the caller's role through the
 * security-definer has_role() database function — never through client-supplied
 * data. Row Level Security enforces the same rules at the database.
 */

type RoleContext = { supabase: Awaited<unknown>; userId: string };

async function hasRole(context: RoleContext, role: "admin" | "moderator") {
  const { data, error } = await (context.supabase as any).rpc("has_role", {
    _user_id: context.userId,
    _role: role,
  });
  return !error && data === true;
}

/** Full control: manage projects/resources. */
async function requireAdmin(context: RoleContext) {
  if (!(await hasRole(context, "admin"))) {
    throw new Error("Forbidden: administrator access required");
  }
}

/** Researchers ("moderator" role) and admins may view and export survey data. */
async function requireStaff(context: RoleContext) {
  if ((await hasRole(context, "admin")) || (await hasRole(context, "moderator"))) return;
  throw new Error("Forbidden: researcher access required");
}

export const adminCheck = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const isAdmin = await hasRole(context, "admin");
    const isResearcher = !isAdmin && (await hasRole(context, "moderator"));
    return {
      isAdmin,
      isStaff: isAdmin || isResearcher,
      role: (isAdmin ? "admin" : isResearcher ? "researcher" : null) as
        | "admin"
        | "researcher"
        | null,
    };
  });

export type ResponseStatus = "approved" | "rejected";

export interface SurveyRecord {
  id: string;
  created_at: string;
  status: ResponseStatus;
  age_range: string;
  gender: string | null;
  education_level: string | null;
  employment_status: string | null;
  awareness_level: string | null;
  health_impact_physical: number | null;
  health_impact_mental: number | null;
  socioeconomic_education: number | null;
  socioeconomic_employment: number | null;
  socioeconomic_family: number | null;
  socioeconomic_finance: number | null;
  observed_effects: string[] | null;
  services_awareness: string | null;
  barriers: string[] | null;
  suggestions: string | null;
}

export const listSurveyResponses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ data: SurveyRecord[] | null; error?: string }> => {
    try {
      await requireStaff(context);
    } catch {
      return { data: null, error: "Researcher access required." };
    }
    const { data, error } = await (context.supabase as any)
      .from("survey_responses")
      .select(
        `id, created_at, status, age_range, gender, education_level, employment_status,
         awareness_level, health_impact_physical, health_impact_mental,
         socioeconomic_education, socioeconomic_employment, socioeconomic_family,
         socioeconomic_finance, observed_effects, services_awareness, barriers, suggestions`,
      )
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) {
      console.error("[listSurveyResponses] failed", error);
      return { data: null, error: "Could not load survey records." };
    }
    return { data: data as SurveyRecord[] };
  });

export const exportSurveyCsv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ csv: string | null; error?: string }> => {
    try {
      await requireStaff(context);
    } catch {
      return { csv: null, error: "Researcher access required." };
    }
    const { data, error } = await (context.supabase as any)
      .from("survey_responses")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[exportSurveyCsv] failed", error);
      return { csv: null, error: "Could not export survey data." };
    }
    const rows = (data ?? []) as Record<string, unknown>[];
    if (rows.length === 0) return { csv: "" };

    const headers = Object.keys(rows[0]!).filter((h) => h !== "anon_token");
    const escape = (v: unknown) => {
      if (v === null || v === undefined) return "";
      const s = Array.isArray(v) ? v.join("; ") : String(v);
      return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
    };
    const lines = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
    ];
    return { csv: lines.join("\n") };
  });

const likert = z.number().int().min(1).max(5).nullable();

const responseEditInput = z.object({
  id: z.string().uuid(),
  age_range: z.enum(AGE_RANGES),
  gender: z.enum(GENDERS).nullable(),
  education_level: z.enum(EDUCATION_LEVELS).nullable(),
  employment_status: z.enum(EMPLOYMENT_STATUSES).nullable(),
  awareness_level: z.enum(AWARENESS_LEVELS).nullable(),
  health_impact_physical: likert,
  health_impact_mental: likert,
  socioeconomic_education: likert,
  socioeconomic_employment: likert,
  socioeconomic_family: likert,
  socioeconomic_finance: likert,
  observed_effects: z.array(z.string().max(60)).max(20),
  services_awareness: z.enum(SERVICES_AWARENESS).nullable(),
  barriers: z.array(z.string().max(60)).max(20),
  suggestions: z.string().max(2000).nullable(),
});

/** Admin only: correct the answers of one survey response. */
export const updateSurveyResponse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => responseEditInput.parse(input))
  .handler(async ({ context, data }): Promise<{ ok: boolean; error?: string }> => {
    try {
      await requireAdmin(context);
    } catch {
      return { ok: false, error: "Administrator access required." };
    }
    const { id, ...values } = data;
    const suggestions = values.suggestions?.trim() ? values.suggestions.trim() : null;
    const { data: updated, error } = await (context.supabase as any)
      .from("survey_responses")
      .update({ ...values, suggestions })
      .eq("id", id)
      .select("id");
    if (error) {
      console.error("[updateSurveyResponse] failed", error);
      return { ok: false, error: "Could not save the changes." };
    }
    if (!updated || updated.length === 0) {
      return { ok: false, error: "Response not found or you are not allowed to change it." };
    }
    return { ok: true };
  });

/** Admin only: reject a response (excluded from statistics and exports) or restore it. */
export const setSurveyResponseStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["approved", "rejected"]) }).parse(input),
  )
  .handler(async ({ context, data }): Promise<{ ok: boolean; error?: string }> => {
    try {
      await requireAdmin(context);
    } catch {
      return { ok: false, error: "Administrator access required." };
    }
    const { data: updated, error } = await (context.supabase as any)
      .from("survey_responses")
      .update({ status: data.status, reviewed_at: new Date().toISOString() })
      .eq("id", data.id)
      .select("id");
    if (error) {
      console.error("[setSurveyResponseStatus] failed", error);
      return { ok: false, error: "Could not update the response status." };
    }
    if (!updated || updated.length === 0) {
      return { ok: false, error: "Response not found or you are not allowed to change it." };
    }
    return { ok: true };
  });

/** Admin only: permanently delete one survey response. */
export const deleteSurveyResponse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }): Promise<{ ok: boolean; error?: string }> => {
    try {
      await requireAdmin(context);
    } catch {
      return { ok: false, error: "Administrator access required." };
    }
    const { data: deleted, error } = await (context.supabase as any)
      .from("survey_responses")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error) {
      console.error("[deleteSurveyResponse] failed", error);
      return { ok: false, error: "Could not delete the response." };
    }
    if (!deleted || deleted.length === 0) {
      return { ok: false, error: "Response not found or you are not allowed to delete it." };
    }
    return { ok: true };
  });

export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  objectives: string;
  publication_status: string;
  created_at: string;
  updated_at: string;
}

export const listAllProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ data: ResearchProject[] | null; error?: string }> => {
    try {
      await requireAdmin(context);
    } catch {
      return { data: null, error: "Administrator access required." };
    }
    const { data, error } = await (context.supabase as any)
      .from("research_projects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      console.error("[listAllProjects] failed", error);
      return { data: null, error: "Could not load research projects." };
    }
    return { data: data as ResearchProject[] };
  });

const projectInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).default(""),
  objectives: z.string().max(5000).default(""),
  publication_status: z.enum(["draft", "published"]).default("draft"),
});

export const upsertProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => projectInput.parse(input))
  .handler(async ({ context, data }): Promise<{ ok: boolean; error?: string }> => {
    try {
      await requireAdmin(context);
    } catch {
      return { ok: false, error: "Administrator access required." };
    }
    const values = { ...data, updated_at: new Date().toISOString() };
    const { error } = await (context.supabase as any)
      .from("research_projects")
      .upsert(values);
    if (error) {
      console.error("[upsertProject] failed", error);
      return { ok: false, error: "Could not save the project." };
    }
    return { ok: true };
  });

export interface ResearchResource {
  id: string;
  title: string;
  description: string;
  category: string;
  source_url: string;
  publication_status: string;
  created_at: string;
  updated_at: string;
}

export const listAllResources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ data: ResearchResource[] | null; error?: string }> => {
    try {
      await requireAdmin(context);
    } catch {
      return { data: null, error: "Administrator access required." };
    }
    const { data, error } = await (context.supabase as any)
      .from("research_resources")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      console.error("[listAllResources] failed", error);
      return { data: null, error: "Could not load research resources." };
    }
    return { data: data as ResearchResource[] };
  });

const resourceInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).default(""),
  category: z.enum(["prevention", "treatment", "education", "helpline", "policy", "other"]),
  source_url: z.string().url(),
  publication_status: z.enum(["draft", "published"]).default("draft"),
});

export const upsertResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => resourceInput.parse(input))
  .handler(async ({ context, data }): Promise<{ ok: boolean; error?: string }> => {
    try {
      await requireAdmin(context);
    } catch {
      return { ok: false, error: "Administrator access required." };
    }
    const values = { ...data, updated_at: new Date().toISOString() };
    const { error } = await (context.supabase as any)
      .from("research_resources")
      .upsert(values);
    if (error) {
      console.error("[upsertResource] failed", error);
      return { ok: false, error: "Could not save the resource." };
    }
    return { ok: true };
  });

export const deleteResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }): Promise<{ ok: boolean; error?: string }> => {
    try {
      await requireAdmin(context);
    } catch {
      return { ok: false, error: "Administrator access required." };
    }
    const { error } = await (context.supabase as any)
      .from("research_resources")
      .delete()
      .eq("id", data.id);
    if (error) {
      console.error("[deleteResource] failed", error);
      return { ok: false, error: "Could not delete the resource." };
    }
    return { ok: true };
  });
