import { useEffect, useState } from "react";
import { Loader2, Plus, Star, Trash2, Pencil, Upload, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  resolveTestimonials,
  type ResolvedTestimonial,
  type Testimonial,
} from "@/hooks/useTestimonials";

type TargetType = "general" | "course" | "software";

interface Option {
  id: string;
  title: string;
}

const emptyForm = {
  id: "",
  personName: "",
  personRole: "",
  rating: "5",
  reviewText: "",
  targetType: "general" as TargetType,
  courseId: "",
  softwareId: "",
  photoPath: "",
  videoPath: "",
  videoLink: "",
  isPublished: true,
  orderIndex: "0",
};

export default function AdminTestimonials() {
  const { user } = useAuth();
  const [items, setItems] = useState<ResolvedTestimonial[]>([]);
  const [courses, setCourses] = useState<Option[]>([]);
  const [software, setSoftware] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState<"photo" | "video" | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // individual field state
  const [id, setId] = useState("");
  const [personName, setPersonName] = useState("");
  const [personRole, setPersonRole] = useState("");
  const [rating, setRating] = useState("5");
  const [reviewText, setReviewText] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("general");
  const [courseId, setCourseId] = useState("");
  const [softwareId, setSoftwareId] = useState("");
  const [photoPath, setPhotoPath] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [videoPath, setVideoPath] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [orderIndex, setOrderIndex] = useState("0");

  const resetForm = () => {
    setId(emptyForm.id);
    setPersonName(emptyForm.personName);
    setPersonRole(emptyForm.personRole);
    setRating(emptyForm.rating);
    setReviewText(emptyForm.reviewText);
    setTargetType(emptyForm.targetType);
    setCourseId(emptyForm.courseId);
    setSoftwareId(emptyForm.softwareId);
    setPhotoPath("");
    setPhotoPreview("");
    setVideoPath("");
    setVideoLink("");
    setIsPublished(true);
    setOrderIndex("0");
  };

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [testimonialsRes, coursesRes, softwareRes] = await Promise.all([
        supabase
          .from("testimonials")
          .select("*")
          .order("order_index", { ascending: true })
          .order("created_at", { ascending: false }),
        supabase.from("courses").select("id, title").order("title"),
        supabase.from("software_products").select("id, title").order("title"),
      ]);

      if (testimonialsRes.error) throw testimonialsRes.error;
      setItems(await resolveTestimonials((testimonialsRes.data ?? []) as Testimonial[]));
      setCourses((coursesRes.data ?? []) as Option[]);
      setSoftware((softwareRes.data ?? []) as Option[]);
    } catch (error) {
      console.error(error);
      toast.error("Could not load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openNew = () => {
    resetForm();
    setIsOpen(true);
  };

  const openEdit = (item: ResolvedTestimonial) => {
    setId(item.id);
    setPersonName(item.person_name);
    setPersonRole(item.person_role ?? "");
    setRating(String(item.rating));
    setReviewText(item.review_text);
    setTargetType(item.target_type);
    setCourseId(item.course_id ?? "");
    setSoftwareId(item.software_id ?? "");
    const photo = item.photo_url ?? "";
    setPhotoPath(photo);
    setPhotoPreview(item.photoSrc ?? "");
    const video = item.video_url ?? "";
    if (/^https?:\/\//i.test(video)) {
      setVideoLink(video);
      setVideoPath("");
    } else {
      setVideoPath(video);
      setVideoLink("");
    }
    setIsPublished(item.is_published);
    setOrderIndex(String(item.order_index));
    setIsOpen(true);
  };

  const handleUpload = async (file: File, kind: "photo" | "video") => {
    setUploading(kind);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${kind}s/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("testimonials")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;

      if (kind === "photo") {
        setPhotoPath(path);
        const { data } = await supabase.storage
          .from("testimonials")
          .createSignedUrl(path, 3600);
        setPhotoPreview(data?.signedUrl ?? "");
      } else {
        setVideoPath(path);
        setVideoLink("");
      }
      toast.success(`${kind === "photo" ? "Photo" : "Video"} uploaded`);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    if (!personName.trim()) return toast.error("Enter the person's name");
    if (reviewText.trim().length < 10) return toast.error("Write at least 10 characters");
    if (targetType === "course" && !courseId) return toast.error("Select a course");
    if (targetType === "software" && !softwareId) return toast.error("Select a software");

    setIsSaving(true);
    try {
      const payload = {
        person_name: personName.trim(),
        person_role: personRole.trim() || null,
        rating: Number(rating) || 5,
        review_text: reviewText.trim(),
        target_type: targetType,
        course_id: targetType === "course" ? courseId : null,
        software_id: targetType === "software" ? softwareId : null,
        photo_url: photoPath || null,
        video_url: videoPath || videoLink.trim() || null,
        is_published: isPublished,
        order_index: Number(orderIndex) || 0,
        created_by: user?.id ?? null,
      };

      const { error } = id
        ? await supabase.from("testimonials").update(payload).eq("id", id)
        : await supabase.from("testimonials").insert(payload);
      if (error) throw error;

      toast.success(id ? "Review updated" : "Review added");
      setIsOpen(false);
      resetForm();
      fetchAll();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Could not save review");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", deleteId);
      if (error) throw error;
      toast.success("Review deleted");
      setItems((prev) => prev.filter((i) => i.id !== deleteId));
    } catch (error: any) {
      toast.error(error?.message || "Could not delete review");
    } finally {
      setDeleteId(null);
    }
  };

  const targetLabel = (item: ResolvedTestimonial) => {
    if (item.target_type === "course")
      return courses.find((c) => c.id === item.course_id)?.title ?? "Course";
    if (item.target_type === "software")
      return software.find((s) => s.id === item.software_id)?.title ?? "Software";
    return "Home page";
  };

  return (
    <AdminLayout
      title="Featured Reviews"
      subtitle="Add reviews with a photo, video and name — shown on the home page, course and software pages"
      actions={
        <Button onClick={openNew} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Review
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No featured reviews yet. Add your first one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-11 h-11">
                    <AvatarImage src={item.photoSrc || undefined} alt={item.person_name} />
                    <AvatarFallback>{item.person_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.person_name}</p>
                    {item.person_role && (
                      <p className="text-xs text-muted-foreground truncate">{item.person_role}</p>
                    )}
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-warning fill-warning" />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 break-words">
                  {item.review_text}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{targetLabel(item)}</Badge>
                  {item.videoSrc && <Badge variant="outline">Video</Badge>}
                  <Badge variant={item.is_published ? "default" : "outline"}>
                    {item.is_published ? "Published" : "Hidden"}
                  </Badge>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{id ? "Edit review" : "Add review"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="tname">Person's name *</Label>
              <Input
                id="tname"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="e.g. Ravi Sharma"
              />
            </div>

            <div>
              <Label htmlFor="trole">Role / subtitle</Label>
              <Input
                id="trole"
                value={personRole}
                onChange={(e) => setPersonRole(e.target.value)}
                placeholder="e.g. Digital Marketer"
              />
            </div>

            <div>
              <Label>Review is for</Label>
              <Select value={targetType} onValueChange={(v: TargetType) => setTargetType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Home page (general)</SelectItem>
                  <SelectItem value="course">A course</SelectItem>
                  <SelectItem value="software">A software</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {targetType === "course" && (
              <div>
                <Label>Select course *</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {targetType === "software" && (
              <div>
                <Label>Select software *</Label>
                <Select value={softwareId} onValueChange={setSoftwareId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a software" />
                  </SelectTrigger>
                  <SelectContent>
                    {software.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Rating</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {r} star{r > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ttext">Review text *</Label>
              <Textarea
                id="ttext"
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did they say?"
              />
            </div>

            <div>
              <Label>Photo</Label>
              <div className="flex items-center gap-3 mt-1">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={photoPreview || undefined} />
                  <AvatarFallback>{personName.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, "photo");
                      e.target.value = "";
                    }}
                  />
                  <span className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-input px-3 py-2 text-sm cursor-pointer hover:bg-accent">
                    {uploading === "photo" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Upload photo
                  </span>
                </label>
                {photoPath && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setPhotoPath("");
                      setPhotoPreview("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label>Video (optional)</Label>
              <div className="mt-1 space-y-2">
                <label className="block">
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, "video");
                      e.target.value = "";
                    }}
                  />
                  <span className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-input px-3 py-2 text-sm cursor-pointer hover:bg-accent">
                    {uploading === "video" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {videoPath ? "Replace uploaded video" : "Upload video"}
                  </span>
                </label>
                {videoPath && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">Video uploaded</span>
                    <Button variant="ghost" size="sm" onClick={() => setVideoPath("")}>
                      Remove
                    </Button>
                  </div>
                )}
                <Input
                  value={videoLink}
                  onChange={(e) => {
                    setVideoLink(e.target.value);
                    if (e.target.value) setVideoPath("");
                  }}
                  placeholder="…or paste a YouTube link"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="torder">Display order</Label>
                <Input
                  id="torder"
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                <span className="text-sm">Published</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || uploading !== null}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {id ? "Save changes" : "Add review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
