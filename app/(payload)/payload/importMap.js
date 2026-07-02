import { FullscreenEditorFeatureClient as FullscreenEditorFeatureClient_aeed5a2881deb7b13c89da9886072b38 } from "@payload-bites/fullscreen-editor/client";
import { ImageSearch as ImageSearch_18763abdf72285ba4b0ce56755000778 } from "@payload-bites/image-search/client";
import { FolderTypeField as FolderTypeField_2b8867833a34864a02ddf429b0728a40 } from "@payloadcms/next/client";
import {
  CollectionCards as CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1,
  FolderField as FolderField_f9c02e79a4aed9a3924487c0cd4cafb1,
  FolderTableCell as FolderTableCell_f9c02e79a4aed9a3924487c0cd4cafb1,
} from "@payloadcms/next/rsc";
import {
  CollectionField as CollectionField_cdf7e044479f899a31f804427d568b36,
  ExportListMenuItem as ExportListMenuItem_cdf7e044479f899a31f804427d568b36,
  ExportPreview as ExportPreview_cdf7e044479f899a31f804427d568b36,
  ExportSaveButton as ExportSaveButton_cdf7e044479f899a31f804427d568b36,
  FieldsToExport as FieldsToExport_cdf7e044479f899a31f804427d568b36,
  FormatField as FormatField_cdf7e044479f899a31f804427d568b36,
  ImportExportProvider as ImportExportProvider_cdf7e044479f899a31f804427d568b36,
  ImportListMenuItem as ImportListMenuItem_cdf7e044479f899a31f804427d568b36,
  ImportPreview as ImportPreview_cdf7e044479f899a31f804427d568b36,
  ImportSaveButton as ImportSaveButton_cdf7e044479f899a31f804427d568b36,
  LimitField as LimitField_cdf7e044479f899a31f804427d568b36,
  Page as Page_cdf7e044479f899a31f804427d568b36,
  SelectionToUseField as SelectionToUseField_cdf7e044479f899a31f804427d568b36,
  SortBy as SortBy_cdf7e044479f899a31f804427d568b36,
  SortOrder as SortOrder_cdf7e044479f899a31f804427d568b36,
} from "@payloadcms/plugin-import-export/rsc";
import {
  LinkToDoc as LinkToDoc_aead06e4cbf6b2620c5c51c9ab283634,
  ReindexButton as ReindexButton_aead06e4cbf6b2620c5c51c9ab283634,
} from "@payloadcms/plugin-search/client";
import {
  MetaDescriptionComponent as MetaDescriptionComponent_a8a977ebc872c5d5ea7ee689724c0860,
  MetaImageComponent as MetaImageComponent_a8a977ebc872c5d5ea7ee689724c0860,
  MetaTitleComponent as MetaTitleComponent_a8a977ebc872c5d5ea7ee689724c0860,
  OverviewComponent as OverviewComponent_a8a977ebc872c5d5ea7ee689724c0860,
  PreviewComponent as PreviewComponent_a8a977ebc872c5d5ea7ee689724c0860,
} from "@payloadcms/plugin-seo/client";
import {
  AlignFeatureClient as AlignFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  BlockquoteFeatureClient as BlockquoteFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  BlocksFeatureClient as BlocksFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  BoldFeatureClient as BoldFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  ChecklistFeatureClient as ChecklistFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  FixedToolbarFeatureClient as FixedToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  HeadingFeatureClient as HeadingFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  HorizontalRuleFeatureClient as HorizontalRuleFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  IndentFeatureClient as IndentFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  InlineCodeFeatureClient as InlineCodeFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  InlineToolbarFeatureClient as InlineToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  ItalicFeatureClient as ItalicFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  LinkFeatureClient as LinkFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  OrderedListFeatureClient as OrderedListFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  ParagraphFeatureClient as ParagraphFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  StrikethroughFeatureClient as StrikethroughFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  SubscriptFeatureClient as SubscriptFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  SuperscriptFeatureClient as SuperscriptFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  UnderlineFeatureClient as UnderlineFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  UnorderedListFeatureClient as UnorderedListFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  UploadFeatureClient as UploadFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
} from "@payloadcms/richtext-lexical/client";
import {
  LexicalDiffComponent as LexicalDiffComponent_44fe37237e0ebf4470c9990d8cb7b07e,
  RscEntryLexicalCell as RscEntryLexicalCell_44fe37237e0ebf4470c9990d8cb7b07e,
  RscEntryLexicalField as RscEntryLexicalField_44fe37237e0ebf4470c9990d8cb7b07e,
} from "@payloadcms/richtext-lexical/rsc";
import { AzureClientUploadHandler as AzureClientUploadHandler_635fb302eaf52f6baca4f9f8ad9ce104 } from "@payloadcms/storage-azure/client";
import {
  MediaPreview as MediaPreview_3df7154bbd817bf4bc10925ce5a97d5b,
  MediaPreviewCell as MediaPreviewCell_3df7154bbd817bf4bc10925ce5a97d5b,
} from "@seshuk/payload-media-preview/rsc";

/** @type import('payload').ImportMap */
export const importMap = {
  "@payloadcms/richtext-lexical/rsc#RscEntryLexicalCell":
    RscEntryLexicalCell_44fe37237e0ebf4470c9990d8cb7b07e,
  "@payloadcms/richtext-lexical/rsc#RscEntryLexicalField":
    RscEntryLexicalField_44fe37237e0ebf4470c9990d8cb7b07e,
  "@payloadcms/richtext-lexical/rsc#LexicalDiffComponent":
    LexicalDiffComponent_44fe37237e0ebf4470c9990d8cb7b07e,
  "@payload-bites/fullscreen-editor/client#FullscreenEditorFeatureClient":
    FullscreenEditorFeatureClient_aeed5a2881deb7b13c89da9886072b38,
  "@payloadcms/richtext-lexical/client#BlocksFeatureClient":
    BlocksFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#UploadFeatureClient":
    UploadFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#FixedToolbarFeatureClient":
    FixedToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#InlineToolbarFeatureClient":
    InlineToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#HorizontalRuleFeatureClient":
    HorizontalRuleFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#BlockquoteFeatureClient":
    BlockquoteFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#LinkFeatureClient":
    LinkFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#ChecklistFeatureClient":
    ChecklistFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#OrderedListFeatureClient":
    OrderedListFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#UnorderedListFeatureClient":
    UnorderedListFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#IndentFeatureClient":
    IndentFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#AlignFeatureClient":
    AlignFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#HeadingFeatureClient":
    HeadingFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#ParagraphFeatureClient":
    ParagraphFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#InlineCodeFeatureClient":
    InlineCodeFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#SuperscriptFeatureClient":
    SuperscriptFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#SubscriptFeatureClient":
    SubscriptFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#StrikethroughFeatureClient":
    StrikethroughFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#UnderlineFeatureClient":
    UnderlineFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#BoldFeatureClient":
    BoldFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#ItalicFeatureClient":
    ItalicFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/plugin-seo/client#OverviewComponent":
    OverviewComponent_a8a977ebc872c5d5ea7ee689724c0860,
  "@payloadcms/plugin-seo/client#MetaTitleComponent":
    MetaTitleComponent_a8a977ebc872c5d5ea7ee689724c0860,
  "@payloadcms/plugin-seo/client#MetaDescriptionComponent":
    MetaDescriptionComponent_a8a977ebc872c5d5ea7ee689724c0860,
  "@payloadcms/plugin-seo/client#MetaImageComponent":
    MetaImageComponent_a8a977ebc872c5d5ea7ee689724c0860,
  "@payloadcms/plugin-seo/client#PreviewComponent":
    PreviewComponent_a8a977ebc872c5d5ea7ee689724c0860,
  "@payloadcms/next/rsc#FolderTableCell":
    FolderTableCell_f9c02e79a4aed9a3924487c0cd4cafb1,
  "@payloadcms/next/rsc#FolderField":
    FolderField_f9c02e79a4aed9a3924487c0cd4cafb1,
  "@payloadcms/plugin-import-export/rsc#ExportListMenuItem":
    ExportListMenuItem_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#ImportListMenuItem":
    ImportListMenuItem_cdf7e044479f899a31f804427d568b36,
  "@seshuk/payload-media-preview/rsc#MediaPreviewCell":
    MediaPreviewCell_3df7154bbd817bf4bc10925ce5a97d5b,
  "@seshuk/payload-media-preview/rsc#MediaPreview":
    MediaPreview_3df7154bbd817bf4bc10925ce5a97d5b,
  "@payload-bites/image-search/client#ImageSearch":
    ImageSearch_18763abdf72285ba4b0ce56755000778,
  "@payloadcms/plugin-search/client#LinkToDoc":
    LinkToDoc_aead06e4cbf6b2620c5c51c9ab283634,
  "@payloadcms/plugin-search/client#ReindexButton":
    ReindexButton_aead06e4cbf6b2620c5c51c9ab283634,
  "@payloadcms/plugin-import-export/rsc#FormatField":
    FormatField_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#LimitField":
    LimitField_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#Page":
    Page_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#SortBy":
    SortBy_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#SortOrder":
    SortOrder_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#SelectionToUseField":
    SelectionToUseField_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#FieldsToExport":
    FieldsToExport_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#CollectionField":
    CollectionField_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#ExportPreview":
    ExportPreview_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#ExportSaveButton":
    ExportSaveButton_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#ImportPreview":
    ImportPreview_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#ImportSaveButton":
    ImportSaveButton_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/next/client#FolderTypeField":
    FolderTypeField_2b8867833a34864a02ddf429b0728a40,
  "@payloadcms/storage-azure/client#AzureClientUploadHandler":
    AzureClientUploadHandler_635fb302eaf52f6baca4f9f8ad9ce104,
  "@payloadcms/plugin-import-export/rsc#ImportExportProvider":
    ImportExportProvider_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/next/rsc#CollectionCards":
    CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1,
};
