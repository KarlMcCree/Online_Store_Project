import { useState, useEffect } from "react";
import { X, Mail, Lock, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const AuthModal = () => {
  const { authModalOpen, authModalMode, closeAuthModal, login, signup, authReason, resetPassword } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(authModalMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => { 
    setMode(authModalMode);
    setResetSent(false); // Reset this when modal opens
  }, [authModalMode, authModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast({ title: "Welcome back!", description: "You're now signed in." });
      } else if (mode === "signup") {
        await signup(name || email.split("@")[0], email, password);
        toast({ title: "Account created", description: "Welcome to Online Dynamics & BSB!" });
      } else if (mode === "forgot") {
        await resetPassword(email);
        setResetSent(true); // Show success message
      }
      
      if (mode !== "forgot") {
        setName(""); setEmail(""); setPassword("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-foreground/60 backdrop-blur-sm" onClick={closeAuthModal} />
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-background rounded-xl border border-border shadow-2xl max-w-md w-full pointer-events-auto max-h-[90vh] overflow-y-auto">
          <div className="relative p-8">
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 text-foreground hover:text-secondary transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              {/* Company Logo */}
              <div className="flex justify-center mb-4">
                <img
                  src="/logo.png"
                  alt="Travel Wise with Online Dynamics & BSB International"
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                {mode === "login" && "Welcome back"}
                {mode === "signup" && "Create your account"}
                {mode === "forgot" && "Reset your password"}
              </h2>
              <p className="text-sm text-muted-foreground font-body">
                {authReason ?? (
                  mode === "login" ? "Sign in to access your dashboard." : 
                  mode === "signup" ? "Join thousands shaping their global future." : 
                  "Enter your email to receive a reset link."
                )}
              </p>
            </div>

            {/*  Show success message if reset email was sent */}
            {mode === "forgot" && resetSent ? (
              <div className="text-center py-4">
                <p className="text-sm text-foreground mb-6">
                  We've sent a password reset link to <strong>{email}</strong>.
                  Please check your email (and spam folder).
                </p>
                <button 
                  onClick={() => { setMode("login"); setResetSent(false); }} 
                  className="w-full bg-secondary text-secondary-foreground font-semibold py-3.5 rounded-full hover:bg-secondary/90 transition-colors font-body"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name input (Only for signup) */}
                {mode === "signup" && (
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                )}

                {/* Email input (For all modes) */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder={mode === "signup" ? "johndoe@gmail.com" : "youremail@example.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>

                {mode === "signup" && (
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    Use a valid email — you'll receive order confirmations here.
                  </p>
                )}

                {/* Password input (Hidden for forgot mode) */}
                {mode !== "forgot" && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary text-secondary-foreground font-semibold py-3.5 rounded-full hover:bg-secondary/90 transition-colors font-body disabled:opacity-60"
                >
                  {loading ? "Please wait…" : 
                   mode === "login" ? "Sign In" : 
                   mode === "signup" ? "Create Account" : "Send Reset Link"}
                </button>
              </form>
            )}

            {/* Footer Links */}
            <div className="mt-6 text-center text-sm text-muted-foreground font-body">
              {mode === "login" && (
                <div className="flex flex-col gap-3">
                  <div>
                    Don't have an account?{" "}
                    <button onClick={() => setMode("signup")} className="text-secondary font-semibold hover:underline">
                      Sign up
                    </button>
                  </div>
                  <button 
                    onClick={() => setMode("forgot")} 
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {mode === "signup" && (
                <>Already have an account?{" "}
                  <button onClick={() => setMode("login")} className="text-secondary font-semibold hover:underline">
                    Sign in
                  </button>
                </>
              )}

              {mode === "forgot" && !resetSent && (
                <>Remembered it?{" "}
                  <button onClick={() => setMode("login")} className="text-secondary font-semibold hover:underline">
                    Back to login
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;