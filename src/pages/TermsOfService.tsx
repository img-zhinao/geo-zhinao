import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  const { t, i18n } = useTranslation();

  return (
    <>
      <Helmet>
        <title>
          {t("legal.terms.title")} - {t("contact.company.name")}
        </title>
        <meta name="description" content={t("legal.terms.metaDescription")} />
        <html lang={i18n.language} />
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

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">{t("legal.terms.title")}</h1>

          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-sm text-muted-foreground mb-8">{t("legal.terms.lastUpdated")}: 2026-01-31</p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t("legal.terms.sections.acceptance.title")}
              </h2>
              <p>{t("legal.terms.sections.acceptance.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t("legal.terms.sections.services.title")}</h2>
              <p>{t("legal.terms.sections.services.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t("legal.terms.sections.account.title")}</h2>
              <p>{t("legal.terms.sections.account.content")}</p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>{t("legal.terms.sections.account.items.accurate")}</li>
                <li>{t("legal.terms.sections.account.items.security")}</li>
                <li>{t("legal.terms.sections.account.items.notify")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t("legal.terms.sections.usage.title")}</h2>
              <p>{t("legal.terms.sections.usage.content")}</p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>{t("legal.terms.sections.usage.items.lawful")}</li>
                <li>{t("legal.terms.sections.usage.items.noHarm")}</li>
                <li>{t("legal.terms.sections.usage.items.noInfringe")}</li>
                <li>{t("legal.terms.sections.usage.items.noMisuse")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t("legal.terms.sections.ip.title")}</h2>
              <p>{t("legal.terms.sections.ip.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t("legal.terms.sections.payment.title")}</h2>
              <p>{t("legal.terms.sections.payment.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t("legal.terms.sections.limitation.title")}
              </h2>
              <p>{t("legal.terms.sections.limitation.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t("legal.terms.sections.termination.title")}
              </h2>
              <p>{t("legal.terms.sections.termination.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t("legal.terms.sections.changes.title")}</h2>
              <p>{t("legal.terms.sections.changes.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t("legal.terms.sections.contact.title")}</h2>
              <p>{t("legal.terms.sections.contact.content")}</p>
              <p className="mt-4">{t("contact.info.email")}: 93510890@qq.com</p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default TermsOfService;
