"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ProfileHeaderProps {
  name: string;
  handle: string;
  bio?: string;
  avatarUrl?: string | null;
  isUploadingAvatar?: boolean;
  uploadAvatarError?: string | null;
  onAvatarChange?: (file: File) => Promise<unknown> | void;
  onNameSave?: (name: string) => Promise<unknown>;
  isUpdatingName?: boolean;
  updateNameError?: string | null;
  onLogout?: () => void;
  className?: string;
}

function IconCamera({ className }: { className?: string }) {
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
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

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
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function ProfileHeader({
  name,
  handle,
  bio,
  avatarUrl,
  isUploadingAvatar,
  uploadAvatarError,
  onAvatarChange,
  onNameSave,
  isUpdatingName,
  updateNameError,
  onLogout,
  className,
}: ProfileHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(name);
  const [nameSuccess, setNameSuccess] = useState(false);

  useEffect(() => {
    if (!isEditingName) setNameDraft(name);
  }, [name, isEditingName]);

  useEffect(() => {
    if (isEditingName) nameInputRef.current?.focus();
  }, [isEditingName]);

  async function handleNameSave() {
    if (!onNameSave) return;
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === name) {
      setIsEditingName(false);
      return;
    }
    try {
      await onNameSave(trimmed);
      setIsEditingName(false);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 2500);
    } catch {
      // error shown via updateNameError
    }
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); handleNameSave(); }
    if (e.key === "Escape") { setIsEditingName(false); }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onAvatarChange) return;
    try {
      await onAvatarChange(file);
    } catch {
      // error is handled in the hook via uploadAvatarError state
    }
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-14 w-14 overflow-hidden rounded-2xl bg-zinc-800/70">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-500 select-none">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
              )}
            </div>

            {onAvatarChange && (
              <>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  title="Alterar foto"
                  className={cn(
                    "absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 shadow transition-colors",
                    "hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50",
                  )}
                >
                  {isUploadingAvatar ? (
                    <span className="h-3 w-3 animate-spin rounded-full border border-zinc-400 border-t-transparent" />
                  ) : (
                    <IconCamera className="w-3 h-3" />
                  )}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>

          <div className="min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  maxLength={50}
                  disabled={isUpdatingName}
                  className="rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1 text-lg font-semibold tracking-tight text-zinc-100 outline-none focus:border-zinc-400 disabled:opacity-50 w-48"
                />
                <button
                  type="button"
                  onClick={handleNameSave}
                  disabled={isUpdatingName}
                  className="text-xs text-green-400 hover:text-green-300 disabled:opacity-50"
                >
                  {isUpdatingName ? (
                    <span className="h-3 w-3 animate-spin rounded-full border border-green-400 border-t-transparent inline-block" />
                  ) : "Salvar"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  disabled={isUpdatingName}
                  className="text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="truncate text-xl font-semibold tracking-tight">
                  {name}
                </h1>
                {onNameSave && (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    title="Alterar nome"
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-300 transition-opacity"
                  >
                    <IconPencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {nameSuccess && (
                  <span className="text-xs text-green-400">Nome atualizado!</span>
                )}
              </div>
            )}
            <p className="mt-1 text-sm text-zinc-400">{handle}</p>
            {updateNameError && (
              <p className="mt-1 text-xs text-red-400">{updateNameError}</p>
            )}
            {bio ? (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-200">
                {bio}
              </p>
            ) : null}
            {uploadAvatarError && (
              <p className="mt-2 text-xs text-red-400">{uploadAvatarError}</p>
            )}
          </div>
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="self-start flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair
          </button>
        )}
      </div>
    </section>
  );
}
