import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, Mail, Globe, Shield, FileText, ChevronRight, UserMinus, Crown, Archive, Heart } from "lucide-react";
import { SiTiktok, SiInstagram, SiSpotify } from "react-icons/si";
import { Link } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import logoPath from "@assets/Copy_of_EPRODUCTS_EMPIRE_PODCAST_(98)_1770693543975.png";

export default function AboutPage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [unsubEmail, setUnsubEmail] = useState("");
  const [unsubscribing, setUnsubscribing] = useState(false);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unsubEmail) return;
    setUnsubscribing(true);
    try {
      await apiRequest("POST", "/api/unsubscribe", { email: unsubEmail });
      toast({
        title: "Unsubscribed",
        description: "Your email has been removed from our records",
      });
      setUnsubEmail("");
    } catch (err: any) {
      toast({
        title: "Couldn't unsubscribe",
        description: err.message?.includes("404")
          ? "Email not found in our records"
          : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setUnsubscribing(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      await apiRequest("POST", "/api/subscribe", { email });
      toast({
        title: "Subscribed",
        description: "You'll receive daily verses in your inbox",
      });
      setEmail("");
    } catch (err: any) {
      toast({
        title: "Couldn't subscribe",
        description: err.message?.includes("409")
          ? "This email is already subscribed"
          : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-serif text-2xl font-bold text-foreground" data-testid="text-about-title">
          About
        </h1>
      </div>

      <div className="flex flex-col gap-4 px-4 py-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-5">
            <div className="flex flex-col items-center gap-3">
              <img
                src={logoPath}
                alt="Decoded Faith Empire"
                className="h-36 w-auto object-contain"
                data-testid="img-about-logo"
              />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Understanding the Bible in Plain Language
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground" data-testid="text-mission">
              Decoded Faith Empire is your daily faith reset. Each day you'll receive a Bible verse and a motivational message explained in a way that's clear, relatable, and easy to apply to real life.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Get your copy of <span className="font-semibold text-foreground">Breaking Down the Bible (KJV)</span> at{" "}
              <a
                href="https://decodedfaithempire.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
                data-testid="link-book"
              >
                decodedfaithempire.org
              </a>
              , rewritten sentence-by-sentence into today's language so scripture finally makes sense.
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <div className="flex flex-col gap-1">
              <Link href="/favorites">
                <button
                  className="flex w-full items-center gap-3 rounded-md p-2 text-sm text-foreground hover-elevate"
                  data-testid="link-saved"
                >
                  <Heart className="h-4 w-4 text-primary" />
                  <span>Saved Verses & Highlights</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </button>
              </Link>
              <Link href="/archive">
                <button
                  className="flex w-full items-center gap-3 rounded-md p-2 text-sm text-foreground hover-elevate"
                  data-testid="link-archive"
                >
                  <Archive className="h-4 w-4 text-primary" />
                  <span>Verse Archive</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </button>
              </Link>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="relative overflow-visible border-primary/30 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  More Features on the Way
                </h3>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              We're working on new ways to deepen your daily faith experience. Stay tuned for updates.
            </p>
            <p className="text-[10px] text-muted-foreground/60">
              Future features may include optional premium content. Details and pricing will be announced when available.
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Subscribe for Daily Verses
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Get today's decoded verse delivered to your inbox every morning
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
              <Button
                type="submit"
                disabled={subscribing}
                data-testid="button-subscribe"
              >
                <Mail className="mr-1.5 h-4 w-4" />
                {subscribing ? "..." : "Join"}
              </Button>
            </form>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Unsubscribe & Delete Data
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Enter your email to unsubscribe and permanently remove your data from our records
            </p>
            <form onSubmit={handleUnsubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={unsubEmail}
                onChange={(e) => setUnsubEmail(e.target.value)}
                required
                data-testid="input-unsubscribe-email"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={unsubscribing}
                data-testid="button-unsubscribe"
              >
                <UserMinus className="mr-1.5 h-4 w-4" />
                {unsubscribing ? "..." : "Remove"}
              </Button>
            </form>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Connect
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href="https://decodedfaithempire.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-md p-2 text-sm text-foreground hover-elevate"
                data-testid="link-website"
              >
                <Globe className="h-4 w-4 text-primary" />
                <span>decodedfaithempire.org</span>
                <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
              </a>
              <a
                href="https://podcasters.spotify.com/pod/show/brittany-johnson4"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-md p-2 text-sm text-foreground hover-elevate"
                data-testid="link-podcast"
              >
                <SiSpotify className="h-4 w-4 text-primary" />
                <span>Podcast</span>
                <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
              </a>
              <a
                href="https://www.tiktok.com/@decodedfaithempire"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-md p-2 text-sm text-foreground hover-elevate"
                data-testid="link-tiktok"
              >
                <SiTiktok className="h-4 w-4 text-primary" />
                <span>TikTok</span>
                <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
              </a>
              <a
                href="https://www.instagram.com/decodedfaithempire"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-md p-2 text-sm text-foreground hover-elevate"
                data-testid="link-instagram"
              >
                <SiInstagram className="h-4 w-4 text-primary" />
                <span>Instagram</span>
                <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
              </a>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Settings
            </h3>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Label htmlFor="dark-mode" className="text-sm text-foreground">
                  Dark Mode
                </Label>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                data-testid="switch-dark-mode"
              />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Legal
            </h3>
            <div className="flex flex-col gap-1">
              <Link href="/privacy">
                <button
                  className="flex w-full items-center gap-3 rounded-md p-2 text-sm text-foreground hover-elevate"
                  data-testid="link-privacy-policy"
                >
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Privacy Policy</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </button>
              </Link>
              <Link href="/terms">
                <button
                  className="flex w-full items-center gap-3 rounded-md p-2 text-sm text-foreground hover-elevate"
                  data-testid="link-terms"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Terms of Use</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </button>
              </Link>
            </div>
          </Card>
        </motion.div>

        <p className="mt-2 text-center text-[10px] text-muted-foreground pb-4">
          Faith Empire v1.0 &middot; decodedfaithempire.org
        </p>
      </div>
    </div>
  );
}
