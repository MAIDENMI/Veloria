"use client"
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Local state first to satisfy hooks order
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState("");
  const [talkAbout, setTalkAbout] = useState("");
  const [feeling, setFeeling] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch existing user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const res = await fetch(`/api/user/${session.user.id}`);
          if (res.ok) {
            const data = await res.json();
            setName(data.name || "");
            setAge(data.age || undefined);
            setLocation(data.location || "");
            setTalkAbout(data.talkAbout || "");
            setFeeling(data.feeling || 5);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    if (status === "authenticated") {
      fetchUserData();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, router]);

  const isValid = name.trim().length > 0 && age && location.trim().length > 0;

  if (status === "loading" || loading) {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <AnimatedGradientBackground audioLevel={0} isListening={false} />
        <div className="relative z-10 flex items-center justify-center h-full">
          <p className="text-white">Loading…</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, age, feeling, talkAbout, location }),
      });
      if (res.ok) {
        router.push("/");
      } else {
        alert("Failed to save details. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error; check console.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Gradient Background */}
      <AnimatedGradientBackground audioLevel={0} isListening={false} />
      
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back to Home</span>
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 gap-6">
        {/* Logo */}
        <Image 
          src="/velora.png" 
          alt="Velora" 
          width={300} 
          height={100}
          priority
          className="w-auto h-14 sm:h-16"
        />
        
        {/* Form Card */}
        <div className="backdrop-blur-2xl border rounded-2xl shadow-[0_36px_120px_-70px_rgba(15,15,15,0.18)] p-6 w-full max-w-2xl" style={{ background: "rgba(255, 255, 255, 0.5)" }}>
          <div className="mb-5 text-center">
            <h1 className="text-xl font-semibold tracking-tight mb-1">Edit Your Profile</h1>
            <p className="text-xs text-muted-foreground">
              Update your information and preferences
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Name and Age */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium">What is your name?</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium">What is your age?</label>
                <input
                  type="number"
                  min={13}
                  max={120}
                  value={age ?? ""}
                  onChange={(e)=>setAge(parseInt(e.target.value,10))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
                  required
                />
              </div>
            </div>

            {/* Row 2: Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium">Where are you joining me from?</label>
              <input 
                type="text" 
                value={location} 
                onChange={(e)=>setLocation(e.target.value)} 
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all" 
                placeholder="City, Country" 
                required 
              />
            </div>

            {/* Row 3: Feeling slider */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium">How are you feeling today? ({feeling})</label>
              <Slider min={1} max={10} step={1} value={[feeling]} onValueChange={(v)=>setFeeling(v[0])} />
            </div>

            {/* Row 4: Talk About */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium">What do you want to talk about today?</label>
              <textarea 
                rows={2} 
                value={talkAbout} 
                onChange={(e)=>setTalkAbout(e.target.value)} 
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white/70 backdrop-blur-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
                placeholder="e.g., stress, relationships, work..."
              />
            </div>

            <Button type="submit" disabled={!isValid || submitting} className="w-full mt-5">
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

