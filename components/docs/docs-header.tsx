import Image from "next/image";

export function DocsHeader() {
  return (
    <>
      <div className="flex items-center gap-2 rounded-full bg-gray-200 dark:bg-gray-700 p-1">
        <Image
          src="/svg/e.svg"
          alt="Elinsa"
          className="size-6"
          width={24}
          height={24}
        />
      </div>
      <p className="font-medium">Elinsa do Brasil</p>
    </>
  );
}
