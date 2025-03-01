"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Film, Tv, Plus, Wrench, RefreshCw, Share2, Copy, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { signOut } from "next-auth/react";

const ITEMS_PER_PAGE = 5;

export function Dashboard() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const { toast } = useToast();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const response = await fetch('/api/requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      return response.json();
    }
  });

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
  });

  const filteredRequests = statusFilter === "all"
    ? requests
    : requests?.filter(request => request.status === statusFilter);

  const totalPages = Math.ceil((filteredRequests?.length || 0) / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const completedPercentage = requests
    ? (requests.filter(r => r.status === "completed").length / requests.length) * 100
    : 0;

  const requestLink = typeof window !== "undefined" 
  ? `${window.location.origin}/request/${selectedRequestId}` 
  : "";

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };
  

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const handleShare = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShareDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência."
    });
  };

  return (
    <div className="container mx-auto py-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Minhas Solicitações</h1>
          <p className="text-muted-foreground">
            Acompanhe o status das suas solicitações
          </p>
          {settings && (
            <p className="text-sm text-muted-foreground mt-1">
              Limites: {settings.requestLimitPerDay} por dia / {settings.requestLimitPerWeek} por semana
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em análise</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => router.push("/request")}
            className="bg-[#B91D3A] hover:bg-[#B91D3A]/50 text-white"
          >
            Nova solicitação
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <Card className="p-6 overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="z-10">
              <h2 className="text-lg font-semibold mb-2">Progresso Geral</h2>
              <p className="text-sm text-muted-foreground">
                {!completedPercentage ? 0 : completedPercentage.toFixed(0)}% das solicitações concluídas
              </p>
            </div>
            <div className="w-full md:w-1/2 z-10">
              <div className="h-4 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#B91D3A] to-[#D71E50] transition-all duration-500"
                  style={{ width: `${!completedPercentage ? 0 : completedPercentage}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-[#B91D3A]/10 blur-xl"></div>
          <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-[#B91D3A]/5 blur-xl"></div>
        </Card>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {paginatedRequests?.map((request, index) => (
          <motion.div
            key={request._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="mb-4 hover:bg-accent/5 transition-colors cursor-pointer"
              onClick={() => {!shareDialogOpen && router.push(`/request/${request._id}`)}}
            >
              <div className="p-6">
                <div className="flex items-center gap-4">
                  {request.mediaPoster ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${request.mediaPoster}`}
                      alt={request.mediaTitle}
                      className="w-16 h-24 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-16 h-24 rounded-md bg-secondary flex items-center justify-center">
                      {request.mediaType === "movie" ? (
                        <Film className="w-8 h-8 text-muted-foreground" />
                      ) : (
                        <Tv className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {request.mediaTitle}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {request.type === "add" && (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>Adicionar</span>
                            </>
                          )}
                          {request.type === "update" && (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              <span>Atualizar</span>
                            </>
                          )}
                          {request.type === "fix" && (
                            <>
                              <Wrench className="w-4 h-4" />
                              <span>Corrigir</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium
                          ${request.status === "pending" && "bg-yellow-500/20 text-yellow-500"}
                          ${request.status === "in_progress" && "bg-blue-500/20 text-blue-500"}
                          ${request.status === "completed" && "bg-green-500/20 text-green-500"}
                          ${request.status === "rejected" && "bg-red-500/20 text-red-500"}
                        `}>
                          {request.status === "pending" && "Pendente"}
                          {request.status === "in_progress" && "Em análise"}
                          {request.status === "completed" && "Concluído"}
                          {request.status === "rejected" && "Rejeitado"}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleShare(request._id)}
                          className="hover:bg-[#3E3E3E]"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Solicitado em {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {(!paginatedRequests || paginatedRequests.length === 0) && (
        <div className="text-center py-12">
          <div className="mb-4">
            <Film className="w-12 h-12 text-muted-foreground mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando uma nova solicitação de conteúdo
          </p>
          <Button
            onClick={() => router.push("/request")}
            className="bg-[#B91D3A] hover:bg-[#D71E50] text-white"
          >
            Criar solicitação
          </Button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      <Button 
        variant="ghost" 
        className="w-auto justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4" /> Sair
      </Button>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Solicitação</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-4">
            <Input 
              readOnly 
              value={requestLink}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(requestLink)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}