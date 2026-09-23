"use client";

import * as React from "react";

import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n";

type I18n = { locale: Locale; t: Messages };

const I18nContext = React.createContext<I18n | null>(null);

/** Hands the card's language and wording to every chapter and control below it. */
export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const value = React.useMemo(() => ({ locale, t: messages }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const value = React.useContext(I18nContext);
  if (!value) throw new Error("useI18n() needs an <I18nProvider> above it");
  return value;
}
