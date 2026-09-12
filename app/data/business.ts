// Centralize aqui os dados oficiais. Assim, nenhuma tela precisa ser reconstruída
// quando telefone, endereço, horários ou links forem atualizados.
export const BUSINESS = {
  name: "Moca Sushi",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "558388461632",
  whatsappDisplay: "+55 83 8846-1632",
  instagramHandle: "@moca.restaurante",
  instagramUrl: "https://www.instagram.com/moca.restaurante/",
  address: "R. Emílio de Araújo Chaves, 265 - Altiplano Cabo Branco, João Pessoa - PB, 58046-150",
  lunchHours: "Todos os dias, das 11h às 15h",
  sushiHours: "Terça a domingo, das 18h às 22h",
  payments: "Pix, crédito, débito e dinheiro",
  pickup: "Retirada no estabelecimento: confirmar disponibilidade",
  deliveryRatePerKm: 1,
  location: {
    latitude: -7.1352309,
    longitude: -34.8281061,
  },
  delivery: "Entrega calculada por distância: R$ 1,00 por quilômetro",
};
