import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Upload, Loader2, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

const TIMEZONES = [
  "UTC",
  "Africa/Maputo",
  "Africa/Luanda",
  "Europe/Lisbon",
  "Europe/London",
  "America/New_York",
  "America/Sao_Paulo",
];

const STEP_TITLES = [
  "Basic Information",
  "Contact Details",
  "Logo & Branding",
  "Review & Create",
];

const restaurantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  slug: z.string().min(2, "Slug must be at least 2 characters").max(100, "Slug is too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  address: z.string().min(5, "Address must be at least 5 characters").max(200, "Address is too long").optional(),
  phone: z.string().min(5, "Phone must be at least 5 characters").max(20, "Phone is too long").optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  timezone: z.string(),
  currency: z.string(),
  logo: z.any().optional(),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

interface CreateRestaurantFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateRestaurantForm = ({ onSuccess, onCancel }: CreateRestaurantFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      slug: "",
      address: "",
      phone: "",
      email: "",
      timezone: "Africa/Maputo",
      currency: "MZN",
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setLogoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
  });

  const generateSlug = async () => {
    const name = form.getValues("name");
    if (!name) return;

    try {
      const { data, error } = await supabase.rpc("generate_restaurant_slug", {
        restaurant_name: name,
      });

      if (error) throw error;
      form.setValue("slug", data);
    } catch (error: any) {
      toast({
        title: "Error generating slug",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const uploadLogo = async (userId: string): Promise<string | null> => {
    if (!logoFile) return null;

    try {
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("restaurant-logos")
        .upload(fileName, logoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("restaurant-logos")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      return null;
    }
  };

  const onSubmit = async (data: RestaurantFormData) => {
    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload logo if provided
      const logoUrl = await uploadLogo(user.id);

      // Create restaurant
      const { data: restaurant, error: restaurantError } = await supabase
        .from("restaurants")
        .insert({
          owner_id: user.id,
          name: data.name,
          slug: data.slug,
          address: data.address || null,
          phone: data.phone || null,
          email: data.email || null,
          logo_url: logoUrl,
          timezone: data.timezone,
          currency: data.currency,
        })
        .select()
        .single();

      if (restaurantError) throw restaurantError;

      // Create default menu
      const { error: menuError } = await supabase
        .from("menus")
        .insert({
          restaurant_id: restaurant.id,
          title: "Main Menu",
          description: "Our delicious menu",
          is_active: true,
        });

      if (menuError) throw menuError;

      toast({
        title: "Restaurant created!",
        description: "Your restaurant has been successfully set up.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error creating restaurant",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof RestaurantFormData)[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ["name", "slug"];
        break;
      case 1:
        fieldsToValidate = ["address", "phone", "email"];
        break;
      case 2:
        fieldsToValidate = ["timezone", "currency"];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && currentStep < STEP_TITLES.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / STEP_TITLES.length) * 100;

  return (
    <Card className="max-w-3xl mx-auto shadow-medium">
      <CardHeader>
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {STEP_TITLES.map((title, index) => (
              <span
                key={index}
                className={index === currentStep ? "text-primary font-medium" : ""}
              >
                {title}
              </span>
            ))}
          </div>
        </div>
        <CardTitle>Create Your Restaurant</CardTitle>
        <CardDescription>Step {currentStep + 1} of {STEP_TITLES.length}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="La Bella Pizzeria"
                  onBlur={generateSlug}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="slug"
                    {...form.register("slug")}
                    placeholder="la-bella-pizzeria"
                  />
                  <Button type="button" variant="outline" onClick={generateSlug} size="sm">
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your restaurant will be accessible at: pratodigital.app/{form.watch("slug") || "your-slug"}
                </p>
                {form.formState.errors.slug && (
                  <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  {...form.register("address")}
                  placeholder="123 Main Street, City, Country"
                  rows={3}
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="+258 84 123 4567"
                  type="tel"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  {...form.register("email")}
                  placeholder="contact@restaurant.com"
                  type="email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Logo & Settings */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="space-y-2">
                <Label>Restaurant Logo</Label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-smooth ${
                    isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  {logoPreview ? (
                    <div className="space-y-4">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-h-40 mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogoFile(null);
                          setLogoPreview(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {isDragActive ? "Drop your logo here" : "Drag & drop your logo, or click to select"}
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone *</Label>
                  <Select
                    value={form.watch("timezone")}
                    onValueChange={(value) => form.setValue("timezone", value)}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select
                    value={form.watch("currency")}
                    onValueChange={(value) => form.setValue("currency", value)}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MZN">MZN - Mozambican Metical</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="AOA">AOA - Angolan Kwanza</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Review Your Information</h3>
                <div className="grid gap-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Restaurant Name:</span>
                    <span className="font-medium">{form.watch("name")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">URL Slug:</span>
                    <span className="font-medium">{form.watch("slug")}</span>
                  </div>
                  {form.watch("address") && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="font-medium text-right">{form.watch("address")}</span>
                    </div>
                  )}
                  {form.watch("phone") && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{form.watch("phone")}</span>
                    </div>
                  )}
                  {form.watch("email") && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{form.watch("email")}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Timezone:</span>
                    <span className="font-medium">{form.watch("timezone")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Currency:</span>
                    <span className="font-medium">{form.watch("currency")}</span>
                  </div>
                  {logoPreview && (
                    <div className="py-2">
                      <span className="text-muted-foreground block mb-2">Logo:</span>
                      <img src={logoPreview} alt="Logo" className="h-20 rounded-lg" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 0 ? onCancel : prevStep}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 0 ? "Cancel" : "Previous"}
            </Button>
            {currentStep < STEP_TITLES.length - 1 ? (
              <Button type="button" onClick={nextStep} className="gradient-primary">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" className="gradient-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Restaurant
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
