"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash2, UserPlus, PlaySquare, ArrowLeft, LogOut, Menu, X, Search, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ITEMS_PER_PAGE = 10;

export function AdminUsers() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", currentPage, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchQuery && { search: searchQuery })
      });
      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const users = usersData?.users || [];
  const totalUsers = usersData?.total || 0;
  const onlineUsers = usersData?.onlineCount || 0;
  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  const createUser = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Failed to create user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setIsOpen(false);
      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso",
      });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setIsOpen(false);
      toast({
        title: "Usuário atualizado",
        description: "As alterações foram salvas com sucesso",
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      whatsapp: formData.get("whatsapp"),
    };

    if (editingUser) {
      await updateUser.mutateAsync({
        id: editingUser._id,
        data: userData,
      });
    } else {
      await createUser.mutateAsync(userData);
    }
  };

  const handlePasswordChange = async () => {
    if (!editingUser || !newPassword) return;

    try {
      setIsChangingPassword(true);
      await updateUser.mutateAsync({
        id: editingUser._id,
        data: { password: newPassword }
      });
      setNewPassword("");
      toast.success("Senha alterada com sucesso");
    } catch (error) {
      toast.error("Erro ao alterar senha");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const MetricCard = ({ title, value, icon: Icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent className="z-10">
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
        <div className={`absolute -right-6 -bottom-6 w-16 h-16 rounded-full ${color.replace('text-', 'bg-')}/10 blur-xl`}></div>
      </Card>
    </motion.div>
  );

  const MetricCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12" />
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Mobile Header */}
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

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
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
            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" /> Sair
          </Button>
        </div>

        {/* Main Content */}
        <div className={`flex-1 p-4 md:p-8 ${isMobile ? 'pt-20' : 'md:ml-64'}`}>
          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {isLoading ? (
              <>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </>
            ) : (
              <>
                <MetricCard
                  title="Total de Usuários"
                  value={totalUsers}
                  icon={UserPlus}
                  color="text-blue-500"
                />
                <MetricCard
                  title="Usuários Online"
                  value={onlineUsers}
                  icon={PlaySquare}
                  color="text-green-500"
                />
              </>
            )}
          </div>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
              <p className="text-muted-foreground">
                Total de usuários: {totalUsers}
              </p>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingUser(null);
                    setIsOpen(true);
                  }}
                  className="bg-[#B91D3A] hover:bg-[#D71E50]"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? "Editar Usuário" : "Novo Usuário"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingUser?.name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={editingUser?.email}
                      required
                    />
                  </div>
                  {!editingUser && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                      />
                    </div>
                  )}
                  {editingUser && (
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <div className="flex gap-2">
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Digite a nova senha"
                        />
                        <Button
                          type="button"
                          onClick={handlePasswordChange}
                          disabled={!newPassword || isChangingPassword}
                        >
                          {isChangingPassword ? "Alterando..." : "Alterar"}
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Select name="role" defaultValue={editingUser?.role || "user"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      defaultValue={editingUser?.whatsapp}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingUser ? "Salvar" : "Criar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-10 bg-[#282828] border-none"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
              />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg overflow-hidden border border-[#282828]"
          >
            {isMobile ? (
              // Mobile card view
              <div className="space-y-4">
                {isLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <Card key={index} className="bg-[#282828] border-none">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <Skeleton className="h-[68px] w-[45px] rounded-md" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-[150px] mb-2" />
                            <Skeleton className="h-4 w-[80px] mb-2" />
                            <Skeleton className="h-6 w-[100px]" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  users?.map((user) => (
                    <Card 
                      key={user._id} 
                      className="bg-[#282828] border-none overflow-hidden relative"
                      onClick={() => {
                        setEditingUser(user);
                        setIsOpen(true);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm mb-1 line-clamp-1">{user.name}</h3>
                            <p className="text-xs text-gray-400 mb-2">
                              {user.username || "-"}
                              {" • "}
                              {user.provider || "-"}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${user.role !== "admin" ? "bg-blue-500/20 text-blue-500" : "bg-red-500/20 text-red-500"}`}>
                                {user.role === "admin" ? "Administrador" : "Usuário"}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteUser.mutate(user._id)}
                                  className="h-8 w-8 bg-red-900/50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <div className={`h-1 w-full absolute bottom-0 left-0
                        ${user.role !== "admin" ? "bg-blue-500/20 text-blue-500" : "bg-red-500/20 text-red-500"}
                      `}></div>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              // Desktop table view
              <Table>
                <TableHeader className="bg-[#282828]">
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Servidor</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                    Array(5).fill(0).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[140px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      </TableRow>
                    ))
                ) : (
                  <AnimatePresence mode="popLayout">
                    {users?.map((user: any) => (
                      <TableRow key={user._id} className="hover:bg-[#282828]">
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.provider || "-"}</TableCell>
                        <TableCell>{user.username || "-"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.role === "admin" ? "Administrador" : "Usuário"}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingUser(user);
                              setIsOpen(true);
                            }}
                            className="bg-[#282828] border-none hover:bg-[#3E3E3E]"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteUser.mutate(user._id)}
                            className="bg-red-900/50 hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </AnimatePresence>
                )}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 bg-[#282828]">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="bg-[#3E3E3E] border-none"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                <span className="text-sm text-gray-400">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-[#3E3E3E] border-none"
                >
                  Próxima
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}