import { motion } from "framer-motion";
import { Loader2, Star } from "lucide-react";
import { TestimonialCard } from "./TestimonialCard";
import { useTestimonials } from "@/hooks/useTestimonials";

interface TestimonialsBlockProps {
  courseId?: string;
  softwareId?: string;
  title?: string;
  limit?: number;
}

/** Admin-curated reviews shown on a course or software detail page. */
export function TestimonialsBlock({
  courseId,
  softwareId,
  title = "What people say",
  limit,
}: TestimonialsBlockProps) {
  const { testimonials, isLoading } = useTestimonials({ courseId, softwareId, limit });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <div>
      <h3 className="font-display text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
        <Star className="w-5 h-5 text-warning fill-warning" />
        {title}
      </h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <TestimonialCard testimonial={testimonial} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
