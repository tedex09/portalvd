import { useEffect } from "react";
import { startTourIfFirstVisit } from "@/utils/tour";

export const useRequestWizardTour = () => {
  useEffect(() => {
    startTourIfFirstVisit("request-wizard", [
      {
        element: "#request-type",
        popover: {
          title: "Tipo de Solicitação 📝",
          description: "Escolha o tipo de solicitação que você deseja fazer. Cada tipo tem um propósito específico.",
        },
      },
      {
        element: "#media-search",
        popover: {
          title: "Busca de Conteúdo 🔍",
          description: "Digite o título do filme ou série que você está procurando. Os resultados aparecerão automaticamente.",
        },
      },
      {
        element: "#description",
        popover: {
          title: "Descrição Detalhada ✍️",
          description: "Descreva o que precisa ser feito. Quanto mais detalhes você fornecer, melhor poderemos atender sua solicitação.",
        },
      },
    ]);
  }, []);
};