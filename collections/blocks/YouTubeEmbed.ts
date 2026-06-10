import type { Block } from "payload";
import { getYouTubeVideoId } from "../../lib/youtube.ts";

export const YouTubeEmbedBlock: Block = {
  slug: "youtubeEmbed",
  interfaceName: "YouTubeEmbedBlock",
  labels: {
    singular: "Vídeo do YouTube",
    plural: "Vídeos do YouTube",
  },
  fields: [
    {
      name: "url",
      type: "text",
      label: "URL ou ID do vídeo",
      required: true,
      admin: {
        description:
          "Aceita youtube.com, youtu.be, youtube-nocookie.com ou o ID de 11 caracteres.",
      },
      validate: (value: unknown) =>
        typeof value === "string" && getYouTubeVideoId(value)
          ? true
          : "Informe uma URL ou ID válido do YouTube.",
    },
    {
      name: "title",
      type: "text",
      label: "Título acessível",
      admin: {
        description:
          "Usado no iframe para leitores de tela. Se ficar vazio, será usado um título padrão.",
      },
    },
    {
      name: "aspectRatio",
      type: "select",
      label: "Proporção",
      defaultValue: "16:9",
      options: [
        { label: "16:9", value: "16:9" },
        { label: "4:3", value: "4:3" },
        { label: "1:1", value: "1:1" },
      ],
    },
  ],
};
