"use client";
import {
  ArrowLeft as IconArrowNarrowLeft,
  ArrowRight as IconArrowNarrowRight,
  X as IconX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image, { type ImageProps } from "next/image";
import type { ReactNode } from "react";
import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { cn } from "@/lib/utils";

interface CarouselProps {
  items: ReactNode[];
  initialScroll?: number;
}

type CarouselCardData = {
  src: string;
  title: string;
  category: string;
  content: ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselItems = useMemo(() => Children.toArray(items), [items]);

  const checkScrollability = useCallback(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      const { scrollLeft, scrollWidth, clientWidth } = carousel;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [checkScrollability, initialScroll]);

  const scrollLeft = useCallback(() => {
    carouselRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  }, []);

  const scrollRight = useCallback(() => {
    carouselRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  }, []);

  const isMobile = useCallback(() => {
    return typeof window !== "undefined" && window.innerWidth < 768;
  }, []);

  const handleCardClose = useCallback(
    (index: number) => {
      const carousel = carouselRef.current;
      if (!carousel) return;

      const cardWidth = isMobile() ? 230 : 384; // (md:w-96)
      const gap = isMobile() ? 16 : 16;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carousel.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    },
    [isMobile],
  );

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div
            className={cn(
              "pointer-events-none absolute right-0 z-10 h-full w-[8%] overflow-hidden bg-gradient-to-l from-background to-transparent",
            )}
          />

          <div
            className={cn(
              "mx-auto flex max-w-6xl flex-row justify-start gap-4 pl-6 md:pl-8",
            )}
          >
            {carouselItems.map((item, index) => {
              const itemKey =
                isValidElement(item) && item.key != null
                  ? item.key
                  : `carousel-item-${String(item)}`;

              return (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.5,
                      delay: 0.12 * index,
                      ease: "easeOut",
                    },
                  }}
                  key={itemKey}
                  className="rounded-md last:pr-[5%] md:last:pr-[33%]"
                >
                  {item}
                </motion.div>
              );
            })}
          </div>
        </div>
        <div className="mr-6 flex justify-end gap-2 md:mr-10">
          <button
            type="button"
            aria-label="Voltar no carrossel"
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <IconArrowNarrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Avancar no carrossel"
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <IconArrowNarrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: CarouselCardData;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    onCardClose(index);
  }, [index, onCardClose]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleClose, open]);

  useOutsideClick(containerRef, handleClose);

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="relative z-[60] mx-auto my-10 h-fit max-w-5xl rounded-md bg-white p-4 font-sans md:p-10 dark:bg-neutral-900"
            >
              <button
                type="button"
                aria-label="Fechar destaque"
                className="sticky top-4 right-0 ml-auto flex h-8 w-8 items-center justify-center rounded-md bg-black dark:bg-white"
                onClick={handleClose}
              >
                <IconX className="h-6 w-6 text-neutral-100 dark:text-neutral-900" />
              </button>
              <motion.p
                layoutId={layout ? `category-${card.title}` : undefined}
                className="text-base font-medium text-black dark:text-white"
              >
                {card.category}
              </motion.p>
              <motion.p
                layoutId={layout ? `title-${card.title}` : undefined}
                className="mt-4 text-2xl font-semibold text-neutral-700 md:text-5xl dark:text-white"
              >
                {card.title}
              </motion.p>
              <div className="py-10">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="relative z-10 flex h-80 w-80 flex-col items-start justify-start overflow-hidden rounded-md bg-gray-100 md:h-96 md:w-96 dark:bg-neutral-900"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-gradient-to-b from-black/50 via-transparent to-transparent" />
        <div className="relative z-40 p-8">
          <motion.p
            layoutId={layout ? `category-${card.category}` : undefined}
            className="text-left font-sans text-sm font-medium text-white md:text-base"
          >
            {card.category}
          </motion.p>
          <motion.p
            layoutId={layout ? `title-${card.title}` : undefined}
            className="mt-2 max-w-xs text-left font-sans text-xl font-semibold [text-wrap:balance] text-white md:text-3xl"
          >
            {card.title}
          </motion.p>
        </div>
        <BlurImage
          src={card.src}
          alt={card.title}
          fill
          sizes="(min-width: 768px) 24rem, 20rem"
          className="absolute inset-0 z-10 object-cover"
        />
      </motion.button>
    </>
  );
};

export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  ...rest
}: ImageProps) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <Image
      className={cn(
        "transition duration-300",
        isLoading ? "blur-sm" : "blur-0",
        className,
      )}
      onLoad={() => setLoading(false)}
      src={src}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      blurDataURL={typeof src === "string" ? src : undefined}
      alt={alt ? alt : "Background of a beautiful view"}
      {...rest}
    />
  );
};
