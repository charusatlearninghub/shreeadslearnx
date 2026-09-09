import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Testimonial {
  id: string;
  person_name: string;
  person_role: string | null;
  photo_url: string | null;
  video_url: string | null;
  rating: number;
  review_text: string;
  target_type: "general" | "course" | "software";
  course_id: string | null;
  software_id: string | null;
  is_published: boolean;
  order_index: number;
  created_at: string;
}

export interface ResolvedTestimonial extends Testimonial {
  photoSrc: string | null;
  videoSrc: string | null;
}

const SIGNED_URL_TTL = 60 * 60;

const isExternal = (value: string) => /^https?:\/\//i.test(value);

/** Turns a stored value (bucket path or external URL) into a usable src. */
export async function resolveMedia(value: string | null): Promise<string | null> {
  if (!value) return null;
  if (isExternal(value)) return value;
  const { data } = await supabase.storage
    .from("testimonials")
    .createSignedUrl(value, SIGNED_URL_TTL);
  return data?.signedUrl ?? null;
}

export async function resolveTestimonials(rows: Testimonial[]): Promise<ResolvedTestimonial[]> {
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      photoSrc: await resolveMedia(row.photo_url),
      videoSrc: await resolveMedia(row.video_url),
    }))
  );
}

interface Options {
  /** Filter to a specific course */
  courseId?: string;
  /** Filter to a specific software product */
  softwareId?: string;
  /** Only general (home page) testimonials */
  generalOnly?: boolean;
  limit?: number;
}

export function useTestimonials({ courseId, softwareId, generalOnly, limit }: Options = {}) {
  const [testimonials, setTestimonials] = useState<ResolvedTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("testimonials")
        .select("*")
        .eq("is_published", true)
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });

      if (courseId) query = query.eq("course_id", courseId);
      if (softwareId) query = query.eq("software_id", softwareId);
      if (generalOnly) query = query.eq("target_type", "general");
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      setTestimonials(await resolveTestimonials((data ?? []) as Testimonial[]));
    } catch (error) {
      console.error("Error loading testimonials:", error);
      setTestimonials([]);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, softwareId, generalOnly, limit]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { testimonials, isLoading, refetch: fetchAll };
}
