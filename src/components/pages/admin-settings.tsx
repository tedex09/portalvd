"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { PlaySquare, ArrowLeft, Loader2, Trash2, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettingsStore } from "@/stores/settings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { signOut } from "next-auth/react";
import { useIsMobile } from "@/hooks/use-mobile";


const settingsSchema = z.object({
  requestLimitPerDay: z.number().min(1),
  requestLimitPerWeek: z.number().min(1),
  whatsappEnabled: z.boolean(),
  twilioAccountSid: z.string().optional(),
  twilioAuthToken: z.string().optional(),
  twilioPhoneNumber: z.string().optional(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Invalid color format. Use hex color (e.g., #B91D3A)",
  }),
  platformEnabled: z.boolean(),
  disabledMessage: z.string().optional(),
  registrationEnabled: z.boolean(),
});

export function AdminSettings() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setSettings } = useSettingsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();


  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
    onSuccess: (data) => {
      form.reset(data);
      setSettings(data);
      // Apply primary color to CSS variables
      document.documentElement.style.setProperty('--primary', data.primaryColor);
    },
  });

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      requestLimitPerDay: 10,
      requestLimitPerWeek: 50,
      whatsappEnabled: false,
      twilioAccountSid: "",
      twilioAuthToken: "",
      twilioPhoneNumber: "",
      primaryColor: "#B91D3A",
      platformEnabled: true,
      disabledMessage: "",
      registrationEnabled: true,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        ...settings,
        requestLimitPerDay: settings.requestLimitPerDay || 10,
        requestLimitPerWeek: settings.requestLimitPerWeek || 50,
        primaryColor: settings.primaryColor || "#B91D3A",
        platformEnabled: settings.platformEnabled !== false,
        disabledMessage: settings.disabledMessage || "",
        registrationEnabled: settings.registrationEnabled !== false,
      });
    }
  }, [settings, form]);

  const updateSettings = useMutation({
    mutationFn: async (data: z.infer<typeof settingsSchema>) => {
      setIsSubmitting(true);
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: (data) => {
      setSettings(data);
      // Apply primary color to CSS variables
      document.documentElement.style.setProperty('--primary', data.primaryColor);
      toast.success("Configurações salvas", {
        description: "As alterações foram aplicadas com sucesso",
      });
    },
    onError: () => {
      toast.error("Erro ao salvar", {
        description: "Ocorreu um erro ao salvar as configurações",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const deleteAllRequests = useMutation({
    mutationFn: async () => {
      setIsDeleting(true);
      const response = await fetch("/api/admin/requests", {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete requests");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-requests"]);
      toast.success("Solicitações excluídas", {
        description: "Todas as solicitações foram removidas com sucesso",
      });
    },
    onError: () => {
      toast.error("Erro ao excluir", {
        description: "Ocorreu um erro ao excluir as solicitações",
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  const onSubmit = (data: z.infer<typeof settingsSchema>) => {
    updateSettings.mutate(data);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  const MobileMenu = () => (
    <div className={`fixed inset-0 bg-black/90 backdrop-blur-md z-50 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <PlaySquare className="w-8 h-8 text-[#B91D3A]" />
            <h1 className="text-xl font-bold">Portal VOD</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 mb-4"
            onClick={() => router.push("/admin")}
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" /> Sair
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Mobile Header - Only visible on mobile */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-md z-40 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <PlaySquare className="w-6 h-6 text-[#B91D3A]" />
            <h1 className="text-lg font-semibold">Portal VOD</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </header>
      )}

      {/* Mobile Menu */}
      {isMobile && <MobileMenu />}

      <div className="flex flex-col md:flex-row">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block w-64 bg-black h-screen fixed left-0 p-6">
          <div className="flex items-center gap-2 mb-8">
            <PlaySquare className="w-8 h-8 text-[#B91D3A]" />
            <h1 className="text-xl font-bold">Portal VOD</h1>
          </div>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 mb-4"
            onClick={() => router.push("/admin")}
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>

        {/* Main Content */}
        <div className={`flex-1 p-4 md:p-8 ${isMobile ? 'pt-20' : 'md:ml-64'}`}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações globais do sistema
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-semibold">
                      Solicitações
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="requestLimitPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limite diário</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Número máximo de solicitações por dia
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requestLimitPerWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limite semanal</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Número máximo de solicitações por semana
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive"
                          className="w-full"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Excluindo...
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir todas as solicitações
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir todas as solicitações?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Todas as solicitações serão permanentemente removidas.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAllRequests.mutate()}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Confirmar exclusão
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-semibold">
                      Notificações WhatsApp
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="whatsappEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Ativar notificações</FormLabel>
                            <FormDescription>
                              Habilitar envio de notificações via WhatsApp
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("whatsappEnabled") && (
                      <div className="space-y-4 animate-in fade-in-50">
                        <FormField
                          control={form.control}
                          name="twilioAccountSid"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account SID</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="twilioAuthToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Auth Token</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="twilioPhoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número WhatsApp</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Número do WhatsApp configurado no Twilio
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-semibold">
                      Plataforma
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor primária</FormLabel>
                          <FormControl>
                            <div className="flex gap-4">
                              <Input 
                                type="color" 
                                {...field} 
                                className="w-20 h-10"
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  // Preview color change
                                  document.documentElement.style.setProperty('--primary', e.target.value);
                                }}
                              />
                              <Input 
                                {...field} 
                                placeholder="#B91D3A"
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  // Preview color change if valid hex
                                  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(e.target.value)) {
                                    document.documentElement.style.setProperty('--primary', e.target.value);
                                  }
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Cor principal da plataforma
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                    <FormField
                      control={form.control}
                      name="platformEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Plataforma ativa</FormLabel>
                            <FormDescription>
                              Habilitar/desabilitar acesso à plataforma
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {!form.watch("platformEnabled") && (
                      <FormField
                        control={form.control}
                        name="disabledMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensagem de manutenção</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="A plataforma está em manutenção..." />
                            </FormControl>
                            <FormDescription>
                              Mensagem exibida quando a plataforma estiver desativada
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="registrationEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Registro de usuários</FormLabel>
                            <FormDescription>
                              Permitir que novos usuários se registrem na plataforma
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              <Button
                type="submit"
                className="w-full bg-[#B91D3A] hover:bg-[#D71E50]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}