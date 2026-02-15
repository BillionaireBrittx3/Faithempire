import { useState, useEffect, useCallback } from "react";
import { Heart, Share2, Download, Copy, X } from "lucide-react";
import { SiFacebook, SiX, SiWhatsapp, SiTelegram, SiPinterest, SiLinkedin, SiReddit, SiThreads, SiInstagram, SiTiktok, SiSnapchat } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isFavorite, toggleFavorite } from "@/lib/favorites";
import { generateShareImage } from "@/lib/share-image";
import type { Verse } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface VerseCardProps {
  verse: Verse;
  displayDate?: string;
  showFullCard?: boolean;
  onFavoriteChange?: () => void;
}

export function VerseCard({ verse, displayDate, showFullCard = true, onFavoriteChange }: VerseCardProps) {
  const [saved, setSaved] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSaved(isFavorite(verse.id));
  }, [verse.id]);

  const handleToggleFavorite = useCallback(() => {
    const nowSaved = toggleFavorite(verse);
    setSaved(nowSaved);
    toast({
      title: nowSaved ? "Verse Saved" : "Verse Removed",
      description: nowSaved
        ? "Added to your saved verses"
        : "Removed from your saved verses",
    });
    onFavoriteChange?.();
  }, [verse, toast, onFavoriteChange]);

  const getShareText = () => {
    return `"${verse.verseText}"\n\n— ${verse.reference}\n\nDECODED:\n${verse.decodedMessage}\n\ndecodedfaithempire.org`;
  };

  const getShareUrl = () => "https://decodedfaithempire.org";

  const handleNativeShare = useCallback(async () => {
    setGeneratingImage(true);
    try {
      const blob = await generateShareImage(verse);
      const file = new File([blob], `faith-empire-${verse.reference.replace(/\s+/g, "-")}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `Faith Empire - ${verse.reference}`,
          text: getShareText(),
          files: [file],
        });
        setShowShareMenu(false);
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: `Faith Empire - ${verse.reference}`,
          text: getShareText(),
          url: getShareUrl(),
        });
        setShowShareMenu(false);
        return;
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setGeneratingImage(false);
        return;
      }
    }
    setGeneratingImage(false);
    setShowShareMenu(true);
  }, [verse]);

  const handleDownloadImage = useCallback(async () => {
    setGeneratingImage(true);
    try {
      const blob = await generateShareImage(verse);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `faith-empire-${verse.reference.replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Image downloaded", description: "Save it and share on any platform" });
    } catch {
      toast({ title: "Error", description: "Could not generate image", variant: "destructive" });
    }
    setGeneratingImage(false);
  }, [verse, toast]);

  const handleCopyText = useCallback(async () => {
    await navigator.clipboard.writeText(getShareText());
    toast({ title: "Copied to clipboard", description: "Paste and share anywhere" });
    setShowShareMenu(false);
  }, [verse, toast]);

  const shareText = encodeURIComponent(getShareText());
  const shareUrl = encodeURIComponent(getShareUrl());
  const shareTitle = encodeURIComponent(`Faith Empire - ${verse.reference}`);

  const handleImageSharePlatform = useCallback(async (platformName: string) => {
    setGeneratingImage(true);
    try {
      const blob = await generateShareImage(verse);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `faith-empire-${verse.reference.replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Image saved!",
        description: `Open ${platformName} and share the downloaded image`,
      });
    } catch {
      toast({ title: "Error", description: "Could not generate image", variant: "destructive" });
    }
    setGeneratingImage(false);
  }, [verse, toast]);

  const socialLinks: { name: string; icon: any; url?: string; imageOnly?: boolean; color: string }[] = [
    { name: "WhatsApp", icon: SiWhatsapp, url: `https://wa.me/?text=${shareText}`, color: "#25D366" },
    { name: "Instagram", icon: SiInstagram, imageOnly: true, color: "#E4405F" },
    { name: "Facebook", icon: SiFacebook, url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`, color: "#1877F2" },
    { name: "X", icon: SiX, url: `https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`, color: "#ffffff" },
    { name: "TikTok", icon: SiTiktok, imageOnly: true, color: "#ffffff" },
    { name: "Threads", icon: SiThreads, url: `https://threads.net/intent/post?text=${shareText}`, color: "#ffffff" },
    { name: "Snapchat", icon: SiSnapchat, imageOnly: true, color: "#FFFC00" },
    { name: "Telegram", icon: SiTelegram, url: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`, color: "#26A5E4" },
    { name: "Pinterest", icon: SiPinterest, url: `https://pinterest.com/pin/create/button/?url=${shareUrl}&description=${shareText}`, color: "#E60023" },
    { name: "LinkedIn", icon: SiLinkedin, url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, color: "#0A66C2" },
    { name: "Reddit", icon: SiReddit, url: `https://reddit.com/submit?url=${shareUrl}&title=${shareTitle}`, color: "#FF4500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <div className="flex flex-col items-center px-4 pt-0 pb-3 text-center" data-testid={`verse-card-${verse.id}`}>
        {displayDate && (
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-primary" data-testid="text-verse-date">
            {displayDate}
          </p>
        )}

        <div className="mx-auto mb-4 h-px w-16 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <blockquote className="mx-auto max-w-md px-2">
          <p
            className="font-serif text-xl font-normal italic leading-relaxed text-foreground md:text-2xl"
            style={{ fontFamily: "'Lora', serif" }}
            data-testid="text-verse-text"
          >
            "{verse.verseText}"
          </p>
        </blockquote>

        <p
          className="mt-5 text-sm font-semibold tracking-widest text-primary"
          data-testid="text-verse-reference"
        >
          — {verse.reference} —
        </p>

        {showFullCard && (
          <>
            <div className="mx-auto my-8 flex w-full max-w-xs items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                Decoded
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
            </div>

            <p
              className="mx-auto max-w-md px-2 text-sm leading-relaxed text-muted-foreground md:text-base"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              data-testid="text-decoded-message"
            >
              {verse.decodedMessage}
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
                className={`gap-2 border-primary/30 ${saved ? "text-red-500" : "text-foreground"}`}
                data-testid="button-favorite"
              >
                <Heart className={`h-4 w-4 ${saved ? "fill-red-500" : ""}`} />
                {saved ? "Saved" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={handleNativeShare}
                className="gap-2 border-primary/30"
                disabled={generatingImage}
                data-testid="button-share"
              >
                <Share2 className="h-4 w-4" />
                {generatingImage ? "..." : "Share"}
              </Button>
            </div>

            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-6 w-full max-w-sm rounded-md border border-border bg-card p-4"
                  data-testid="share-menu"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground">Share to</h3>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowShareMenu(false)}
                      data-testid="button-close-share"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="mb-3 text-[10px] text-muted-foreground">
                    Tap a platform to share. For Instagram, TikTok & Snapchat, the image downloads first.
                  </p>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {socialLinks.map((social) =>
                      social.imageOnly ? (
                        <button
                          key={social.name}
                          onClick={() => handleImageSharePlatform(social.name)}
                          disabled={generatingImage}
                          className="flex flex-col items-center gap-1.5 rounded-md p-2 hover-elevate"
                          data-testid={`share-${social.name.toLowerCase()}`}
                        >
                          <social.icon className="h-6 w-6" style={{ color: social.color }} />
                          <span className="text-[10px] text-muted-foreground">{social.name}</span>
                        </button>
                      ) : (
                        <a
                          key={social.name}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-1.5 rounded-md p-2 hover-elevate"
                          data-testid={`share-${social.name.toLowerCase()}`}
                        >
                          <social.icon className="h-6 w-6" style={{ color: social.color }} />
                          <span className="text-[10px] text-muted-foreground">{social.name}</span>
                        </a>
                      )
                    )}
                  </div>

                  <div className="flex gap-2 border-t border-border pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 border-primary/30 text-xs"
                      onClick={handleDownloadImage}
                      disabled={generatingImage}
                      data-testid="button-download-image"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {generatingImage ? "..." : "Download Image"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 border-primary/30 text-xs"
                      onClick={handleCopyText}
                      data-testid="button-copy-text"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy Text
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}
