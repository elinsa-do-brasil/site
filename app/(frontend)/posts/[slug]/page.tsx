import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const { isEnabled: isDraftMode } = await draftMode()

  // Busca o post no Payload
  const { docs } = await payload.find({
    collection: 'posts',
    draft: isDraftMode, // Se estiver no Live Preview, busca também os rascunhos
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  const post = docs[0]

  if (!post) {
    return notFound()
  }

  const coverImage = post.coverImage as Record<string, unknown> | null | undefined
  const hasImage = coverImage && typeof coverImage === 'object' && typeof coverImage.url === 'string'

  return (
    <main className="min-h-screen bg-background">
      {/* Draft mode banner */}
      {isDraftMode && (
        <div className="sticky top-0 z-50 bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-amber-950">
          Modo de Pré-visualização (Live Preview)
        </div>
      )}

      {/* Back navigation */}
      <div className="mx-auto max-w-4xl px-6 pt-8">
        <Link
          href="/posts"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-elinsa-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Voltar para Notícias
        </Link>
      </div>

      <article className="mx-auto max-w-4xl px-6 pb-20">
        {/* Article header */}
        <header className="pb-8 pt-8">
          <time
            dateTime={post.createdAt}
            className="mb-4 inline-block text-sm font-medium text-elinsa-primary"
          >
            {formatDate(post.createdAt)}
          </time>

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-elinsa-dark sm:text-4xl lg:text-[2.75rem]">
            {post.title}
          </h1>
        </header>

        {/* Cover image */}
        {hasImage && (
          <figure className="mb-10 overflow-hidden rounded-xl">
            <div className="relative aspect-[21/9] w-full bg-elinsa-light/40">
              <Image
                src={coverImage.url as string}
                alt={(coverImage.alt as string) || post.title}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
                priority
              />
            </div>
          </figure>
        )}

        {/* Separator */}
        <div className="mb-10 h-px w-full bg-gradient-to-r from-transparent via-elinsa-primary/25 to-transparent" />

        {/* Rich text content */}
        <div className="prose prose-lg mx-auto max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-elinsa-dark prose-p:leading-relaxed prose-p:text-foreground/85 prose-a:font-medium prose-a:text-elinsa-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-elinsa-primary/40 prose-blockquote:text-foreground/70 prose-strong:text-foreground prose-img:rounded-lg">
          {post.content && <RichText data={post.content as any} />}
        </div>

        {/* Footer separator */}
        <div className="mt-16 mb-8 h-px w-full bg-gradient-to-r from-transparent via-elinsa-primary/25 to-transparent" />

        {/* Back to posts */}
        <div className="flex justify-center">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 rounded-full border border-elinsa-primary/20 bg-elinsa-light/40 px-6 py-2.5 text-sm font-semibold text-elinsa-dark transition-all duration-200 hover:border-elinsa-primary/40 hover:bg-elinsa-light hover:shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Ver todas as notícias
          </Link>
        </div>
      </article>
    </main>
  )
}
