import { getDb } from "~/db";
import {
  clubsTable,
  derbynamesTable,
  historyTable,
} from "~/db/schema";
import { and, asc, eq, type SQL } from "drizzle-orm";
import type { APIEvent } from "@solidjs/start/server";
import type { PendingClubPayload } from "~/utils/pending-club";

export async function GET(event: APIEvent) {
  try {
    const db = getDb();
    const url = new URL(event.request.url);
    const clubIdFilter = url.searchParams.get("clubId")?.trim();
    const departmentFilter = url.searchParams.get("department")?.trim();

    const conditions: SQL[] = [eq(derbynamesTable.emailConfirmed, true)];

    if (clubIdFilter && clubIdFilter !== "" && clubIdFilter !== "all") {
      conditions.push(eq(derbynamesTable.clubId, clubIdFilter));
    }
    if (departmentFilter && departmentFilter !== "" && departmentFilter !== "all") {
      conditions.push(eq(clubsTable.department, departmentFilter));
    }

    const names = await db
      .select({
        derbyname: derbynamesTable.derbyname,
        numRoster: derbynamesTable.numRoster,
        clubName: clubsTable.name,
        department: clubsTable.department,
      })
      .from(derbynamesTable)
      .leftJoin(clubsTable, eq(derbynamesTable.clubId, clubsTable.id))
      .where(and(...conditions))
      .orderBy(asc(derbynamesTable.derbyname));

    const result = names.map((row) => ({
      derbyname: row.derbyname,
      numRoster: row.numRoster,
      clubName: row.clubName || null,
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
    const {
      name: _name,
      numRoster: _numRoster,
      email: _email,
      club: _club,
      newClub: _newClub,
    } = body;

    const isNameValid = typeof _name === "string" && _name.length > 0;
    const isNumRosterValid =
      typeof _numRoster === "string" &&
      _numRoster.length > 0 &&
      _numRoster.length < 5;
    const isEmailValid =
      typeof _email === "string" &&
      _email.length > 0 &&
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}$/.test(_email);

    const regex = /<script|<ifr|<em|<img|javascript:/i;
    if (regex.test(_name) || regex.test(_numRoster) || regex.test(_email)) {
      return new Response(JSON.stringify({ error: "données invalides" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const name = _name.trim();
    const email = _email.trim().toLowerCase();
    const numRoster = _numRoster.trim();

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

    if (!isNameValid || !isNumRosterValid || !isEmailValid) {
      return new Response(JSON.stringify({ error: "données invalides" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = getDb();
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
      .where(eq(derbynamesTable.email, email));

    const confirmedRow = existingForEmail.find((r) => r.emailConfirmed);

    if (confirmedRow) {
      await db
        .delete(derbynamesTable)
        .where(
          and(eq(derbynamesTable.email, email), eq(derbynamesTable.emailConfirmed, false)),
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
        .where(eq(derbynamesTable.derbyname, derbyKey))
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
        derbyname: derbyKey,
        name,
        numRoster,
        email,
        clubId,
        emailConfirmed: false,
        emailToken,
        emailTokenExpiresAt,
        pendingClubJson,
        replacesDerbyname: confirmedRow.derbyname,
      });

      await db.insert(historyTable).values({
        derbyname: derbyKey,
        action: "replacement_pending",
        field: "replacesDerbyname",
        oldValue: confirmedRow.derbyname,
        newValue: derbyKey,
        changedBy: email,
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
        and(eq(derbynamesTable.email, email), eq(derbynamesTable.emailConfirmed, false)),
      );

    const existingDerbyname = await db
      .select()
      .from(derbynamesTable)
      .where(eq(derbynamesTable.derbyname, derbyKey))
      .limit(1);

    if (existingDerbyname.length > 0 && existingDerbyname[0].emailConfirmed) {
      return new Response(JSON.stringify({ error: "nom déjà pris" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      await db.insert(derbynamesTable).values({
        derbyname: derbyKey,
        name,
        numRoster,
        email,
        clubId,
        emailConfirmed: false,
        emailToken,
        emailTokenExpiresAt,
        pendingClubJson,
        replacesDerbyname: null,
      });
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        await db
          .update(derbynamesTable)
          .set({
            name,
            numRoster,
            email,
            clubId,
            emailToken,
            emailTokenExpiresAt,
            emailConfirmed: false,
            pendingClubJson,
            replacesDerbyname: null,
          })
          .where(eq(derbynamesTable.derbyname, derbyKey));
      } else {
        throw error;
      }
    }

    await db.insert(historyTable).values({
      derbyname: derbyKey,
      action: "created",
      field: null,
      oldValue: null,
      newValue: JSON.stringify({ name, numRoster, email, clubId, pendingClub: !!newClub }),
      changedBy: email,
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
