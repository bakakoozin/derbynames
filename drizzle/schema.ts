import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, primaryKey, unique, int, varchar, timestamp, text } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const actions = mysqlTable("actions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	actionType: varchar({ length: 100 }).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	token: varchar({ length: 255 }),
	expiresAt: timestamp({ mode: 'string' }),
	payload: text(),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("actions_userId_idx").on(table.userId),
	index("actions_status_expiresAt_idx").on(table.status, table.expiresAt),
	index("actions_actionType_idx").on(table.actionType),
	primaryKey({ columns: [table.id], name: "actions_id"}),
	unique("actions_token_unique").on(table.token),
]);

export const clubAccessRequests = mysqlTable("club_access_requests", {
	id: int().autoincrement().notNull(),
	clubId: varchar({ length: 255 }).notNull(),
	requesterEmail: varchar({ length: 255 }).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	adminNote: text(),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "club_access_requests_id"}),
]);

export const clubMemberships = mysqlTable("club_memberships", {
	id: int().autoincrement().notNull(),
	clubId: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 20 }).notNull(),
	premiumValidUntil: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "club_memberships_id"}),
]);

export const clubRosterEntries = mysqlTable("club_roster_entries", {
	id: int().autoincrement().notNull(),
	clubId: varchar({ length: 255 }).notNull(),
	displayName: varchar({ length: 255 }),
	derbyname: varchar({ length: 255 }),
	numRoster: varchar({ length: 50 }),
	email: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "club_roster_entries_id"}),
]);

export const clubs = mysqlTable("clubs", {
	id: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow(),
	website: varchar({ length: 500 }),
	facebookUrl: varchar({ length: 500 }),
	instagramUrl: varchar({ length: 500 }),
	twitterUrl: varchar({ length: 500 }),
	logoUrl: varchar({ length: 500 }),
	department: varchar({ length: 8 }),
	source: varchar({ length: 50 }),
	parentClubId: varchar({ length: 255 }),
},
(table) => [
	index("clubs_parentClubId_idx").on(table.parentClubId),
	primaryKey({ columns: [table.id], name: "clubs_id"}),
]);

export const derbynameRenameHistory = mysqlTable("derbyname_rename_history", {
	id: int().autoincrement().notNull(),
	email: varchar({ length: 255 }).notNull(),
	oldDerbyname: varchar({ length: 255 }).notNull(),
	newDerbyname: varchar({ length: 255 }).notNull(),
	numRoster: varchar({ length: 50 }),
	clubId: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`),
	derbyType: varchar({ length: 20 }).default('player').notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "derbyname_rename_history_id"}),
]);

export const derbynames = mysqlTable("derbynames", {
	derbyname: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	numRoster: varchar({ length: 50 }),
	email: varchar({ length: 255 }).notNull(),
	clubId: varchar({ length: 255 }),
	emailConfirmed: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow(),
	derbyType: varchar({ length: 20 }).default('player').notNull(),
	userId: int(),
},
(table) => [
	index("derbynames_email_derbyType_confirmed_idx").on(table.email, table.derbyType, table.emailConfirmed),
	primaryKey({ columns: [table.derbyname], name: "derbynames_derbyname"}),
]);

export const history = mysqlTable("history", {
	id: int().autoincrement().notNull(),
	derbyname: varchar({ length: 255 }).notNull(),
	action: varchar({ length: 50 }).notNull(),
	field: varchar({ length: 100 }),
	oldValue: varchar({ length: 500 }),
	newValue: varchar({ length: 500 }),
	changedBy: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "history_id"}),
]);

export const payments = mysqlTable("payments", {
	id: int().autoincrement().notNull(),
	clubId: varchar({ length: 255 }),
	provider: varchar({ length: 50 }),
	externalId: varchar({ length: 255 }),
	amountCents: int(),
	currency: varchar({ length: 3 }),
	status: varchar({ length: 50 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "payments_id"}),
]);

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	email: varchar({ length: 255 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "users_id"}),
	unique("users_email_unique").on(table.email),
]);
