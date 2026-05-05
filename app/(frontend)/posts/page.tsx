import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}

export default async function PostsListingPage() {
  const payload = await getPayload({ config: configPromise })

  const { docs: posts } = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 12,
    sort: '-createdAt', // Mais recentes primeiro
  })

  return (
    <main className="min-h-screen bg-background">
      {/* Hero header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-elinsa-dark via-elinsa-primary to-elinsa-sky py-20 px-6 sm:py-28">
        {/* Decorative background pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-elinsa-light/80">
            Elinsa do Brasil
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Notícias
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-elinsa-light/70">
            Acompanhe as últimas novidades, comunicados e atualizações da Elinsa.
          </p>
        </div>
      </header>

      {/* Post listing */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-elinsa-primary/20 bg-elinsa-light/30 px-8 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-elinsa-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-elinsa-primary"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" x2="8" y1="13" y2="13" />
                <line x1="16" x2="8" y1="17" y2="17" />
                <line x1="10" x2="8" y1="9" y2="9" />
              </svg>
            </div>
            <p className="text-lg font-medium text-elinsa-dark">
              Nenhum post publicado ainda
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Novos conteúdos serão exibidos aqui em breve.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const coverImage = post.coverImage as Record<string, unknown> | null | undefined
              const hasImage = coverImage && typeof coverImage === 'object' && typeof coverImage.url === 'string'

              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-elinsa-primary/8 hover:border-elinsa-primary/30"
                >
                  {/* Cover image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-elinsa-light/40">
                    {hasImage ? (
                      <Image
                        src={coverImage.url as string}
                        alt={(coverImage.alt as string) || post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-elinsa-light to-elinsa-sky/20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-elinsa-primary/30"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h2 className="text-lg font-semibold leading-snug text-elinsa-dark transition-colors duration-200 group-hover:text-elinsa-primary line-clamp-2">
                        {post.title}
                      </h2>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                      <time
                        dateTime={post.createdAt}
                        className="text-xs font-medium text-muted-foreground"
                      >
                        {formatDate(post.createdAt)}
                      </time>
                      <span className="flex items-center gap-1 text-xs font-semibold text-elinsa-primary transition-transform duration-200 group-hover:translate-x-0.5">
                        Ler
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
