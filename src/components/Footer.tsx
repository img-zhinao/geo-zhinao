import wechatQrcode from "@/assets/wechat-qrcode.png";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src={wechatQrcode} alt={t('footer.wechatAlt')} className="h-16 w-auto rounded" />
            <span className="text-lg font-bold">{t('footer.scanWechat')}</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6">
            <a href="#services" className="text-background/70 hover:text-background transition-colors">{t('nav.services')}</a>
            <a href="#cases" className="text-background/70 hover:text-background transition-colors">{t('nav.cases')}</a>
            <a href="#advantages" className="text-background/70 hover:text-background transition-colors">{t('nav.advantages')}</a>
            <a href="#contact" className="text-background/70 hover:text-background transition-colors">{t('nav.contact')}</a>
          </nav>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center text-background/60 text-sm space-y-2">
          <p>© {new Date().getFullYear()} {t('footer.copyright')}</p>
          <p>
            <a 
              href="https://beian.miit.gov.cn/#/Integrated/index" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-background transition-colors"
            >
              粤ICP备2023101390号
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
