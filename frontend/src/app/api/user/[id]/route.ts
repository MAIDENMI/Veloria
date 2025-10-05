import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = (await getServerSession(authOptions as any)) as any;
  
  // Only allow users to fetch their own data
  if (!session?.user?.id || session.user.id !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await db.select().from(users).where(eq(users.id, id));
    const user = result[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      age: user.age,
      feeling: user.feeling,
      talkAbout: user.talkAbout,
      location: user.location,
      onboarded: user.onboarded,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
