import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function DistanceSalesAgreement() {
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
        <h1 className="text-3xl font-bold text-foreground mb-8">Distance Sales Agreement</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">Last updated: January 2025</p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Parties</h2>
            <p className="text-muted-foreground">
              This Distance Sales Agreement ("Agreement") is entered into between:
            </p>
            <div className="bg-secondary/50 rounded-lg p-4 text-muted-foreground mt-4">
              <p><strong>Seller:</strong> Utsuri AI Technologies</p>
              <p><strong>Buyer:</strong> The individual or entity purchasing the subscription</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Subject of the Agreement</h2>
            <p className="text-muted-foreground">
              This agreement governs the sale of digital subscription services for AI-powered 
              fashion photography through the Utsuri platform. The service is provided entirely 
              online without physical delivery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Service Details</h2>
            <p className="text-muted-foreground">The purchased service includes:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Access to AI model generation features</li>
              <li>Monthly credit allocation based on selected plan</li>
              <li>Image download capabilities</li>
              <li>Commercial usage rights for generated images</li>
              <li>Customer support access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Price and Payment</h2>
            <p className="text-muted-foreground">
              The price of the service is as displayed on the pricing page at the time of purchase. 
              All prices include applicable taxes. Payment is processed through secure third-party 
              payment processors. Subscriptions auto-renew monthly unless cancelled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Delivery</h2>
            <p className="text-muted-foreground">
              As a digital service, delivery is immediate upon successful payment. Access to the 
              platform and all features included in your plan becomes available instantly. A 
              confirmation email will be sent to your registered email address.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Right of Withdrawal</h2>
            <p className="text-muted-foreground">
              For digital services that begin immediately upon purchase, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>The service performance begins immediately after purchase confirmation</li>
              <li>You expressly consent to immediate service delivery</li>
              <li>You acknowledge that you lose the right of withdrawal once the service begins</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Buyer Obligations</h2>
            <p className="text-muted-foreground">The buyer agrees to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Provide accurate payment and account information</li>
              <li>Use the service in accordance with the Terms of Use</li>
              <li>Not share account credentials with third parties</li>
              <li>Comply with all applicable laws when using the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Seller Obligations</h2>
            <p className="text-muted-foreground">The seller agrees to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Provide the service as described</li>
              <li>Maintain platform availability (subject to maintenance periods)</li>
              <li>Process payments securely</li>
              <li>Provide customer support for service-related issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Dispute Resolution</h2>
            <p className="text-muted-foreground">
              Any disputes arising from this agreement shall first be attempted to be resolved 
              through direct communication. If unresolved, disputes shall be subject to the 
              jurisdiction of the courts in the seller's registered location.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Agreement Acceptance</h2>
            <p className="text-muted-foreground">
              By completing the purchase, you confirm that you have read, understood, and agree 
              to all terms of this Distance Sales Agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">11. Contact</h2>
            <p className="text-muted-foreground">
              For questions about this agreement, contact us at: 
              <a href="mailto:legal@utsuri.ai" className="text-primary hover:underline ml-1">legal@utsuri.ai</a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
