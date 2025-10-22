"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

import { useAuth } from "@/providers/Providers";
import { useWizard } from "@/hooks/useWizard";
import { useFormPersistence } from "@/hooks/useFormPersistence";
import { supabase } from "@/lib/supabase";
import { PodcastFormData } from "@/types/podcast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import WizardProgress from "@/components/ui/WizardProgress";

import BasicInfo from "./steps/BasicInfo";
import Description from "./steps/Description";
import AuthorContact from "./steps/AuthorContact";
import Artwork from "./steps/Artwork";
import Categories from "./steps/Categories";
import Review from "./steps/Review";

const TOTAL_STEPS = 6;
const STEP_LABELS = ["Title", "Description", "Author", "Artwork", "Categories", "Review"];

function PodcastWizardContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { currentStep, nextStep, previousStep, goToStep, isFirstStep, isLastStep } =
    useWizard(TOTAL_STEPS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { formData, setFormData, clearPersistedData } = useFormPersistence<PodcastFormData>(
    "podcast-wizard",
    {
      title: "",
      podcast_name: "",
      description: "",
      author: "",
      email: "",
      website: "",
      artwork: "",
      categories: [],
      explicit: false,
    }
  );

  // Auth protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("podcasts")
        .insert({
          ...formData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to create podcast");
        console.error(error);
        return;
      }

      // Success!
      triggerConfetti();
      clearPersistedData();
      toast.success("Podcast created successfully! 🎉");

      // Get username for navigation
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      // Navigate to the new podcast
      setTimeout(() => {
        if (profile?.username && data.podcast_name) {
          router.push(`/${profile.username}/${data.podcast_name}`);
        } else {
          router.push("/podcasts");
        }
      }, 1000);
    } catch (err) {
      console.error("Error creating podcast:", err);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.title.trim().length > 0;
      case 2:
        return formData.description && formData.description.trim().length > 0;
      case 3:
        return (
          formData.author &&
          formData.author.trim().length > 0 &&
          formData.email &&
          formData.email.includes("@")
        );
      case 4:
        return true; // Artwork is optional
      case 5:
        return true; // Categories are optional
      case 6:
        return true; // Review step
      default:
        return false;
    }
  };

  if (authLoading || !user) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="light"
            onPress={() => router.push("/podcasts")}
            className="mb-4"
          >
            ← Back to Podcasts
          </Button>
          <h1 className="text-4xl font-bold">Create New Podcast</h1>
        </div>

        {/* Progress Indicator */}
        <WizardProgress
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          stepLabels={STEP_LABELS}
        />

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <BasicInfo
                key="step-1"
                formData={formData}
                setFormData={setFormData}
                onNext={nextStep}
              />
            )}
            {currentStep === 2 && (
              <Description
                key="step-2"
                formData={formData}
                setFormData={setFormData}
                onNext={nextStep}
              />
            )}
            {currentStep === 3 && (
              <AuthorContact
                key="step-3"
                formData={formData}
                setFormData={setFormData}
                onNext={nextStep}
              />
            )}
            {currentStep === 4 && (
              <Artwork
                key="step-4"
                formData={formData}
                setFormData={setFormData}
                onNext={nextStep}
              />
            )}
            {currentStep === 5 && (
              <Categories
                key="step-5"
                formData={formData}
                setFormData={setFormData}
                onNext={nextStep}
              />
            )}
            {currentStep === 6 && (
              <Review
                key="step-6"
                formData={formData}
                onEdit={goToStep}
                isLoading={isSubmitting}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="flat"
            onPress={previousStep}
            isDisabled={isFirstStep}
            size="lg"
          >
            ← Previous
          </Button>

          <div className="text-sm text-gray-500">
            Step {currentStep} of {TOTAL_STEPS}
          </div>

          {!isLastStep ? (
            <Button
              color="primary"
              onPress={nextStep}
              isDisabled={!canProceed()}
              size="lg"
            >
              Next →
            </Button>
          ) : (
            <Button
              color="success"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              size="lg"
              className="font-semibold"
            >
              Create Podcast 🎉
            </Button>
          )}
        </div>

        {/* Keyboard hint */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Press <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> to continue
        </div>
      </div>
    </div>
  );
}

export default function PodcastWizardPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading wizard..." />}>
      <PodcastWizardContent />
    </Suspense>
  );
}
