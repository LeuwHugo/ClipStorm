import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">For Creators</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/create-campaign" className="hover:text-foreground">Create Campaign</Link></li>
              <li><Link href="/campaigns" className="hover:text-foreground">My Campaigns</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">For Clippers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/submit-clips" className="hover:text-foreground">Submit Clips</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">My Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 ClipWave. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}