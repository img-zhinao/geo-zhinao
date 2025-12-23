import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Cases from "@/components/Cases";
import Advantages from "@/components/Advantages";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
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
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <Services />
          <Cases />
          <Advantages />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
