import wechatQrcode from "@/assets/wechat-qrcode.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src={wechatQrcode} alt="微信二维码" className="h-16 w-auto rounded" />
            <span className="text-lg font-bold">扫码添加微信</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6">
            <a href="#services" className="text-background/70 hover:text-background transition-colors">服务流程</a>
            <a href="#cases" className="text-background/70 hover:text-background transition-colors">行业案例</a>
            <a href="#advantages" className="text-background/70 hover:text-background transition-colors">核心优势</a>
            <a href="#contact" className="text-background/70 hover:text-background transition-colors">联系我们</a>
          </nav>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center text-background/60 text-sm">
          <p>© {new Date().getFullYear()} 深圳智脑时代科技有限公司 版权所有</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
