"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Film, Tv, Trash2, Calendar, Clock, ArrowLeft, CheckCircle2, AlertCircle, MessageCircle } from "lucide-react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { useRequestsStore } from "@/stores/requests";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

const statusMap = {
  pending: { label: "Pendente", color: "bg-yellow-500", icon: Clock },
  in_progress: { label: "Em análise", color: "bg-blue-500", icon: Clock },
  completed: { label: "Concluído", color: "bg-green-500", icon: CheckCircle2 },
  rejected: { label: "Rejeitado", color: "bg-red-500", icon: AlertCircle },
};

const typeMap = {
  add: "Adicionar",
  update: "Atualizar",
  fix: "Corrigir",
};

export function RequestDetails({ request, isOwner, isAdmin }) {
  const router = useRouter();
  const [status, setStatus] = useState(request.status);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const { updateRequestStatus } = useRequestsStore();

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      setUpdatingStatus(requestId);
      await updateRequestStatus(requestId, newStatus);
      setStatus(newStatus);
      toast.success("Status atualizado ✨", {
        description: "A solicitação foi atualizada com sucesso!",
      });
    } catch (error) {
      toast.error("Erro ao atualizar status", {
        description: "Tente novamente mais tarde",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/requests/${request._id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete request");

      toast.success("Solicitação removida", {
        description: "A solicitação foi removida com sucesso",
      });
      
      router.push("/dashboard");
    } catch (error) {
      toast.error("Erro ao remover solicitação", {
        description: "Tente novamente mais tarde",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const StatusIcon = statusMap[status]?.icon || Clock;

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-6 group flex items-center" 
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Voltar
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Main Card */}
        <Card className="overflow-hidden border-none shadow-lg">
          <div className="relative">
            {/* Background gradient based on status */}
            <div className={`absolute inset-0 h-32 ${statusMap[status].color.replace('bg-', 'bg-gradient-to-r from-')}/20 to-transparent`}></div>
            
            <CardHeader className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${statusMap[status].color} text-white capitalize px-2 py-1 flex items-center gap-1`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      <span>{statusMap[status].label}</span>
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {typeMap[request.type]}
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-bold mt-2">
                    {request.mediaTitle}
                  </h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Solicitado em{" "}
                    {format(new Date(request.createdAt), "PPP", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-0">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  {request.mediaPoster ? (
                    <motion.img
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={`https://image.tmdb.org/t/p/w300${request.mediaPoster}`}
                      alt={request.mediaTitle}
                      className="w-full md:w-48 rounded-md shadow-md"
                    />
                  ) : (
                    <div className="w-full md:w-48 h-72 bg-muted rounded-md flex items-center justify-center shadow-md">
                      {request.mediaType === "movie" ? (
                        <Film className="h-12 w-12 text-muted-foreground" />
                      ) : (
                        <Tv className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-[--primary]"></span>
                      Detalhes da Solicitação
                    </h2>
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Tipo de mídia
                        </h3>
                        <p className="text-sm font-medium">
                          {request.mediaType === "movie" ? "Filme" : "Série"}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Tipo de solicitação
                        </h3>
                        <p className="text-sm font-medium">{typeMap[request.type]}</p>
                      </div>
                    </div>
                  </div>
                  
                  {request.description && (
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-[--primary]"></span>
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Descrição
                      </h2>
                      <Separator />
                      <div className="bg-secondary/50 p-4 rounded-md">
                        <p className="text-sm whitespace-pre-wrap">
                          {request.description}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {isAdmin && (
                    <div className="space-y-2 pt-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-[--primary]"></span>
                        Gerenciar Status
                      </h2>
                      <Separator />
                      <div className="flex items-center gap-4">
                        <Select
                          value={status}
                          onValueChange={(value) => handleStatusChange(request._id, value)}
                          disabled={updatingStatus === request._id}
                        >
                          <SelectTrigger className="w-[200px] bg-[#282828]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="in_progress">Em análise</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                            <SelectItem value="rejected">Rejeitado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end gap-4 pt-6 pb-6">
              <Button variant="outline" onClick={() => router.back()}>
                Voltar
              </Button>
              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? "Excluindo..." : "Excluir solicitação"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir esta solicitação? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardFooter>
          </div>
        </Card>
        
        {/* Status Timeline Card */}
        <Card className="border-none shadow-lg overflow-hidden">
          <CardHeader>
            <h2 className="text-xl font-semibold">Status da Solicitação</h2>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-muted"></div>
              
              <div className="space-y-8">
                {/* Pending */}
                <div className="relative pl-12">
                  <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ${status === 'pending' ? 'bg-yellow-500 text-black' : (status === 'in_progress' || status === 'completed' || status === 'rejected') ? 'bg-green-500 text-black' : 'bg-muted text-muted-foreground'}`}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">Solicitação Recebida</h3>
                  <p className="text-sm text-muted-foreground">
                    Sua solicitação foi recebida e está aguardando análise.
                  </p>
                </div>
                
                {/* In Progress */}
                <div className="relative pl-12">
                  <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ${status === 'in_progress' ? 'bg-blue-500 text-black' : (status === 'completed' || status === 'rejected') ? 'bg-green-500 text-black' : 'bg-muted text-muted-foreground'}`}>
                    <Clock className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">Em Análise</h3>
                  <p className="text-sm text-muted-foreground">
                    Nossa equipe está analisando sua solicitação.
                  </p>
                </div>
                
                {/* Completed or Rejected */}
                <div className="relative pl-12">
                  <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ${status === 'completed' ? 'bg-green-500 text-black' : status === 'rejected' ? 'bg-red-500 text-black' : 'bg-muted text-muted-foreground'}`}>
                    {status === 'rejected' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                  </div>
                  <h3 className="font-medium">
                    {status === 'completed' ? 'Concluído' : status === 'rejected' ? 'Rejeitado' : 'Finalização'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {status === 'completed' 
                      ? 'Sua solicitação foi atendida com sucesso!' 
                      : status === 'rejected' 
                      ? 'Infelizmente sua solicitação não pôde ser atendida.' 
                      : 'Aguardando finalização do processo.'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}