import { FullscreenEditorFeature } from "@payload-bites/fullscreen-editor";
import {
  BlocksFeature,
  FixedToolbarFeature,
  lexicalEditor,
  UploadFeature,
} from "@payloadcms/richtext-lexical";
import { YouTubeEmbedBlock } from "../blocks/YouTubeEmbed.ts";

export const createContentEditor = () =>
  lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter((feature) => feature.key !== "relationship"),
      FixedToolbarFeature(),
      // A biblioteca compartilhada aceita imagens e vídeos; o renderer separa os formatos.
      UploadFeature({
        collections: {
          media: {
            fields: [
              {
                name: "size",
                type: "select",
                label: "Tamanho da mídia",
                defaultValue: "normal",
                options: [
                  { label: "Pequena", value: "small" },
                  { label: "Normal", value: "normal" },
                  { label: "Grande", value: "large" },
                ],
              },
              {
                name: "alignment",
                type: "select",
                label: "Alinhamento",
                defaultValue: "center",
                options: [
                  { label: "Esquerda", value: "left" },
                  { label: "Centro", value: "center" },
                  { label: "Direita", value: "right" },
                ],
              },
              {
                name: "caption",
                type: "text",
                label: "Legenda",
              },
            ],
          },
        },
      }),
      BlocksFeature({
        blocks: [YouTubeEmbedBlock],
      }),
      FullscreenEditorFeature(),
    ],
  });
