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
            Last updated: February 10, 2026
          </p>

          <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-semibold text-foreground mb-1">Acceptance of Terms</h2>
              <p>
                By downloading, installing, or using the Decoded Faith Empire application ("App"), you agree to be bound by these Terms of Use. If you do not agree with these terms, please do not use the App.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Description of Service</h2>
              <p>
                Decoded Faith Empire provides daily Bible verses from the King James Version (KJV) along with plain-language motivational messages ("decoded messages"). The App is designed for personal, non-commercial use to encourage daily faith and spiritual growth.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Content</h2>
              <p>
                All Bible verses included in this App are from the King James Version, which is in the public domain. The decoded messages and motivational interpretations are original content created by Decoded Faith Empire and are protected by copyright. You may share individual verses and decoded messages for personal, non-commercial purposes.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">User Conduct</h2>
              <p>
                You agree to use the App only for lawful purposes and in a manner that does not infringe upon the rights of others. You may not reproduce, distribute, or create derivative works from the App's decoded message content without written permission from Decoded Faith Empire.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Newsletter Subscription</h2>
              <p>
                If you choose to subscribe to our daily verse newsletter, you consent to receiving daily emails containing Bible verses and decoded messages. You may unsubscribe at any time by contacting support@decodedfaithempire.org.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Intellectual Property</h2>
              <p>
                The Decoded Faith Empire name, logo, and all original decoded message content are the property of Decoded Faith Empire. The App's design, layout, and user interface are also proprietary. All rights not explicitly granted herein are reserved.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Disclaimer</h2>
              <p>
                The App is provided "as is" without warranties of any kind, either express or implied. Decoded Faith Empire does not guarantee uninterrupted or error-free operation of the App. The spiritual content is intended for encouragement and personal reflection and should not be considered a substitute for professional counseling or advice.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Limitation of Liability</h2>
              <p>
                In no event shall Decoded Faith Empire be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of the App.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Use at any time. Changes will be posted within the App. Your continued use of the App after such changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-foreground mb-1">Contact</h2>
              <p>
                For questions about these Terms of Use, please contact us at support@decodedfaithempire.org or visit decodedfaithempire.org.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
