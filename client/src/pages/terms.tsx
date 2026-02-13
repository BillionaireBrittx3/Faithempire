import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function TermsPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="pb-20">
      <div className="px-4 pt-5 pb-3 flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setLocation("/about")}
          data-testid="button-back-terms"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-serif text-2xl font-bold text-foreground" data-testid="text-terms-title">
          Terms of Use
        </h1>
      </div>

      <div className="flex flex-col gap-4 px-4 py-2">
        <Card className="p-5">
          <p className="text-xs text-muted-foreground mb-4">
            Last updated: February 13, 2026
          </p>

          <div className="flex flex-col gap-5 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-semibold text-foreground mb-1">Acceptance of Terms</h2>
              <p>
                By downloading, installing, or using the Decoded Faith Empire application ("App"), you agree to be bound by these Terms of Use. If you do not agree with these terms, please do not use the App.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Description of Service</h2>
              <p>
                Decoded Faith Empire provides daily Bible verses from the King James Version (KJV) along with plain-language motivational messages ("decoded messages"). The App is designed for personal, non-commercial use to encourage daily faith and spiritual growth. The App does not require an account or login. Certain features may require an active subscription.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">No Account Required</h2>
              <p>
                The Decoded Faith Empire App is fully functional without creating an account or providing any personal information. All features, including viewing daily verses, browsing the archive, and saving favorites, are available without signing up. The optional email newsletter subscription is the only feature that requires providing an email address.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Content and Copyright</h2>
              <p>
                All Bible verses included in this App are from the King James Version (KJV), which is in the public domain and freely available for use. The decoded messages and motivational interpretations are original content created by Decoded Faith Empire and are protected by copyright. You may share individual verses and decoded messages for personal, non-commercial purposes with proper attribution.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">User Conduct</h2>
              <p>
                You agree to use the App only for lawful purposes and in a manner that does not infringe upon the rights of others. You may not reproduce, distribute, modify, or create derivative works from the App's decoded message content without written permission from Decoded Faith Empire.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Newsletter Subscription</h2>
              <p>
                If you choose to subscribe to our daily verse newsletter, you consent to receiving daily emails containing Bible verses and decoded messages. This subscription is entirely optional and does not affect App functionality. You may unsubscribe at any time by contacting support@decodedfaithempire.org or using the unsubscribe feature in the App. Upon unsubscribing, your email address will be removed from our records.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Subscriptions and In-App Purchases</h2>
              <p className="mb-2">
                The App may offer optional auto-renewing subscription plans ("Premium Subscription") that unlock additional content and features. The current subscription price is $9.99 USD per month, though pricing may vary by region and is subject to change.
              </p>
              <p className="mb-2">
                <span className="text-foreground font-medium">Payment:</span> All payments are processed through Apple's In-App Purchase system. Payment will be charged to your Apple ID account at confirmation of purchase.
              </p>
              <p className="mb-2">
                <span className="text-foreground font-medium">Auto-Renewal:</span> Your subscription will automatically renew at the end of each billing period (monthly) unless you cancel at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period at the same rate.
              </p>
              <p className="mb-2">
                <span className="text-foreground font-medium">Managing and Cancelling:</span> You can manage or cancel your subscription at any time through your Apple ID Account Settings (Settings &gt; Apple ID &gt; Subscriptions). Cancellation takes effect at the end of the current billing period — you will retain access to premium features until that date. No refunds are provided for partial billing periods.
              </p>
              <p className="mb-2">
                <span className="text-foreground font-medium">Free Trial:</span> If a free trial is offered, any unused portion of the free trial period will be forfeited when you purchase a subscription. You will not be charged during the free trial period.
              </p>
              <p className="mb-2">
                <span className="text-foreground font-medium">Restore Purchases:</span> If you reinstall the App or switch devices, you can restore your active subscription by using the "Restore Purchases" feature within the App.
              </p>
              <p>
                <span className="text-foreground font-medium">Price Changes:</span> We reserve the right to change subscription pricing. You will be notified in advance of any price changes, and the new price will apply at the start of your next billing period after the change.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Intellectual Property</h2>
              <p>
                The Decoded Faith Empire name, logo, decoded message content, and App design are the property of Decoded Faith Empire. All rights not explicitly granted in these terms are reserved. The King James Version Bible text is in the public domain.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Disclaimer</h2>
              <p>
                The App is provided "as is" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. Decoded Faith Empire does not guarantee uninterrupted or error-free operation of the App. The spiritual content is intended for encouragement and personal reflection and should not be considered a substitute for professional counseling, medical, or legal advice.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, in no event shall Decoded Faith Empire or its owners, employees, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with the use of, or inability to use, the App.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Age Restrictions</h2>
              <p>
                The Decoded Faith Empire App is suitable for users of all ages. App content consists solely of Bible verses (public domain) and faith-based motivational messages. The App does not contain objectionable content, violence, gambling, or mature themes. The optional email subscription requires a valid email address and the ability to provide consent.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Use at any time. Changes will be reflected within the App with an updated revision date. Your continued use of the App after such changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Governing Law</h2>
              <p>
                These Terms of Use shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Contact</h2>
              <p>
                For questions about these Terms of Use, please contact us at:
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
