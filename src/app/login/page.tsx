"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/auth";
import { api } from "@/lib/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const schema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est obligatoire"),
  password: z.string().min(1, "Le mot de passe est obligatoire"),
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: Form) {
    setLoading(true);

    try {
      console.log("Tentative de connexion...");

      const res = await api.post("/auth/token/", values);

      console.log("Réponse du serveur :", res.data);

      const { access, refresh } = res.data;

      if (!access) {
        console.error(
          "Aucun access token reçu depuis Django.",
          res.data
        );

        alert(
          "La connexion a échoué : aucun token d'accès n'a été reçu."
        );

        return;
      }

      console.log("Access token reçu : OUI");
      console.log("Refresh token reçu :", !!refresh);

      setToken(access, refresh);

      // Vérification locale après l'enregistrement
      const savedToken = localStorage.getItem("access_token");

      console.log(
        "Access token enregistré dans Local Storage :",
        !!savedToken
      );

      if (!savedToken) {
        console.error(
          "Le token a été reçu mais n'a pas pu être enregistré dans Local Storage."
        );

        alert(
          "Le token a été reçu mais n'a pas été enregistré."
        );

        return;
      }

      console.log("Connexion réussie.");

      router.push("/dashboard");
      router.refresh();
    } catch (e: any) {
      console.error("Erreur login :", e);

      const message =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Erreur de connexion";

      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-xl">
            Connexion
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Nom d'utilisateur */}
            <div>
              <Input
                placeholder="Nom d'utilisateur"
                autoComplete="username"
                {...register("username")}
                className="bg-white/5 border-white/10 text-white"
              />

              {errors.username && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <Input
                placeholder="Mot de passe"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="bg-white/5 border-white/10 text-white"
              />

              {errors.password && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Bouton */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading
                ? "Connexion..."
                : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

