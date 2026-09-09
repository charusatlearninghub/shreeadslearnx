CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name text NOT NULL,
  person_role text,
  photo_url text,
  video_url text,
  rating integer NOT NULL DEFAULT 5,
  review_text text NOT NULL,
  target_type text NOT NULL DEFAULT 'general',
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  software_id uuid REFERENCES public.software_products(id) ON DELETE CASCADE,
  is_published boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT testimonials_rating_range CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT testimonials_target_type_valid CHECK (target_type IN ('general','course','software'))
);

GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published testimonials"
ON public.testimonials FOR SELECT
USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins can manage testimonials"
ON public.testimonials FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE INDEX idx_testimonials_course ON public.testimonials(course_id);
CREATE INDEX idx_testimonials_software ON public.testimonials(software_id);

CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();