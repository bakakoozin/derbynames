import { boolean, int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Table des clubs
export const clubsTable = mysqlTable('clubs', {
  id: varchar({ length: 255 }).primaryKey(), // W442013684, W763011787, etc.
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

// Table principale des derbynames
export const derbynamesTable = mysqlTable('derbynames', {
  derbyname: varchar({ length: 255 }).primaryKey(), // Clé primaire = derbyname
  name: varchar({ length: 255 }).notNull(), // Nom complet (peut être identique au derbyname)
  numRoster: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  clubId: varchar({ length: 255 }), // Référence au club (peut être null)
  emailConfirmed: boolean().default(false).notNull(),
  emailToken: varchar({ length: 255 }), // Token pour validation d'email
  emailTokenExpiresAt: timestamp(), // Date d'expiration du token
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

// Table d'historique des changements
export const historyTable = mysqlTable('history', {
  id: int().primaryKey().autoincrement(),
  derbyname: varchar({ length: 255 }).notNull(), // Référence au derbyname
  action: varchar({ length: 50 }).notNull(), // 'created', 'updated', 'deleted', 'email_confirmed', etc.
  field: varchar({ length: 100 }), // Champ modifié (name, email, clubId, etc.)
  oldValue: varchar({ length: 500 }), // Ancienne valeur
  newValue: varchar({ length: 500 }), // Nouvelle valeur
  changedBy: varchar({ length: 255 }), // Email ou identifiant de la personne qui a fait le changement
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
