"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import MediaSearch from "@/components/MediaSearch";
import { ArrowLeft, Send, Film, Tv, Plus, Wrench, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "../ui/card";

export function RequestWizard() {
  const [step, setStep] = useState(1);
  const [mediaType, setMediaType] = useState<"movie" | "tv">();
  const [requestType, setRequestType] = useState<string>("");
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [description, setDescription] = useState("");
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleMediaTypeSelect = (type: "movie" | "tv") => {
    setMediaType(type);
    setStep(2);
  };

  const handleRequestTypeSelect = (type: string) => {
    setRequestType(type);
    setStep(3);
  };

  const handleMediaSelect = (media: any) => {
    setSelectedMedia(media);
    setStep(4);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: requestType,
          mediaId: selectedMedia.id,
          mediaTitle: selectedMedia.title,
          mediaPoster: selectedMedia.posterPath || '',
          mediaType: mediaType,
          description: description || '',
          notifyWhatsapp: whatsappNotifications,
          whatsappNumber: whatsappNumber,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        if (response.status === 429) {
          toast.error("Limite excedido", {
            description: data.error,
          });
          return;
        }
        throw new Error("Falha ao enviar solicitação");
      }

      toast.success("✨ Solicitação enviada!", {
        description: "Você será redirecionado para o dashboard.",
      });
      
      router.push("/dashboard");
    } catch (error) {
      toast.error("Erro ao enviar solicitação", {
        description: "Por favor, tente novamente mais tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideAnimation = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="mb-8 space-y-2">
        <Button
          variant="ghost"
          className="pl-0"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold gradient-text">Nova Solicitação</h1>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i <= step ? "gradient-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className="text-muted-foreground">Passo {step} de 4</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            {...slideAnimation}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold">
              Qual tipo de conteúdo você deseja solicitar? 🎬
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-32 flex flex-col gap-2 hover:bg-accent transition-colors"
                onClick={() => handleMediaTypeSelect("movie")}
              >
                <Film className="h-8 w-8" />
                <span>Filme</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-32 flex flex-col gap-2 hover:bg-accent transition-colors"
                onClick={() => handleMediaTypeSelect("tv")}
              >
                <Tv className="h-8 w-8" />
                <span>Série</span>
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            {...slideAnimation}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold">
              O que você deseja fazer? 🤔
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-24 flex gap-4 items-center justify-start px-6 hover:bg-accent transition-colors"
                onClick={() => handleRequestTypeSelect("add")}
              >
                <Plus className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Adicionar</div>
                  <div className="text-sm text-muted-foreground">
                    Solicitar adição de novo conteúdo
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-24 flex gap-4 items-center justify-start px-6 hover:bg-accent transition-colors"
                onClick={() => handleRequestTypeSelect("fix")}
              >
                <Wrench className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Corrigir</div>
                  <div className="text-sm text-muted-foreground">
                    Reportar problemas com o conteúdo
                  </div>
                </div>
              </Button>
              {mediaType === "tv" && (
                <Button
                  variant="outline"
                  size="lg"
                  className="h-24 flex gap-4 items-center justify-start px-6 hover:bg-accent transition-colors"
                  onClick={() => handleRequestTypeSelect("update")}
                >
                  <RefreshCw className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-semibold">Atualizar</div>
                    <div className="text-sm text-muted-foreground">
                      Solicitar atualização de episódios
                    </div>
                  </div>
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            {...slideAnimation}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold">
              Buscar conteúdo 🔍
            </h2>
            <MediaSearch
              type={mediaType}
              onSelect={handleMediaSelect}
            />
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            {...slideAnimation}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold">Detalhes da solicitação ✍️</h2>
            <Card className="p-6 space-y-4">
              <div className="flex items-start space-x-4">
                {selectedMedia.posterPath ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={`https://image.tmdb.org/t/p/w200${selectedMedia.posterPath}`}
                    alt={selectedMedia.title}
                    className="w-24 rounded-md"
                  />
                ) : (
                  <div className="w-24 h-36 bg-muted rounded-md flex items-center justify-center">
                    {mediaType === "movie" ? (
                      <Film className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <Tv className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedMedia.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {mediaType === "movie" ? "Filme" : "Série"} •{" "}
                    {selectedMedia.year}
                  </p>
                </div>
              </div>
              {requestType !== "add" && (
                <Textarea
                  placeholder="Descreva detalhadamente sua solicitação..."
                  className="h-32"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              )}

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notifications"
                    checked={whatsappNotifications}
                    onCheckedChange={setWhatsappNotifications}
                  />
                  <Label htmlFor="notifications">
                    Receber notificações por WhatsApp
                  </Label>
                </div>

                {whatsappNotifications && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="whatsapp">Número do WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="11999999999"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="max-w-xs"
                    />
                    <p className="text-sm text-muted-foreground">
                      Digite apenas números, incluindo DDD
                    </p>
                  </motion.div>
                )}
              </div>
            </Card>

            <Button
              className="w-full bg-[#B91D3A] hover:bg-[#D71E50] text-white"
              onClick={handleSubmit}
              disabled={isSubmitting || (requestType !== "add" && !description)}
            >
              {isSubmitting ? (
                "Enviando..."
              ) : (
                <>
                  Enviar solicitação
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}