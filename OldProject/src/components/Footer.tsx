import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "About",
      links: [
        { name: "How it works", href: "/how-it-works" },
        { name: "Our Story", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
      ],
    },
    {
      title: "Product",
      links: [
        { name: "Browse Listings", href: "/search" },
        { name: "Post Listing", href: "/post" },
        { name: "Seller Tools", href: "/seller-tools" },
        { name: "API", href: "/api" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Pricing", href: "/pricing" },
        { name: "Blog", href: "/blog" },
        { name: "Community", href: "/community" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "GDPR", href: "/gdpr" },
      ],
    },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold font-heading">BizMarket</span>
            </Link>
            <p className="text-sm text-primary-foreground/80 mb-4">
              The trusted B2B marketplace for industrial equipment, machinery, and professional services.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/60">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Secure & Verified</span>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h3 className="font-semibold font-heading mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-primary-foreground/60 mb-4 md:mb-0">
            © {currentYear} BizMarket. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-primary-foreground/60">
            <span>🇪🇺 EU Compliant</span>
            <span>🔒 SSL Secured</span>
            <span>✓ ISO 27001</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;