import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, Home, FileText, Shield, Map, Users, Briefcase, Star, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Sitemap = () => {
  const { t, i18n } = useTranslation();

  const siteStructure = [
    {
      title: t("sitemap.sections.main"),
      links: [
        { name: t("sitemap.pages.home"), path: "/", icon: Home },
        { name: t("nav.services"), path: "/#services", icon: Briefcase },
        { name: t("nav.cases"), path: "/#cases", icon: Star },
        { name: t("nav.advantages"), path: "/#advantages", icon: Users },
        { name: t("nav.contact"), path: "/#contact", icon: Mail },
      ]
    },
    {
      title: t("sitemap.sections.legal"),
      links: [
        { name: t("footer.privacy"), path: "/privacy", icon: Shield },
        { name: t("footer.terms"), path: "/terms", icon: FileText },
        { name: t("footer.sitemap"), path: "/sitemap", icon: Map },
      ]
    },
    {
      title: t("sitemap.sections.account"),
      links: [
        { name: t("nav.login"), path: "/login", icon: Users },
        { name: t("nav.dashboard"), path: "/dashboard", icon: Briefcase },
      ]
    }
  ];

  // Schema.org structured data for SiteNavigationElement
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": siteStructure.flatMap((section, sectionIndex) =>
      section.links.map((link, linkIndex) => ({
        "@type": "SiteNavigationElement",
        "position": sectionIndex * 10 + linkIndex + 1,
        "name": link.name,
        "url": `https://geo-zhinao.lovable.app${link.path}`
      }))
    )
  };

  return (
    <>
      <Helmet>
        <title>{t("sitemap.title")} - {t("contact.company.name")}</title>
        <meta name="description" content={t("sitemap.metaDescription")} />
        <html lang={i18n.language} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <Header />
      
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("legal.backToHome")}
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("sitemap.title")}
          </h1>
          
          <p className="text-muted-foreground mb-12">
            {t("sitemap.description")}
          </p>

          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {siteStructure.map((section, index) => (
              <nav key={index} aria-label={section.title}>
                <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        to={link.path}
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <link.icon className="h-4 w-4" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="mt-16 p-6 bg-muted/50 rounded-lg">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {t("sitemap.xmlSitemap.title")}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t("sitemap.xmlSitemap.description")}
            </p>
            <a 
              href="/sitemap.xml" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              /sitemap.xml
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Sitemap;
