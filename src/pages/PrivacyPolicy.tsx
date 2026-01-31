import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === "zh-CN";

  return (
    <>
      <Helmet>
        <title>
          {t("legal.privacy.title")} - {t("contact.company.name")}
        </title>
        <meta name="description" content={t("legal.privacy.metaDescription")} />
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

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">{t("legal.privacy.title")}</h1>

          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-sm text-muted-foreground mb-8">{t("legal.privacy.lastUpdated")}: 2026-01-31</p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t("legal.privacy.sections.intro.title")}</h2>
              <p>{t("legal.privacy.sections.intro.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t("legal.privacy.sections.collection.title")}
              </h2>
              <p>{t("legal.privacy.sections.collection.content")}</p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>{t("legal.privacy.sections.collection.items.name")}</li>
                <li>{t("legal.privacy.sections.collection.items.contact")}</li>
                <li>{t("legal.privacy.sections.collection.items.company")}</li>
                <li>{t("legal.privacy.sections.collection.items.usage")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t("legal.privacy.sections.usage.title")}</h2>
              <p>{t("legal.privacy.sections.usage.content")}</p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>{t("legal.privacy.sections.usage.items.service")}</li>
                <li>{t("legal.privacy.sections.usage.items.improve")}</li>
                <li>{t("legal.privacy.sections.usage.items.communicate")}</li>
                <li>{t("legal.privacy.sections.usage.items.legal")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t("legal.privacy.sections.protection.title")}
              </h2>
              <p>{t("legal.privacy.sections.protection.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t("legal.privacy.sections.sharing.title")}
              </h2>
              <p>{t("legal.privacy.sections.sharing.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t("legal.privacy.sections.rights.title")}</h2>
              <p>{t("legal.privacy.sections.rights.content")}</p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>{t("legal.privacy.sections.rights.items.access")}</li>
                <li>{t("legal.privacy.sections.rights.items.correct")}</li>
                <li>{t("legal.privacy.sections.rights.items.delete")}</li>
                <li>{t("legal.privacy.sections.rights.items.withdraw")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t("legal.privacy.sections.contact.title")}
              </h2>
              <p>{t("legal.privacy.sections.contact.content")}</p>
              <p className="mt-4">{t("contact.info.email")}: 93510890@qq.com</p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;
