import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, Loader2, LogIn, ShieldCheck, UserCog, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { adminCheck } from "@/lib/admin.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Researcher Sign In | Youth Health Matters" },
      {
        name: "description",
        content:
          "Sign-in area for the research team. Survey participants do not need an account — the public survey is completely anonymous.",
      },
      { property: "og:title", content: "Researcher Sign In | Youth Health Matters" },
      {
        property: "og:description",
        content: "Sign-in area for the research team. The public survey needs no account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

type Portal = "researcher" | "admin";
type Mode = "signin" | "signup" | "forgot" | "reset";

function LoginPage() {
  const navigate = useNavigate();
  const [portal, setPortal] = useState<Portal>("researcher");
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Arriving from a "reset password" email link: let the person choose a new password.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
        setNotice("Choose a new password for your account.");
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  function switchPortal(next: Portal) {
    setPortal(next);
    setNotice(null);
    if (next === "admin" && mode === "signup") setMode("signin");
  }

  async function afterSignIn() {
    const result = await adminCheck();
    if (portal === "admin") {
      if (result.role === "admin") {
        toast.success("Welcome back, administrator");
        await navigate({ to: "/admin" });
        return;
      }
      await supabase.auth.signOut();
      setNotice(
        result.role === "researcher"
          ? "This is a researcher account, not an administrator. Use the Researcher tab to sign in."
          : "This account is not an administrator. Ask the study lead to grant administrator access.",
      );
      return;
    }
    if (result.isStaff) {
      toast.success("Welcome back");
      await navigate({ to: "/admin" });
      return;
    }
    await supabase.auth.signOut();
    setNotice(
      "Your account exists but has not been approved yet. Ask the study lead to grant you researcher access.",
    );
  }

  function describeError(message: string) {
    // In development, show which Supabase project the app is talking to (helps spot a wrong .env).
    const host = import.meta.env.DEV
      ? ` (project: ${new URL(import.meta.env.VITE_SUPABASE_URL).host})`
      : "";
    if (message.toLowerCase().includes("invalid login credentials")) {
      return `Wrong email or password. If you forgot it, use "Forgot password?" below.${host}`;
    }
    return message + host;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setNotice(describeError(error.message));
          return;
        }
        await afterSignIn();
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/login` },
        });
        if (error) {
          setNotice(describeError(error.message));
          return;
        }
        if (data.session) {
          // Email confirmation is switched off in Supabase: the user is already signed in.
          await supabase.auth.signOut();
          setNotice(
            "Account created. It must be approved by the study lead before you can open the dashboard. Then sign in here.",
          );
        } else {
          setNotice(
            "Account created. Check your inbox for a confirmation link, then sign in here. Access is granted only after the study lead approves the account.",
          );
        }
        setMode("signin");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) {
          setNotice(describeError(error.message));
          return;
        }
        setNotice("If that email has an account, a reset link is on its way. Check your inbox.");
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          setNotice(describeError(error.message));
          return;
        }
        toast.success("Password updated");
        setMode("signin");
        await afterSignIn();
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "signup"
      ? "Create a researcher account"
      : mode === "forgot"
        ? "Reset your password"
        : mode === "reset"
          ? "Set a new password"
          : portal === "admin"
            ? "Administrator sign in"
            : "Researcher sign in";
  const showEmail = mode !== "reset";
  const showPassword = mode !== "forgot";
  const submitLabel =
    mode === "signup"
      ? "Create account"
      : mode === "forgot"
        ? "Send reset link"
        : mode === "reset"
          ? "Save new password"
          : "Sign in";
  const SubmitIcon = mode === "signup" ? UserPlus : mode === "signin" ? LogIn : KeyRound;

  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">{title}</h1>
              <p className="text-xs text-muted-foreground">Youth Health Matters</p>
            </div>
          </div>

          {mode === "signin" || mode === "signup" ? (
            <div
              role="tablist"
              aria-label="Account type"
              className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-sm font-semibold"
            >
              <button
                type="button"
                role="tab"
                aria-selected={portal === "researcher"}
                onClick={() => switchPortal("researcher")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                  portal === "researcher"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LogIn className="size-4" aria-hidden="true" /> Researcher
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={portal === "admin"}
                onClick={() => switchPortal("admin")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                  portal === "admin"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserCog className="size-4" aria-hidden="true" /> Administrator
              </button>
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {showEmail ? (
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.org"
                />
              </div>
            ) : null}
            {showPassword ? (
              <div className="space-y-1.5">
                <Label htmlFor="password">{mode === "reset" ? "New password" : "Password"}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signin" ? "Your password" : "At least 8 characters"}
                />
              </div>
            ) : null}
            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-brand text-brand-foreground hover:bg-brand-deep"
            >
              {busy ? (
                <Loader2 className="mr-1 size-4 animate-spin" aria-hidden="true" />
              ) : (
                <SubmitIcon className="mr-1 size-4" aria-hidden="true" />
              )}
              {submitLabel}
            </Button>
          </form>

          <div className="mt-4 space-y-1 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <p>
                <button
                  type="button"
                  className="font-semibold text-brand-deep underline underline-offset-4"
                  onClick={() => {
                    setMode("forgot");
                    setNotice(null);
                  }}
                >
                  Forgot password?
                </button>
              </p>
            ) : null}
            {portal === "researcher" && (mode === "signin" || mode === "signup") ? (
              <p>
                {mode === "signin" ? "New to the team? " : "Already have an account? "}
                <button
                  type="button"
                  className="font-semibold text-brand-deep underline underline-offset-4"
                  onClick={() => {
                    setMode(mode === "signin" ? "signup" : "signin");
                    setNotice(null);
                  }}
                >
                  {mode === "signin" ? "Create an account" : "Sign in instead"}
                </button>
              </p>
            ) : null}
            {mode === "forgot" ? (
              <p>
                <button
                  type="button"
                  className="font-semibold text-brand-deep underline underline-offset-4"
                  onClick={() => {
                    setMode("signin");
                    setNotice(null);
                  }}
                >
                  Back to sign in
                </button>
              </p>
            ) : null}
            {portal === "admin" && mode === "signin" ? (
              <p className="text-xs">Administrator accounts are created by the study lead.</p>
            ) : null}
          </div>

          {notice ? (
            <p
              role="status"
              className="mt-4 rounded-lg border border-brand/40 bg-brand-soft/50 px-4 py-3 text-sm leading-relaxed text-foreground/90"
            >
              {notice}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Survey participants don't need an account — the{" "}
        <Link to="/survey" className="font-semibold text-brand-deep underline underline-offset-4">
          public survey
        </Link>{" "}
        is anonymous.
      </p>
    </section>
  );
}
