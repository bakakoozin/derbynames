import { getDb } from "~/db";
import { derbynamesTable, clubsTable, historyTable } from "~/db/schema";
import { eq } from "drizzle-orm";
import { APIEvent } from "node_modules/@solidjs/start/dist/server/types";

export async function GET() {
  try {
    const db = getDb();
    const names = await db
      .select({
        derbyname: derbynamesTable.derbyname,
        numRoster: derbynamesTable.numRoster,
        clubName: clubsTable.name,
      })
      .from(derbynamesTable)
      .leftJoin(clubsTable, eq(derbynamesTable.clubId, clubsTable.id));

    // Transformer les résultats pour avoir clubName au lieu de clubName (qui peut être null)
    const result = names.map((row) => ({
      derbyname: row.derbyname,
      numRoster: row.numRoster,
      clubName: row.clubName || null,
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
    const { name: _name, numRoster: _numRoster, email: _email, club: _club } = body;

    // Validation des données
    const isNameValid = typeof _name === "string" && _name.length > 0;
    const isNumRosterValid = typeof _numRoster === "string" && _numRoster.length > 0 && _numRoster.length < 5;
    const isEmailValid = typeof _email === "string" && _email.length > 0 && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}$/.test(_email);

    // Vérification de sécurité (protection XSS)
    const regex = /<script|<ifr|<em|<img|javascript:/i;
    if (regex.test(_name) || regex.test(_numRoster) || regex.test(_email)) {
      return new Response(JSON.stringify({ error: "données invalides" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Nettoyage des données
    const name = _name.trim();
    const email = _email.trim().toLowerCase();
    const numRoster = _numRoster.trim();
    const club = _club?.id ? { id: _club.id, name: _club.name || _club.id } : null;

    if (!isNameValid || !isNumRosterValid || !isEmailValid) {
      return new Response(JSON.stringify({ error: "données invalides" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = getDb();

    // Vérifier si le derbyname existe déjà et est confirmé
    const existingDerbyname = await db
      .select()
      .from(derbynamesTable)
      .where(eq(derbynamesTable.derbyname, name.toLowerCase()))
      .limit(1);

    if (existingDerbyname.length > 0 && existingDerbyname[0].emailConfirmed) {
      return new Response(JSON.stringify({ error: "nom déjà pris" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }


    // Génération du code et du token
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const emailToken = Buffer.from(`${generatedCode}-${Date.now()}`).toString('base64');
    const emailTokenExpiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes

    // Déterminer le clubId (null si pas de club ou si club.id === 'autre')
    const clubId = club && club.id !== 'autre' ? club.id : null;

  // Vérifier aussi si l'email est déjà utilisé avec un derbyname confirmé
    const existingEmail = await db
      .select()
      .from(derbynamesTable)
      .where(eq(derbynamesTable.email, email))
      .limit(1);

    if (existingEmail.length > 0 && existingEmail[0].emailConfirmed) {

      // TODO:
      /* 
      -créer un lien avec le nouveau derbyname, numéro de roster, id club
      -envoyer un email avec le lien
      -le lien doit contenir le token d'email et le derbyname
      -nouveau endpoint pour gérer la confirmation de l'email avec le nouveau derbyname et save en base de données
      -modifier pour dire "ajouter / modifier derbyname"
      */
      return new Response(JSON.stringify({ error: "email déjà utilisé" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Insérer ou mettre à jour le derbyname
    try {
      await db.insert(derbynamesTable).values({
        derbyname: name.toLowerCase(),
        name,
        numRoster,
        email,
        clubId,
        emailConfirmed: false,
        emailToken,
        emailTokenExpiresAt,
      });
    } catch (error: any) {
      // Si le derbyname existe déjà mais n'est pas confirmé, on le met à jour
      if (error.code === 'ER_DUP_ENTRY') {
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
          })
          .where(eq(derbynamesTable.derbyname, name.toLowerCase()));
      } else {
        throw error;
      }
    }

    // Créer une entrée dans l'historique
    await db.insert(historyTable).values({
      derbyname: name.toLowerCase(),
      action: 'created',
      field: null,
      oldValue: null,
      newValue: JSON.stringify({ name, numRoster, email, clubId }),
      changedBy: email,
    });

    // Envoyer l'email de confirmation via Brevo
    try {
      const emailUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/validate/${emailToken}`;
      const res = await fetch(process.env.EMAIL_API_URL || '', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.EMAIL_API_KEY || '',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: 'Derbynames',
            email: process.env.EMAIL_FROM || 'noreply@derbynames.ovh'
          },
          to: [
            {
              email: email,
              name: name
            }
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
          </html>`
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        console.error("Error sending email:", errorData);
        // On continue même si l'email échoue, le derbyname est créé
      } else {
        const data = await res.json();
        console.log('Email sent successfully:', data);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      // On continue même si l'email échoue, le derbyname est créé
    }

    return new Response(JSON.stringify({
      player: { name, numRoster, email, club, emailConfirmed: false }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error creating derbyname:", error);
    return new Response(JSON.stringify({ error: error.message || "Erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

