"use client";

import type { NSFWJS, PredictionType } from "nsfwjs/core";
import type { NsfwPrediction } from "@/lib/marketplace/safety-signals";

let modelPromise: Promise<NSFWJS> | null = null;

async function getModel() {
  if (!modelPromise) {
    modelPromise = Promise.all([
      import("@tensorflow/tfjs"),
      import("nsfwjs/core"),
      import("nsfwjs/models/mobilenet_v2"),
    ]).then(async ([tf, core, definition]) => {
      await tf.ready();
      return core.load("MobileNetV2", {
        modelDefinitions: [definition.MobileNetV2Model],
      });
    });
  }
  return modelPromise;
}

function loadImage(file: File) {
  return new Promise<{ image: HTMLImageElement; objectUrl: string }>(
    (resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => resolve({ image, objectUrl });
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("The selected image could not be decoded."));
      };
      image.src = objectUrl;
    },
  );
}

function validPredictions(
  predictions: PredictionType[],
): NsfwPrediction[] | null {
  const classes = ["Drawing", "Hentai", "Neutral", "Porn", "Sexy"] as const;
  if (
    predictions.length !== classes.length ||
    !classes.every((name) =>
      predictions.some((prediction) => prediction.className === name),
    )
  ) {
    return null;
  }
  return predictions.map((prediction) => ({
    className: prediction.className,
    probability: prediction.probability,
  }));
}

export async function scanBikePhotos(files: File[]) {
  if (files.length === 0) return [];
  const model = await getModel();
  const results: Array<NsfwPrediction[] | null> = [];

  for (const file of files) {
    let objectUrl = "";
    try {
      const loaded = await loadImage(file);
      objectUrl = loaded.objectUrl;
      const predictions = await model.classify(loaded.image, 5);
      results.push(validPredictions(predictions));
    } catch {
      results.push(null);
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }

  return results;
}
