import type { MetadataRoute } from "next";
import { createRobotsMetadata } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return createRobotsMetadata();
}
