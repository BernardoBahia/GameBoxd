"use client";

import { useState } from "react";
import { StarDisplay, StarRating } from "@/components/StarRating";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { reviewsService } from "@/services/reviews.service";
import { getErrorMessage } from "@/utils/errors";

function IconPencil({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-4 h-4", className)}
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-4 h-4", className)}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export interface ReviewCardProps {
  reviewId: string;
  username: string;
  avatarUrl?: string | null;
  dateLabel: string;
  rating: number; // 0–5
  title: string;
  content: string;
  isOwner?: boolean;
  userId?: string;
  token?: string;
  onEdited?: () => void;
  onDeleted?: () => void;
  className?: string;
}

export function ReviewCard({
  reviewId,
  username,
  avatarUrl,
  dateLabel,
  rating,
  title,
  content,
  isOwner,
  userId,
  token,
  onEdited,
  onDeleted,
  className,
}: ReviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editRating, setEditRating] = useState(Math.round(rating));
  const [editComment, setEditComment] = useState(content);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    if (editRating < 1 || editRating > 5) {
      setError("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }
    if (!editComment.trim()) {
      setError("Comentário é obrigatório.");
      return;
    }
    setIsBusy(true);
    setError(null);
    try {
      await reviewsService.updateReview(
        reviewId,
        { userId, rating: editRating * 2, comment: editComment.trim() },
        token,
      );
      setIsEditing(false);
      onEdited?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  }

  async function confirmDelete() {
    if (!userId) return;
    setIsBusy(true);
    setError(null);
    try {
      await reviewsService.deleteReview(reviewId, userId, token);
      onDeleted?.();
    } catch (err) {
      setError(getErrorMessage(err));
      setIsBusy(false);
      setIsConfirmingDelete(false);
    }
  }

  return (
    <Card
      className={cn(
        "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors",
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{title}</CardTitle>
            <CardDescription className="mt-2 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 shrink-0 overflow-hidden rounded-full bg-zinc-700">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={username} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-zinc-400 select-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                  </span>
                )}
              </span>
              <span className="text-zinc-300">{username}</span>
              <span className="text-zinc-600">•</span>
              <span>{dateLabel}</span>
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <StarDisplay rating={rating} showNumber />
            {isOwner && (
              <div className="flex gap-0.5">
                <button
                  onClick={() => {
                    setEditRating(Math.round(rating));
                    setEditComment(content);
                    setError(null);
                    setIsConfirmingDelete(false);
                    setIsEditing((v) => !v);
                  }}
                  disabled={isBusy}
                  title="Editar review"
                  className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-40"
                >
                  <IconPencil />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                    setIsConfirmingDelete((v) => !v);
                  }}
                  disabled={isBusy}
                  title="Excluir review"
                  className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors disabled:opacity-40"
                >
                  <IconTrash />
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Conteúdo principal */}
        {!isEditing && (
          <>
            <p className="text-sm leading-7 text-zinc-200">{content}</p>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </>
        )}

        {/* Modal de confirmação de exclusão */}
        {isConfirmingDelete && !isEditing && (
          <div className="rounded-lg border border-red-900/60 bg-red-950/20 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 rounded-full bg-red-900/40 p-1.5 text-red-400">
                <IconTrash />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">
                  Excluir review?
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={isBusy}
                onClick={confirmDelete}
                className="bg-red-700/80 hover:bg-red-600 text-white"
              >
                {isBusy ? "Excluindo..." : "Excluir"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isBusy}
                onClick={() => setIsConfirmingDelete(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Formulário de edição */}
        {isEditing && (
          <form onSubmit={handleEdit} className="space-y-3">
            <div className="grid gap-1.5">
              <p className="text-sm font-medium text-zinc-200">Nota</p>
              <StarRating
                value={editRating}
                onChange={setEditRating}
                disabled={isBusy}
              />
            </div>
            <div className="grid gap-1.5">
              <label
                htmlFor={`comment-${reviewId}`}
                className="text-sm font-medium text-zinc-200"
              >
                Comentário
              </label>
              <textarea
                id={`comment-${reviewId}`}
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                disabled={isBusy}
                rows={3}
                className={cn(
                  "w-full resize-none rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200/20 focus-visible:border-zinc-700",
                )}
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isBusy}>
                {isBusy ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isBusy}
                onClick={() => setIsEditing(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
