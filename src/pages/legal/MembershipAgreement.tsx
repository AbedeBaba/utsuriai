import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function MembershipAgreement() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground italic">Utsuri</span>
          </div>
          
          <div className="w-10" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Membership Agreement</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">Last updated: January 2025</p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Membership Overview</h2>
            <p className="text-muted-foreground">
              This Membership Agreement ("Agreement") governs your subscription to Utsuri's AI fashion 
              photography services. By subscribing, you agree to the terms outlined in this document.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Membership Plans</h2>
            <p className="text-muted-foreground">Utsuri offers the following membership tiers:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li><strong>Trial:</strong> Free tier with limited generations for testing</li>
              <li><strong>Starter:</strong> Entry-level plan with 100 monthly credits</li>
              <li><strong>Pro:</strong> Professional plan with 400 monthly credits and advanced features</li>
              <li><strong>Creator:</strong> Ultimate plan with 500 monthly credits and all features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Billing and Payment</h2>
            <p className="text-muted-foreground">
              Membership fees are charged monthly in advance. Payment is processed through our secure 
              payment provider. All fees are non-refundable unless otherwise stated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Credit System</h2>
            <p className="text-muted-foreground">
              Each plan includes a monthly credit allocation. Standard generations cost 1 credit, while 
              Pro quality generations cost 4 credits. Unused credits do not roll over to the next billing 
              period unless specified in your plan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Plan Upgrades and Downgrades</h2>
            <p className="text-muted-foreground">
              You may upgrade your plan at any time, with the new plan taking effect immediately. 
              Downgrades will take effect at the start of the next billing cycle. Credit balances 
              will be adjusted according to your new plan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Cancellation</h2>
            <p className="text-muted-foreground">
              You may cancel your membership at any time through your account settings. Cancellation 
              will take effect at the end of the current billing period. No partial refunds are provided.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Feature Access</h2>
            <p className="text-muted-foreground">
              Certain features are exclusive to specific plans. Access to premium features (backgrounds, 
              poses, face types, expressions, model saving) is determined by your subscription tier.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Member Obligations</h2>
            <p className="text-muted-foreground">As a member, you agree to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Use the service in compliance with all applicable laws</li>
              <li>Maintain accurate account information</li>
              <li>Not share your account credentials</li>
              <li>Report any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Modifications to Agreement</h2>
            <p className="text-muted-foreground">
              Utsuri reserves the right to modify this agreement with 30 days notice. Continued 
              membership after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Contact</h2>
            <p className="text-muted-foreground">
              For membership inquiries, contact us at: 
              <a href="mailto:membership@utsuri.ai" className="text-primary hover:underline ml-1">membership@utsuri.ai</a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
