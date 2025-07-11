import * as t from "drizzle-orm/pg-core";

export const users = t.pgTable("users", {
    id: t.integer('id').primaryKey().generatedAlwaysAsIdentity(),
    email: t.text('email').unique(),
    name: t.text('name'),
    avatar: t.text('avatar'),
    isVerified: t.boolean('is_verified').default(false),
    role: t.text('role').default('user'),
    createdAt: t.timestamp('created_at').defaultNow(),
    updatedAt: t.timestamp('updated_at').defaultNow()
})

export const userProviders = t.pgTable("users_providers", {
    id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
    usersId: t.integer('users_id').references(() => users.id,{onDelete : 'cascade'}),
    provider: t.text('provider').notNull(),
    providerUserId: t.text('provider_user_id').notNull(),
    passwordHash: t.text('password_hash'),
    accessToken: t.text('access_toke'),
    refreshToken: t.text('refresh_token'),
    expires: t.timestamp('expires'),
    createdAt: t.timestamp('created_at').defaultNow(),
},
    (table) => [
        t.uniqueIndex('uniqueIndex').on(table.provider, table.providerUserId)
    ]
)