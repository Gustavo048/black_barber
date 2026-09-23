import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Layout do "site publico" (route group sem efeito na URL). Navbar e Footer
 * ficam aqui, nao no layout raiz, para que a area /admin nao herde o chrome
 * do site (o painel administrativo tem sua propria interface, sem menu de
 * marketing nem rodape com mapa/redes sociais).
 */
export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
