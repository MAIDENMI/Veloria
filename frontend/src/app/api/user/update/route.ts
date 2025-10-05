import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { age, feeling, talkAbout, location, name } = body ?? {};

  try {
    await db
      .update(users)
      .set({
        age: age ?? null,
        feeling: feeling ?? null,
        talkAbout: talkAbout ?? null,
        location: location ?? null,
        name: name ?? undefined,
      })
      .where(eq(users.id, session.user.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("User update error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

