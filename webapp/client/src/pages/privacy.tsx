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
            Last updated: February 13, 2026
          </p>

          <div className="flex flex-col gap-5 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-semibold text-foreground mb-1">Overview</h2>
              <p>
                Decoded Faith Empire ("we," "us," or "our") respects your privacy. This Privacy Policy explains what data we collect, how we collect it, how we use it, and your rights regarding that data. By using the Decoded Faith Empire application ("App"), you agree to the practices described in this policy.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Data We Collect</h2>
              <p className="mb-2">We collect the following data, and only when you voluntarily provide it:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="text-foreground font-medium">Email address</span> — Collected only if you choose to subscribe to our daily verse newsletter. This is entirely optional. The App is fully functional without subscribing.</li>
              </ul>
              <p className="mt-2">
                We do <span className="text-foreground font-medium">not</span> collect: names, phone numbers, physical addresses, device identifiers, IP addresses, location data, usage analytics, health data, contacts, photos, or any other personal information.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">How We Collect Data</h2>
              <p>
                Data is collected directly from you through the in-app email subscription form. We do not collect data from third-party sources, device sensors, or background processes. We do not use any third-party analytics, tracking, or advertising SDKs.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">How We Use Your Data</h2>
              <p>Your email address is used for one purpose only: to deliver the daily Bible verse and decoded message newsletter to your inbox. We do not use your data for advertising, marketing, profiling, analytics, or any other purpose.</p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Local Device Storage</h2>
              <p>
                When you save a verse as a favorite, it is stored locally on your device using browser localStorage. This data never leaves your device and is never transmitted to our servers. You can remove individual favorites within the App or clear all data by clearing your browser/app data.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Subscriptions and Payments</h2>
              <p className="mb-2">
                The App may offer optional premium subscription plans that provide access to additional content and features. Subscriptions are processed entirely through Apple's In-App Purchase system. We do not collect, store, or have access to your credit card number, bank account details, or any payment credentials.
              </p>
              <p className="mb-2">
                Apple handles all payment processing and may collect data in accordance with their own privacy policy. We receive only a confirmation of your subscription status (active, expired, or cancelled) and your anonymous transaction identifier from Apple — no financial details.
              </p>
              <p>
                For information on how Apple handles your payment data, please refer to Apple's Privacy Policy at <span className="text-foreground">apple.com/legal/privacy</span>.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Third-Party Data Sharing</h2>
              <p>
                We do not sell, trade, rent, license, or share your personal information with any third parties. Your email address is stored in our secure database and is never shared with advertisers, data brokers, analytics providers, or any other external entity. Payment processing is handled exclusively by Apple through their In-App Purchase system — we never receive or store your financial information.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Data Retention and Deletion</h2>
              <p>
                Your email address is retained for as long as your newsletter subscription is active. You may delete your data at any time using the "Unsubscribe & Delete Data" feature in the App's About section, which immediately and permanently removes your email from our database. You may also contact us at support@decodedfaithempire.org and we will remove your data within 30 days.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Consent and Withdrawal</h2>
              <p>
                By subscribing to our newsletter, you consent to the collection and use of your email address as described in this policy. You may withdraw your consent and unsubscribe at any time using the "Unsubscribe & Delete Data" feature in the App's About section, or by contacting us at support@decodedfaithempire.org. After unsubscribing, you will no longer receive emails and your data will be permanently removed from our records.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Children's Privacy</h2>
              <p>
                The Decoded Faith Empire App is suitable for users of all ages. The App's content consists solely of Bible verses and motivational messages. We do not knowingly collect personal information from children under 13. The newsletter subscription is optional and intended for users who can provide valid consent. If a parent or guardian becomes aware that their child has submitted personal information without consent, please contact us at support@decodedfaithempire.org and we will promptly delete the information.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Security</h2>
              <p>
                We use industry-standard security measures to protect your data. However, no method of electronic storage or transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Your Rights</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access: You may request to know what data we hold about you.</li>
                <li>Deletion: You may request permanent deletion of your data.</li>
                <li>Withdrawal of Consent: You may unsubscribe from the newsletter at any time.</li>
                <li>Portability: You may request a copy of your data in a standard format.</li>
              </ul>
              <p className="mt-2">To exercise any of these rights, contact us at support@decodedfaithempire.org.</p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated revision date. Continued use of the App after changes are posted constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Contact Us</h2>
              <p>
                For questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us at:
              </p>
              <p className="mt-1 text-foreground">
                Decoded Faith Empire<br />
                Email: support@decodedfaithempire.org<br />
                Website: decodedfaithempire.org
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
