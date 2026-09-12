import Link from "next/link";
import { BUSINESS } from "../data/business";
import styles from "./privacidade.module.css";

export const metadata = {
  title: "Privacidade | Moca Sushi",
  description: "Como os dados enviados em pedidos do Moca Sushi são utilizados.",
};

export default function PrivacyPage() {
  return <main className={styles.page}><article className={styles.article}>
    <Link className={styles.brand} href="/">moca<span>.</span></Link>
    <h1>Aviso de privacidade</h1>
    <p className={styles.lead}>Este aviso explica de forma simples quais dados são usados para receber, preparar, entregar e acompanhar pedidos feitos no cardápio digital.</p>
    <section><h2>Dados coletados</h2><p>Nome, telefone, itens do pedido, endereço, referência e localização do dispositivo usada para calcular a entrega. CPF ou CNPJ é solicitado apenas quando necessário. Dados técnicos mínimos também podem ser registrados para segurança e prevenção de pedidos duplicados.</p></section>
    <section><h2>Por que usamos esses dados</h2><p>Para registrar o pedido, permitir contato pelo WhatsApp, calcular e realizar a entrega, imprimir a comanda interna e manter o histórico operacional.</p></section>
    <section><h2>Compartilhamento</h2><p>As coordenadas são processadas momentaneamente pelo servidor e pelo serviço de rotas apenas para calcular a distância; o pedido armazena a distância calculada, não as coordenadas. Os demais dados ficam disponíveis somente para os serviços usados na operação e para a equipe autorizada do Moca. O sistema não vende informações pessoais.</p></section>
    <section><h2>Retenção e segurança</h2><p>Os registros devem ser mantidos somente pelo período necessário à operação e às obrigações aplicáveis. O acesso ao painel e ao agente de impressão é protegido por credenciais separadas.</p></section>
    <section><h2>Contato</h2><p>Para corrigir ou solicitar informações sobre seus dados, fale com o Moca pelo WhatsApp {BUSINESS.whatsappDisplay}.</p></section>
    <footer>Última atualização: setembro de 2026.</footer>
  </article></main>;
}
