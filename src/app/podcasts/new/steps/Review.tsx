"use client";

import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { motion } from "framer-motion";
import { PodcastFormData } from "@/types/podcast";
import { defaultArtwork } from "@/lib/data";

type ReviewProps = {
  formData: PodcastFormData;
  onEdit: (step: number) => void;
  isLoading: boolean;
};

export default function Review({ formData, onEdit, isLoading }: ReviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Review & Create</h2>
        <p className="text-gray-600">Everything look good?</p>
      </div>

      <Card className="border-2 border-gray-200">
        <CardBody className="p-6 space-y-6">
          {/* Artwork & Title */}
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
              {formData.artwork ? (
                <Image
                  src={formData.artwork}
                  alt={formData.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  {defaultArtwork()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{formData.title}</h3>
                  <p className="text-gray-600 text-sm">
                    /{formData.podcast_name}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="light"
                  color="primary"
                  onPress={() => onEdit(1)}
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t pt-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-700">Description</h4>
              <Button
                size="sm"
                variant="light"
                color="primary"
                onPress={() => onEdit(2)}
              >
                Edit
              </Button>
            </div>
            <p className="text-gray-600">{formData.description}</p>
          </div>

          {/* Author & Contact */}
          <div className="border-t pt-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-700">Creator Details</h4>
              <Button
                size="sm"
                variant="light"
                color="primary"
                onPress={() => onEdit(3)}
              >
                Edit
              </Button>
            </div>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-500">Author:</span>{" "}
                <span className="text-gray-700">{formData.author}</span>
              </p>
              <p>
                <span className="text-gray-500">Email:</span>{" "}
                <span className="text-gray-700">{formData.email}</span>
              </p>
              {formData.website && (
                <p>
                  <span className="text-gray-500">Website:</span>{" "}
                  <a
                    href={formData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {formData.website}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="border-t pt-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-700">Categories & Details</h4>
              <Button
                size="sm"
                variant="light"
                color="primary"
                onPress={() => onEdit(5)}
              >
                Edit
              </Button>
            </div>
            <div className="space-y-3">
              {formData.categories && formData.categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.categories.map((category) => (
                    <Chip key={category} color="primary" variant="flat">
                      {category}
                    </Chip>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No categories selected</p>
              )}
              {formData.explicit && (
                <Chip color="warning" variant="flat" size="sm">
                  Explicit Content
                </Chip>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
