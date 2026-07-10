import { getDb } from "~/db";
import {
  actionsTable,
  clubsTable,
  derbynamesTable,
  historyTable,
} from "~/db/schema";
import { and, asc, eq, sql, type SQL } from "drizzle-orm";
import type { APIEvent } from "@solidjs/start/server";
import type { PendingClubPayload } from "~/utils/pending-club";
import { DERBY_TYPES, isDerbyType, type DerbyType } from "~/utils/constants";
import { ensureUserIdByEmail } from "~/utils/users";

function derbynameEqualsInsensitiveByType(value: string, derbyType: DerbyType) {
  return and(
    sql`lower(${derbynamesTable.derbyname}) = ${value.trim().toLowerCase()}`,
    eq(derbynamesTable.derbyType, derbyType),
  );
}

function parseDerbyType(value: unknown): DerbyType | null {
  if (isDerbyType(value)) return value;
  return null;
}

export async function GET(event: APIEvent) {
  try {
    const db = getDb();
    const url = new URL(event.request.url);
    const clubIdFilter = url.searchParams.get("clubId")?.trim();
    const departmentFilter = url.searchParams.get("department")?.trim();
    const derbyTypeFilterRaw = url.searchParams.get("type")?.trim();
    const derbyTypeFilter = derbyTypeFilterRaw ? parseDerbyType(derbyTypeFilterRaw) : null;

    if (derbyTypeFilterRaw && !derbyTypeFilter) {
      return new Response(JSON.stringify({ error: "type invalide" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const conditions: SQL[] = [eq(derbynamesTable.emailConfirmed, true)];

    if (clubIdFilter && clubIdFilter !== "" && clubIdFilter !== "all") {
      conditions.push(eq(derbynamesTable.clubId, clubIdFilter));
    }
    if (departmentFilter && departmentFilter !== "" && departmentFilter !== "all") {
      conditions.push(eq(clubsTable.department, departmentFilter));
    }
    if (derbyTypeFilter) {
      conditions.push(eq(derbynamesTable.derbyType, derbyTypeFilter));
    }

    const names = await db
      .select({
        derbyname: derbynamesTable.derbyname,
        derbyType: derbynamesTable.derbyType,
        numRoster: derbynamesTable.numRoster,
        clubId: derbynamesTable.clubId,
        clubName: clubsTable.name,
        parentClubId: clubsTable.parentClubId,
        parentClubName: sql`${sql.raw(`parent_clubs.name`)}`.mapWith(String),
        department: clubsTable.department,
      })
      .from(derbynamesTable)
      .leftJoin(clubsTable, eq(derbynamesTable.clubId, clubsTable.id))
      .leftJoin(
        clubsTable.as('parent_clubs'),
        eq(clubsTable.parentClubId, clubsTable.as('parent_clubs').id),
      )
      .where(and(...conditions))
      .orderBy(asc(derbynamesTable.derbyname));

    const result = names.map((row) => ({
      derbyname: row.derbyname,
      derbyType: row.derbyType,
      numRoster: row.numRoster,
      clubId: row.clubId || null,
      clubName: row.clubName || null,
      parentClubId: row.parentClubId || null,
      parentClubName: row.parentClubName || null,
      department: row.department || null,
    }));

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching derbynames:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch derbynames" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    return await submitDerbynameAction(body);
  } catch (error: any) {
    console.error("Error creating derbyname:", error);
    return new Response(JSON.stringify({ error: error.message || "Erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function submitDerbynameAction(body: any): Promise<Response> {
  try {
    const {
      name: _name,
      numRoster: _numRoster,
      email: _email,
      club: _club,
      newClub: _newClub,
      clubOnly: _clubOnly,
      type: _type,
    } = body;

    const clubOnly = _clubOnly === true;

    const isNameValid = typeof _name === "string" && _name.length > 0;
    // numRoster est optionnel : absent ou vide = valide ; présent = max 4 caractères
    const isNumRosterValid =
      _numRoster == null ||
      _numRoster === "" ||
      (typeof _numRoster === "string" && _numRoster.length < 5);
    const isEmailValid =
      typeof _email === "string" &&
      _email.length > 0 &&
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}$/.test(_email);

    const regex = /<script|<ifr|<em|<img|javascript:/i;
    const numRosterStr = typeof _numRoster === "string" ? _numRoster : "";
    if (
      regex.test(_email) ||
      (!clubOnly && (regex.test(String(_name)) || (numRosterStr && regex.test(numRosterStr))))
    ) {
      return new Response(JSON.stringify({ error: "données invalides" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const name = typeof _name === "string" ? _name.trim() : "";
    const email = String(_email ?? "")
      .trim()
      .toLowerCase();
    const numRoster = typeof _numRoster === "string" ? _numRoster.trim() : "";
    const derbyType = parseDerbyType(_type) ?? DERBY_TYPES[0];

    if (_type != null && !parseDerbyType(_type)) {
      return new Response(JSON.stringify({ error: "type invalide" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let newClub: PendingClubPayload | null = null;
    if (_newClub && typeof _newClub === "object" && typeof _newClub.name === "string") {
      const nm = _newClub.name.trim();
      if (nm.length >= 2) {
        newClub = {
          name: nm,
          website: typeof _newClub.website === "string" ? _newClub.website.trim() : undefined,
          facebookUrl:
            typeof _newClub.facebookUrl === "string" ? _newClub.facebookUrl.trim() : undefined,
          instagramUrl:
            typeof _newClub.instagramUrl === "string" ? _newClub.instagramUrl.trim() : undefined,
          twitterUrl:
            typeof _newClub.twitterUrl === "string" ? _newClub.twitterUrl.trim() : undefined,
          logoUrl: typeof _newClub.logoUrl === "string" ? _newClub.logoUrl.trim() : undefined,
          department:
            typeof _newClub.department === "string" ? _newClub.department.trim() : undefined,
        };
        const blob = JSON.stringify(newClub);
        if (regex.test(blob)) {
          return new Response(JSON.stringify({ error: "données invalides (club)" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    }

    const club =
      _club?.id && !newClub ? { id: _club.id, name: _club.name || _club.id } : null;

    if (!isEmailValid) {
      return new Response(JSON.stringify({ error: "données invalides" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = getDb();
    const userId = await ensureUserIdByEmail(db, email);

    /** Changement de club uniquement : même derby name, confirmation par e-mail. */
    if (clubOnly) {
      if (!club || club.id === "autre") {
        if (!newClub || typeof newClub.name !== "string" || newClub.name.trim().length < 2) {
          return new Response(
            JSON.stringify({
              error:
                "indiquez un club dans la liste ou créez un club (nom d’au moins 2 caractères)",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      }

      const pendingClubJsonForChange = newClub
        ? JSON.stringify({ clubChangeOnly: true, newClub })
        : JSON.stringify({ clubChangeOnly: true, existingClubId: club!.id });

      const generatedCodeCo = Math.floor(100000 + Math.random() * 900000).toString();
      const emailTokenCo = Buffer.from(`${generatedCodeCo}-${Date.now()}`).toString("base64");
      const emailTokenExpiresAtCo = new Date(Date.now() + 20 * 60 * 1000);

      await db
        .delete(derbynamesTable)
        .where(
          and(
            eq(derbynamesTable.email, email),
            eq(derbynamesTable.derbyType, derbyType),
            eq(derbynamesTable.emailConfirmed, false),
          ),
        );

      const [confirmedOnly] = await db
        .select()
        .from(derbynamesTable)
        .where(
          and(
            eq(derbynamesTable.email, email),
            eq(derbynamesTable.derbyType, derbyType),
            eq(derbynamesTable.emailConfirmed, true),
          ),
        )
        .limit(1);

      if (!confirmedOnly) {
        return new Response(
          JSON.stringify({
            error: "aucun derby name confirmé pour cet e-mail — utilisez le formulaire complet",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      await db
        .update(derbynamesTable)
        .set({
          userId,
        })
        .where(
          and(
            eq(derbynamesTable.derbyname, confirmedOnly.derbyname),
            eq(derbynamesTable.derbyType, derbyType),
          ),
        );

      await db.insert(historyTable).values({
        derbyname: confirmedOnly.derbyname,
        action: "club_change_pending",
        field: "clubId",
        oldValue: confirmedOnly.clubId ?? "",
        newValue: pendingClubJsonForChange.slice(0, 500),
        changedBy: email,
      });

      await db
        .update(actionsTable)
        .set({
          status: "cancelled",
          completedAt: new Date(),
        })
        .where(
          and(
            eq(actionsTable.userId, userId),
            eq(actionsTable.actionType, "derbyname.confirm"),
            eq(actionsTable.status, "pending"),
          ),
        );

      await db.insert(actionsTable).values({
        userId,
        actionType: "derbyname.confirm",
        status: "pending",
        token: emailTokenCo,
        expiresAt: emailTokenExpiresAtCo,
        payload: JSON.stringify({
          derbyname: confirmedOnly.derbyname,
          derbyType,
          pendingClubJson: pendingClubJsonForChange,
          replacesDerbyname: null,
          clubOnly: true,
        }),
      });

      await sendConfirmationEmail(confirmedOnly.name, email, emailTokenCo);

      return new Response(
        JSON.stringify({
          player: {
            name: confirmedOnly.name,
            numRoster: confirmedOnly.numRoster,
            email,
            type: derbyType,
            clubOnly: true,
            derbyname: confirmedOnly.derbyname,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!isNameValid || !isNumRosterValid) {
      return new Response(JSON.stringify({ error: "données invalides" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const derbyKey = name.toLowerCase();

    const pendingClubJson = newClub ? JSON.stringify(newClub) : null;
    let clubId =
      club && club.id !== "autre" && !newClub ? club.id : null;

    if (newClub) {
      clubId = null;
    }

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const emailToken = Buffer.from(`${generatedCode}-${Date.now()}`).toString("base64");
    const emailTokenExpiresAt = new Date(Date.now() + 20 * 60 * 1000);

    const existingForEmail = await db
      .select()
      .from(derbynamesTable)
      .where(and(eq(derbynamesTable.email, email), eq(derbynamesTable.derbyType, derbyType)));

    const confirmedRow = existingForEmail.find((r) => r.emailConfirmed);

    if (confirmedRow) {
      await db
        .delete(derbynamesTable)
        .where(
          and(
            eq(derbynamesTable.email, email),
            eq(derbynamesTable.derbyType, derbyType),
            eq(derbynamesTable.emailConfirmed, false),
          ),
        );
      if (confirmedRow.derbyname.toLowerCase() === derbyKey) {
        return new Response(
          JSON.stringify({ error: "ce derby name est déjà le vôtre (déjà confirmé)" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const existingDerbyname = await db
        .select()
        .from(derbynamesTable)
        .where(derbynameEqualsInsensitiveByType(derbyKey, derbyType))
        .limit(1);

      if (
        existingDerbyname.length > 0 &&
        existingDerbyname[0].emailConfirmed &&
        existingDerbyname[0].email !== email
      ) {
        return new Response(JSON.stringify({ error: "nom déjà pris" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await db.insert(derbynamesTable).values({
        derbyname: name,
        name,
        derbyType,
        numRoster,
        email,
        userId,
        clubId,
        emailConfirmed: false,
      });

      await db.insert(historyTable).values({
        derbyname: name,
        action: "replacement_pending",
        field: "replacesDerbyname",
        oldValue: confirmedRow.derbyname,
        newValue: name,
        changedBy: email,
      });

      await db
        .update(actionsTable)
        .set({
          status: "cancelled",
          completedAt: new Date(),
        })
        .where(
          and(
            eq(actionsTable.userId, userId),
            eq(actionsTable.actionType, "derbyname.confirm"),
            eq(actionsTable.status, "pending"),
          ),
        );

      await db.insert(actionsTable).values({
        userId,
        actionType: "derbyname.confirm",
        status: "pending",
        token: emailToken,
        expiresAt: emailTokenExpiresAt,
        payload: JSON.stringify({
          derbyname: name,
          derbyType,
          pendingClubJson,
          replacesDerbyname: confirmedRow.derbyname,
        }),
      });

      await sendConfirmationEmail(name, email, emailToken);

      return new Response(
        JSON.stringify({
          player: {
            name,
            derbyType,
            numRoster,
            email,
            club: club ? { id: club.id, name: club.name } : null,
            newClub,
            emailConfirmed: false,
            replacementOf: confirmedRow.derbyname,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    await db
      .delete(derbynamesTable)
      .where(
        and(
          eq(derbynamesTable.email, email),
          eq(derbynamesTable.derbyType, derbyType),
          eq(derbynamesTable.emailConfirmed, false),
        ),
      );

    const existingDerbyname = await db
      .select()
      .from(derbynamesTable)
      .where(derbynameEqualsInsensitiveByType(derbyKey, derbyType))
      .limit(1);

    if (existingDerbyname.length > 0 && existingDerbyname[0].emailConfirmed) {
      return new Response(JSON.stringify({ error: "nom déjà pris" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      await db.insert(derbynamesTable).values({
        derbyname: name,
        name,
        derbyType,
        numRoster,
        email,
        userId,
        clubId,
        emailConfirmed: false,
      });
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        await db
          .update(derbynamesTable)
          .set({
            name,
            derbyType,
            numRoster,
            email,
            userId,
            clubId,
            emailConfirmed: false,
          })
          .where(derbynameEqualsInsensitiveByType(derbyKey, derbyType));
      } else {
        throw error;
      }
    }

    await db.insert(historyTable).values({
      derbyname: name,
      action: "created",
      field: null,
      oldValue: null,
      newValue: JSON.stringify({ name, numRoster, email, clubId, pendingClub: !!newClub }),
      changedBy: email,
    });

    await db
      .update(actionsTable)
      .set({
        status: "cancelled",
        completedAt: new Date(),
      })
      .where(
        and(
          eq(actionsTable.userId, userId),
          eq(actionsTable.actionType, "derbyname.confirm"),
          eq(actionsTable.status, "pending"),
        ),
      );

    await db.insert(actionsTable).values({
      userId,
      actionType: "derbyname.confirm",
      status: "pending",
      token: emailToken,
      expiresAt: emailTokenExpiresAt,
      payload: JSON.stringify({
        derbyname: name,
        derbyType,
        pendingClubJson,
        replacesDerbyname: null,
        newEntry: true,
      }),
    });

    await sendConfirmationEmail(name, email, emailToken);

    return new Response(
      JSON.stringify({
        player: {
          name,
          numRoster,
          email,
          club: club ? { id: club.id, name: club.name } : null,
          newClub,
          type: derbyType,
          emailConfirmed: false,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Error creating derbyname:", error);
    return new Response(JSON.stringify({ error: error.message || "Erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function sendConfirmationEmail(name: string, email: string, emailToken: string) {
  try {
    const emailUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/validate/${emailToken}`;
    const res = await fetch(process.env.EMAIL_API_URL || "", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.EMAIL_API_KEY || "",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Derbynames",
          email: process.env.EMAIL_FROM || "noreply@derbynames.ovh",
        },
        to: [
          {
            email: email,
            name: name,
          },
        ],
        subject: "DERBY NAME !",
        htmlContent: `<html>
            <head></head>
            <body>
              <h1>DERBY NAMES</h1>
              <h2>Confirmation de votre adresse email</h2>
              <p>Bonjour ${name},</p>
              <p>Vous avez récemment demandé à valider votre derbyname sur notre site. Pour confirmer votre adresse email et valider votre derbyname, veuillez cliquer sur le lien ci-dessous :</p>
              <a href="${emailUrl}">Confirmer mon adresse email et valider mon derbyname</a>
              <p>Cordialement,</p>
              <p>L'équipe Derbynames</p>
            </body>
          </html>`,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
      console.error("Error sending email:", errorData);
    } else {
      const data = await res.json();
      console.log("Email sent successfully:", data);
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
