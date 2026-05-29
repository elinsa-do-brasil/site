import Image from "next/image";
import Link from "next/link";

export function DocsHeader() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="rounded-full bg-gray-200 dark:bg-gray-700 p-1">
        <Image
          src="/svg/e.svg"
          alt="Elinsa"
          className="size-6"
          width={24}
          height={24}
        />
      </div>
      <p className="font-medium">Elinsa do Brasil</p>
    </Link>
  );
}
