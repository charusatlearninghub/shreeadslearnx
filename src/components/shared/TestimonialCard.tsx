import { useState } from "react";
import { Star, Quote, Play, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ResolvedTestimonial } from "@/hooks/useTestimonials";

const youtubeId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match?.[1] ?? null;
};

interface TestimonialCardProps {
  testimonial: ResolvedTestimonial;
  className?: string;
}

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  const [videoOpen, setVideoOpen] = useState(false);
  const ytId = testimonial.videoSrc ? youtubeId(testimonial.videoSrc) : null;

  return (
    <>
      <div
        className={cn(
          "h-full p-6 sm:p-8 bg-card rounded-2xl border border-border/50 shadow-card relative",
          className
        )}
      >
        <div className="absolute -top-4 left-6 sm:left-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <Quote className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>

        <div className="flex gap-1 mb-4 pt-2">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 text-warning fill-warning" />
          ))}
        </div>

        <p className="text-muted-foreground leading-relaxed mb-6 break-words">
          "{testimonial.review_text}"
        </p>

        {testimonial.videoSrc && (
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="w-4 h-4 fill-primary text-primary" />
            </span>
            Watch video review
          </button>
        )}

        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={testimonial.photoSrc || undefined} alt={testimonial.person_name} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
              {testimonial.person_name?.charAt(0) || <User className="w-5 h-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h4 className="font-semibold truncate">{testimonial.person_name}</h4>
            {testimonial.person_role && (
              <p className="text-sm text-muted-foreground truncate">{testimonial.person_role}</p>
            )}
          </div>
        </div>
      </div>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-base">{testimonial.person_name}'s review</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            {ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                title="Video review"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : testimonial.videoSrc ? (
              <video src={testimonial.videoSrc} controls playsInline className="w-full h-full" />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
