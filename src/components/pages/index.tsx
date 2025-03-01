"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { PlaySquare, ArrowRight, LogIn, UserPlus } from "lucide-react";
import { useSettingsStore } from "@/stores/settings";
import { useEffect, useState } from "react";

export function Index() {
  const router = useRouter();
  const { settings } = useSettingsStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Navbar */}
      {/* <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-md z-50 px-6 py-4">
        <div className="flex items-center gap-2">
          <Music2 className="w-8 h-8 text-[#B91D3A]" />
          <h1 className="text-xl font-bold">Portal VOD</h1>
        </div>
      </nav> */}

      {/* Main Content */}
      <div className="pt-20 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-[#B91D3A] to-[#D71E50] bg-clip-text text-transparent">
              Solicite seus VODs
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Solicite novos filmes e séries, atualize o conteúdo existente ou relate problemas
              de forma simplificada e rápida ✨
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card 
              className="group p-6 bg-[#282828] hover:bg-[#2a2a2a] border-none transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              onClick={() => router.push("/request")}
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-full bg-[#B91D3A] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlaySquare className="w-6 h-6 text-black" />
                </div>
                <h2 className="text-2xl font-bold">Solicite seu conteúdo</h2>
                <p className="text-gray-400">
                  Envie suas solicitações de conteúdo facilmente através de nosso assistente guiado
                </p>
                <Button 
                  className="w-full bg-[#B91D3A] hover:bg-[#D71E50] text-black font-bold transition-colors"
                >
                  Solicitar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card 
              className="p-6 bg-gradient-to-br from-[#535353] to-[#282828] border-none"
            >
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Já tem uma conta?</h2>
                <p className="text-gray-400">
                  Faça login para rastrear suas solicitações e receber notificações
                </p>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors"
                    onClick={() => router.push("/login")}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 hover:border-white/20 hover:bg-white/5 hover:text-bold transition-colors"
                    disabled={isClient && !settings.registrationEnabled }
                    onClick={() => router.push("/register")}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Cadastre-se
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6 py-12">
            {[
              {
                title: "Solicitações Fáceis",
                description: "Envie solicitações de conteúdo com nossa interface intuitiva de assistente"
              },
              {
                title: "Atualizações em Tempo Real",
                description: "Acompanhe o status de suas solicitações em tempo real ⚡"
              },
              {
                title: "Resposta rápida",
                description: "Receba notificações quando suas solicitações forem processadas 🔔"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-lg bg-[#282828] hover:bg-[#2a2a2a] transition-colors"
              >
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}