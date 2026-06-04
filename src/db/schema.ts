import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Table des clubs
export const clubsTable = mysqlTable('clubs', {
  id: varchar({ length: 255 }).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  website: varchar({ length: 500 }),
  facebookUrl: varchar({ length: 500 }),
  instagramUrl: varchar({ length: 500 }),
  twitterUrl: varchar({ length: 500 }),
  logoUrl: varchar({ length: 500 }),
  /** Code département FR (ex. 75, 2A) */
  department: varchar({ length: 8 }),
  source: varchar({ length: 50 }),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

// Table principale des derbynames
export const derbynamesTable = mysqlTable('derbynames', {
  derbyname: varchar({ length: 255 }).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  numRoster: varchar({ length: 50 }),
  email: varchar({ length: 255 }).notNull(),
  clubId: varchar({ length: 255 }),
  emailConfirmed: boolean().default(false).notNull(),
  emailToken: varchar({ length: 255 }),
  emailTokenExpiresAt: timestamp(),
  /** JSON string : proposition de club (nom, urls…) avant validation email — pas d’INSERT clubs avant validation */
  pendingClubJson: text(),
  /** Si défini, à la confirmation du nouveau derbyname, supprimer l’ancienne ligne confirmée */
  replacesDerbyname: varchar({ length: 255 }),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

/** Historique des derby names remplacés (après confirmation email du nouveau) */
export const derbynameRenameHistoryTable = mysqlTable('derbyname_rename_history', {
  id: int().primaryKey().autoincrement(),
  email: varchar({ length: 255 }).notNull(),
  oldDerbyname: varchar({ length: 255 }).notNull(),
  newDerbyname: varchar({ length: 255 }).notNull(),
  numRoster: varchar({ length: 50 }),
  clubId: varchar({ length: 255 }),
  createdAt: timestamp().defaultNow(),
});

/** Jeton usage unique pour consulter l’historique des derby names par email (magic link) */
export const renameHistoryAccessTokensTable = mysqlTable('rename_history_access_tokens', {
  id: int().primaryKey().autoincrement(),
  email: varchar({ length: 255 }).notNull(),
  token: varchar({ length: 255 }).notNull().unique(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().defaultNow(),
});

// Table d'historique des changements (journal générique)
export const historyTable = mysqlTable('history', {
  id: int().primaryKey().autoincrement(),
  derbyname: varchar({ length: 255 }).notNull(),
  action: varchar({ length: 50 }).notNull(),
  field: varchar({ length: 100 }),
  oldValue: varchar({ length: 500 }),
  newValue: varchar({ length: 500 }),
  changedBy: varchar({ length: 255 }),
  createdAt: timestamp().defaultNow(),
});

// --- Premium (tables présentes ; exposition contrôlée par feature flags) ---

export const clubAccessRequestsTable = mysqlTable('club_access_requests', {
  id: int().primaryKey().autoincrement(),
  clubId: varchar({ length: 255 }).notNull(),
  requesterEmail: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 20 }).notNull().default('pending'),
  adminNote: text(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

export const clubMembershipsTable = mysqlTable('club_memberships', {
  id: int().primaryKey().autoincrement(),
  clubId: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 20 }).notNull(),
  premiumValidUntil: timestamp(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

export const clubRosterEntriesTable = mysqlTable('club_roster_entries', {
  id: int().primaryKey().autoincrement(),
  clubId: varchar({ length: 255 }).notNull(),
  displayName: varchar({ length: 255 }),
  derbyname: varchar({ length: 255 }),
  numRoster: varchar({ length: 50 }),
  email: varchar({ length: 255 }),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

export const paymentsTable = mysqlTable('payments', {
  id: int().primaryKey().autoincrement(),
  clubId: varchar({ length: 255 }),
  provider: varchar({ length: 50 }),
  externalId: varchar({ length: 255 }),
  amountCents: int(),
  currency: varchar({ length: 3 }),
  status: varchar({ length: 50 }),
  createdAt: timestamp().defaultNow(),
});

// Relations
export const derbynamesRelations = relations(derbynamesTable, ({ one, many }) => ({
  club: one(clubsTable, {
    fields: [derbynamesTable.clubId],
    references: [clubsTable.id],
  }),
  history: many(historyTable),
}));

export const clubsRelations = relations(clubsTable, ({ many }) => ({
  derbynames: many(derbynamesTable),
}));

export const historyRelations = relations(historyTable, ({ one }) => ({
  derbyname: one(derbynamesTable, {
    fields: [historyTable.derbyname],
    references: [derbynamesTable.derbyname],
  }),
}));
