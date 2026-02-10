import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="pb-20">
      <div className="px-4 pt-5 pb-3 flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setLocation("/about")}
          data-testid="button-back-privacy"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-serif text-2xl font-bold text-foreground" data-testid="text-privacy-title">
          Privacy Policy
        </h1>
      </div>

      <div className="flex flex-col gap-4 px-4 py-2">
        <Card className="p-5">
          <p className="text-xs text-muted-foreground mb-4">
            Last updated: February 10, 2026
          </p>

          <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-semibold text-foreground mb-1">Information We Collect</h2>
              <p>
                Decoded Faith Empire collects minimal information to provide you with daily Bible verses and motivational messages. The only personal information we collect is your email address, and only if you voluntarily subscribe to our daily verse newsletter. We do not collect names, locations, device identifiers, or any other personal data.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Local Storage</h2>
              <p>
                When you save a verse as a favorite, it is stored locally on your device using your browser's localStorage. This data never leaves your device and is not transmitted to our servers. You can clear your favorites at any time by removing them within the app.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">How We Use Your Information</h2>
              <p>
                If you subscribe to our newsletter, your email address is used solely to deliver daily Bible verse messages. We do not use your email for marketing, advertising, or any other purpose beyond the newsletter service you opted into.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Data Sharing</h2>
              <p>
                We do not sell, trade, rent, or share your personal information with third parties. Your email address is stored securely in our database and is used only for delivering the daily verse newsletter.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Data Retention</h2>
              <p>
                We retain your email address for as long as your subscription is active. If you unsubscribe, your information will be removed from our active mailing list.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Your Rights</h2>
              <p>
                You have the right to unsubscribe from our newsletter at any time. You may also request deletion of your email from our records by contacting us at support@decodedfaithempire.org. Favorite verses stored on your device can be removed directly within the app.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Children's Privacy</h2>
              <p>
                Decoded Faith Empire is suitable for all ages. We do not knowingly collect personal information from children under 13. If a parent or guardian becomes aware that their child has provided us with personal information without consent, please contact us at support@decodedfaithempire.org.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated revision date. Your continued use of the app after changes are posted constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at support@decodedfaithempire.org or visit decodedfaithempire.org.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
