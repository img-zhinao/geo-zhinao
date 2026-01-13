import Header from "@/components/Header";
import Hero from "@/components/Hero";
import QuickTry from "@/components/QuickTry";
import Services from "@/components/Services";
import ProductDemo from "@/components/ProductDemo";
import Cases from "@/components/Cases";
import Testimonials from "@/components/Testimonials";
import Advantages from "@/components/Advantages";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>智脑时代 - 全链路GEO服务 | AI搜索优化专家</title>
        <meta 
          name="description" 
          content="智脑时代提供全链路GEO服务，从诊断到迭代的品牌AI搜索增长方案。覆盖DeepSeek、豆包、Kimi等主流AI平台，助力品牌精准占据AI搜索优势位置。" 
        />
        <meta name="keywords" content="GEO,AI搜索优化,品牌优化,AI营销,智脑时代,DeepSeek,豆包,Kimi" />
        
        {/* GEO Optimization: Software Application Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "GEO Rank Tracker",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "CNY"
            },
            "description": "专业的 AI 搜索排名监测工具，支持 DeepSeek、豆包、Kimi 等主流模型的可见性份额 (SoM) 分析。",
            "featureList": [
              "AI 可见性评分 (AIVS)",
              "情感极性分析",
              "竞品份额对比"
            ],
            "author": {
              "@type": "Organization",
              "name": "智脑时代",
              "url": "https://sgeo.fun"
            }
          })}
        </script>
        
        {/* GEO Optimization: FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{
              "@type": "Question",
              "name": "如何提升品牌在 DeepSeek 中的排名？",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "提升 DeepSeek 排名的核心在于 GEO-16 支柱优化，包括增加结构化数据 (Schema)、引用权威数据源、以及优化内容的逻辑密度。使用 GEO 排名工具可以量化当前的差距。"
              }
            }]
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <QuickTry />
          <Services />
          <ProductDemo />
          <Cases />
          <Testimonials />
          <Advantages />
          <Contact />
        </main>
        <Footer />
        <FloatingCTA />
      </div>
    </>
  );
};

export default Index;
