import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PreInformationForm() {
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
        <h1 className="text-3xl font-bold text-foreground mb-8">Pre-Information Form</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            This Pre-Information Form is provided in accordance with consumer protection regulations. 
            Please read carefully before completing your purchase.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Seller Information</h2>
            <div className="bg-secondary/50 rounded-lg p-4 text-muted-foreground">
              <p><strong>Company Name:</strong> Utsuri AI Technologies</p>
              <p><strong>Address:</strong> [Company Address]</p>
              <p><strong>Email:</strong> contact@utsuri.ai</p>
              <p><strong>Phone:</strong> [Contact Number]</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Service Description</h2>
            <p className="text-muted-foreground">
              Utsuri provides AI-powered fashion photography services including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>AI model image generation</li>
              <li>Model customization (ethnicity, body type, hair, etc.)</li>
              <li>Background and pose selection</li>
              <li>Image download and commercial usage rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Pricing Information</h2>
            <p className="text-muted-foreground">
              All prices displayed on our website include applicable taxes. Subscription prices are:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Trial: Free (limited features)</li>
              <li>Starter: $9.99/month</li>
              <li>Pro: $39.99/month</li>
              <li>Creator: $49.99/month</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Payment Terms</h2>
            <p className="text-muted-foreground">
              Payment is processed immediately upon subscription. We accept major credit cards and 
              other payment methods as displayed during checkout. Your subscription will auto-renew 
              monthly until cancelled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Delivery of Service</h2>
            <p className="text-muted-foreground">
              Digital services are available immediately upon successful payment. Generated images 
              are delivered instantly and available for download. Images are stored for 24 hours 
              before automatic deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Right of Withdrawal</h2>
            <p className="text-muted-foreground">
              As a digital service that is immediately performed, the right of withdrawal may be 
              limited once you begin using the service. By proceeding with payment, you acknowledge 
              that you may lose your right of withdrawal upon immediate service delivery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Technical Requirements</h2>
            <p className="text-muted-foreground">
              To use our services, you need:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>A modern web browser (Chrome, Firefox, Safari, Edge)</li>
              <li>Stable internet connection</li>
              <li>Valid email address for account creation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Customer Support</h2>
            <p className="text-muted-foreground">
              For support inquiries, contact us at: 
              <a href="mailto:support@utsuri.ai" className="text-primary hover:underline ml-1">support@utsuri.ai</a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
